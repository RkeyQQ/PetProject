"""FastAPI chat router integrating OpenAI.

Answer user questions based on database-backed data.

This module implements a two-step LLM workflow:
1. Analyze the user's question and determine whether a SQL SELECT query
   is required to retrieve data from the database.
2. If required, validate and execute the query, then use the results to
   generate a final response.

Features:
- SQL validation
- Rate limiting
- Separation of system and final response prompts
- Handling of OpenAI API errors and quota limits
- Language-aware responses matching the user's input language
"""

import asyncio
import json
import logging
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Request, status
from openai import APIError, OpenAI, RateLimitError
from pydantic import BaseModel, Field

from backend.db_context import get_conn
from backend.secrets import get_openai_api_key
from backend.sql.schema_allowlist import ALLOWED_TABLES

logger = logging.getLogger(__name__)
router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[1]

# LLM configuration
LLM_MODEL = "gpt-4.1-nano"
SYSTEM_PROMPT = (BASE_DIR / "prompts" / "system_prompt.txt").read_text(encoding="utf-8")
FINAL_RESPONSE_PROMPT = (BASE_DIR / "prompts" / "final_response_prompt.txt").read_text(
    encoding="utf-8"
)
ALLOWED_ROLES = {"user", "assistant"}

# Rate limiting configuration
OPENAI_REQUEST_TIMEOUT = 30  # seconds
MAX_USER_MESSAGE_LENGTH = 250  # Max length for user messages
MAX_HISTORY_MESSAGE_LENGTH = 500  # Max length for history messages
RATE_LIMIT_REQUESTS = 1  # requests
RATE_LIMIT_WINDOW = 30  # seconds
MAX_HISTORY_MESSAGES = 3  # Max messages from history to include
MAX_TOKENS_DECISION = 120  # Tokens for initial query decision
MAX_TOKENS_FINAL = 160  # Tokens for final response
DECISION_TEMPERATURE = 0.2  # Temperature for query decision
FINAL_TEMPERATURE = 0.7  # Temperature for final response
MAX_QUERY_ROWS = 20  # Max rows to return in final response
MAX_DISPLAY_ROWS = 20  # Max rows to display to user in final response

# Runtime state
_rate_lock = asyncio.Lock()
_request_times_by_key: dict[str, deque[float]] = defaultdict(deque)


try:
    OPENAI_API_KEY = get_openai_api_key()
    client = OpenAI(api_key=OPENAI_API_KEY)
except ValueError as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    client = None


class Message(BaseModel):
    """Single message in conversation."""

    role: Literal["user", "assistant"] = Field(..., description="'user' or 'assistant'")
    content: str = Field(
        ...,
        min_length=1,
        max_length=MAX_HISTORY_MESSAGE_LENGTH,
        description="Message text",
    )


class ChatRequest(BaseModel):
    """Chat API request."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=MAX_USER_MESSAGE_LENGTH,
        description="User's question",
    )
    history: Optional[list[Message]] = Field(
        default=None, description="Conversation history for context"
    )


class ChatResponse(BaseModel):
    """Chat API response."""

    reply: str = Field(..., description="Assistant's response")
    meta: dict = Field(
        default_factory=dict, description="Metadata (tokens, model, etc.)"
    )


async def check_rate_limit(key: str) -> bool:
    """Return True if request is allowed for this key within the rate window."""
    now = time.time()

    async with _rate_lock:
        times = _request_times_by_key[key]

        while times and now - times[0] >= RATE_LIMIT_WINDOW:
            times.popleft()

        if len(times) >= RATE_LIMIT_REQUESTS:
            return False

        times.append(now)
        return True


def validate_sql_query(sql_query: str) -> tuple[bool, Optional[str]]:
    """Validate SQL query against allowed patterns and tables.

    Returns (is_valid, error_message)
    """
    if not sql_query:
        return False, "SQL query is empty"

    sql = sql_query.strip()
    sql_upper = sql.upper()

    # Only SELECT
    if not sql_upper.startswith("SELECT"):
        return False, "Only SELECT queries are allowed"

    # No multiple statements / comments
    forbidden = (";", "--", "/*", "*/")
    if any(x in sql for x in forbidden):
        return False, "Forbidden SQL tokens"

    # Whitelist tables
    for table in ALLOWED_TABLES:
        if f"FROM {table.upper()}" in sql_upper:
            return True, None

    return False, "Query references non-allowed tables"


def execute_data_query(sql_query: str) -> dict:
    """Execute a SELECT query.

    Returns dictionary with 'success', 'data', 'row_count', and optional 'error'.
    """
    # Validate query
    is_valid, error_msg = validate_sql_query(sql_query)
    if not is_valid:
        logger.warning(f"Invalid SQL query: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
        }

    sql = sql_query.strip()
    sql_upper = sql.upper()

    # auto-limit
    if " LIMIT " not in sql_upper:
        sql = f"{sql} LIMIT {MAX_QUERY_ROWS}"

    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(sql)
            rows = cursor.fetchall()

            # Convert to list of dicts
            results = [dict(row) for row in rows]

            return {
                "success": True,
                "data": results,
                "row_count": len(results),
            }
    except Exception as e:
        logger.error(f"Query execution failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Database error: {str(e)[:100]}",
        }


def format_query_results_for_user(query_result: dict) -> str:
    """Format query results as readable text for final user response."""
    if not query_result.get("success"):
        return f"Unable to retrieve data: {query_result.get('error', 'Unknown error')}"

    data = query_result.get("data", [])
    if not data:
        return "No data found matching your criteria."

    # For single value (COUNT, SUM, etc.)
    if len(data) == 1 and len(data[0]) == 1:
        value = list(data[0].values())[0]
        return f"Result: {value}"

    # For small result sets, return as formatted list
    if len(data) <= MAX_DISPLAY_ROWS:
        result_lines = []
        for row in data:
            if len(row) == 1:
                # Single column
                result_lines.append(f"- {list(row.values())[0]}")
            else:
                # Multiple columns
                items = [f"{k}: {v}" for k, v in row.items()]
                result_lines.append(", ".join(items))
        return "\n".join(result_lines)

    # For large result sets, summarize
    summary_lines = [f"Found {len(data)} results. Showing first {MAX_DISPLAY_ROWS}:"]
    for row in data[:MAX_DISPLAY_ROWS]:
        if len(row) == 1:
            summary_lines.append(f"- {list(row.values())[0]}")
        else:
            items = [f"{k}: {v}" for k, v in row.items()]
            summary_lines.append(", ".join(items))
    summary_lines.append(f"... and {len(data) - MAX_DISPLAY_ROWS} more results")
    return "\n".join(summary_lines)


@router.post("/ask", response_model=ChatResponse)
async def chat_ask(request: ChatRequest, http_request: Request):
    """Ask assistant a question.

    Handle a chat request using a two-step LLM workflow.

    First, the LLM analyzes the user's question and decides whether a database
    query is required. If so, a validated SELECT query is executed and the
    results are used to generate a final natural-language response.
    """
    client_ip = http_request.client.host if http_request.client else "unknown"

    if client is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI client not initialized",
        )

    # Check prerequisites
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured. Set OPENAI_API_KEY environment "
            "variable.",
        )

    # Rate limiting per IP
    if not await check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Too many requests. Maximum {RATE_LIMIT_REQUESTS} requests per "
                f"{RATE_LIMIT_WINDOW} seconds."
            ),
        )

    try:
        # Build conversation history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if request.history:
            for msg in request.history[-MAX_HISTORY_MESSAGES:]:
                if msg.role in ALLOWED_ROLES:
                    messages.append({"role": msg.role, "content": msg.content})

        # Add current user message
        messages.append({"role": "user", "content": request.message})

        # Call OpenAI API to get query decision
        logger.info(f"User message: {request.message}")

        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            temperature=DECISION_TEMPERATURE,
            max_tokens=MAX_TOKENS_DECISION,
            timeout=OPENAI_REQUEST_TIMEOUT,
        )

        assistant_text = (response.choices[0].message.content or "").strip()
        logger.info(f"Assistant response: {assistant_text}")

        # Try to parse JSON response
        try:
            parsed = json.loads(assistant_text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON: {assistant_text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service returned invalid response. Please try again.",
            )

        needs_query = parsed.get("needs_query", False)
        sql_query = parsed.get("sql")

        # If query is needed, execute it
        final_reply = ""
        if needs_query and sql_query:
            logger.info(f"Executing SQL: {sql_query}")
            query_result = execute_data_query(sql_query)

            if query_result.get("success"):
                # Format results
                formatted_data = format_query_results_for_user(query_result)

                # Ask LLM to provide final answer based on data
                final_messages = [
                    {"role": "system", "content": FINAL_RESPONSE_PROMPT},
                    {
                        "role": "user",
                        "content": f"""Based on this data: {formatted_data}
                        Please answer the user's original question: "{request.message}"
                        Answer concisely and naturally.""",
                    },
                ]

                # Get final response from LLM
                final_response = client.chat.completions.create(
                    model=LLM_MODEL,
                    messages=final_messages,
                    temperature=FINAL_TEMPERATURE,
                    max_tokens=MAX_TOKENS_FINAL,
                    timeout=OPENAI_REQUEST_TIMEOUT,
                )
                final_reply = (final_response.choices[0].message.content or "").strip()
            else:
                final_reply = f"Unable to retrieve data: {query_result.get('error')}"
        else:
            final_reply = "I cannot answer this question based on the available data."

        return ChatResponse(
            reply=final_reply,
            meta={
                "tokens_used": response.usage.total_tokens if response.usage else None,
                "model": response.model,
                "query_executed": needs_query,
            },
        )

    except RateLimitError:
        logger.warning("OpenAI rate limit exceeded")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="OpenAI API rate limit exceeded. Please wait before trying again.",
        )
    except APIError as e:
        error_msg = str(e).lower()

        if "free trial" in error_msg or "quota" in error_msg or "exceeded" in error_msg:
            logger.error("OpenAI Free trial limit exceeded")
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="OpenAI Free trial credits exhausted or usage limit exceeded. "
                "Please add a payment method to your OpenAI account.",
            )
        elif "invalid api key" in error_msg:
            logger.error("Invalid OpenAI API key")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OpenAI API key. Check your OPENAI_API_KEY environment "
                "variable.",
            )
        elif "model" in error_msg:
            logger.error("Model error")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OpenAI API error: Model temporarily unavailable. Please try "
                "again later.",
            )
        else:
            logger.error(f"OpenAI API error: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OpenAI API service error. Please try again later.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error. Please try again or contact support.",
        )
