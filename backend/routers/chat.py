"""
Chat API router with OpenAI integration for natural language queries over backup data.
Handles multilingual questions and generates SQL queries to answer them.
Optimized for Free tier OpenAI usage with proper error handling and rate limiting.
"""

import json
import logging
import os
import time
from typing import Optional
from functools import lru_cache

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from openai import OpenAI, APIError, RateLimitError

from backend.db_context import get_conn

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Rate limiting
RATE_LIMIT_REQUESTS = 3
RATE_LIMIT_WINDOW = 60  # seconds
request_times = []


class Message(BaseModel):
    """Single message in conversation."""

    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    """Chat API request."""

    message: str = Field(
        ..., min_length=1, max_length=500, description="User's question"
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


# Enhanced system prompt with detailed schema and examples
SYSTEM_PROMPT = """You are a backup monitoring data analyst assistant. Your role is to answer questions about backup jobs and repositories based on real database data.

## Available Tables:

### Table: job_states
Description: Information about backup jobs and their execution status
Columns:
- last_result (TEXT): Job execution result. Values: 'Success', 'Failed', 'Warning', 'Pending'
- name (TEXT): Name of the backup job (e.g., 'VM backup', 'Database backup', 'File Server backup')
- host (TEXT): Hostname of the backup server
- jtype (TEXT): Type of job. Values: 'Full', 'Incremental', 'Differential'
- last_run (TEXT): ISO datetime of when the job was last executed (e.g., '2024-12-21 10:30:00')
- next_run (TEXT): ISO datetime when the job is scheduled to run next
- created_at (TEXT): ISO datetime when the job was created

### Table: repo_states
Description: Information about backup repositories and their storage capacity
Columns:
- host (TEXT): Hostname of the backup server where repository is located
- name (TEXT): Repository name (e.g., 'Default Backup Repository', 'MyRepo1', 'Archive')
- rtype (TEXT): Repository type. Values: 'NTFS', 'ReFS', 'SMB', 'NFS'
- path (TEXT): File system path to the repository
- capacity_gb (FLOAT): Total storage capacity in gigabytes
- free_gb (FLOAT): Free space available in gigabytes
- used_gb (FLOAT): Used space in gigabytes
- is_online (INTEGER): 1 if repository is online, 0 if offline
- is_out_of_date (INTEGER): 1 if repository data is out of date, 0 if current
- created_at (TEXT): ISO datetime when repository record was created

## Your Task:
1. Listen to user questions in ANY language (Russian, English, Chinese, Spanish, etc.)
2. Understand what data the user is asking for
3. If you need database data, analyze what SQL SELECT query would retrieve it
4. Return ONLY a JSON object with this exact structure:
{
  "needs_query": true/false,
  "sql": "SELECT ... FROM ... WHERE ..." (only if needs_query is true),
  "reasoning": "brief explanation of what you're querying for"
}
5. Do NOT include any other text, explanations, or formatting - only the JSON object
6. Always respond with valid JSON

## SQL Query Guidelines:
- Use column names exactly as listed above (lowercase with underscores)
- Use CASE-INSENSITIVE LIKE for searching job/repo names: name LIKE '%search_term%'
- For counting: SELECT COUNT(*) as count FROM table WHERE condition
- For summing: SELECT SUM(free_gb) as total_free FROM repo_states
- For filtering by status: WHERE last_result = 'Success' (match exact values)
- For date comparisons: Use ISO datetime format '2024-12-21'
- Always use LIMIT 100 for large result sets
- Validate queries are SELECT only - NO INSERT, UPDATE, DELETE, DROP

## Examples of Good Queries:
1. Q: "How many jobs succeeded?" 
   A: {"needs_query": true, "sql": "SELECT COUNT(*) as count FROM job_states WHERE last_result = 'Success'", "reasoning": "Count jobs with Success status"}

2. Q: "Сколько джоб закончилось success?" (Russian)
   A: {"needs_query": true, "sql": "SELECT COUNT(*) as count FROM job_states WHERE last_result = 'Success'", "reasoning": "Count jobs with Success status"}

3. Q: "List names of failed jobs"
   A: {"needs_query": true, "sql": "SELECT name FROM job_states WHERE last_result = 'Failed' ORDER BY name", "reasoning": "Get all job names that failed"}

4. Q: "When was VM backup last executed?"
   A: {"needs_query": true, "sql": "SELECT last_run FROM job_states WHERE name LIKE '%VM backup%'", "reasoning": "Find last execution time for VM backup job"}

5. Q: "Total free space on all repositories"
   A: {"needs_query": true, "sql": "SELECT SUM(free_gb) as total_free_gb FROM repo_states", "reasoning": "Sum free space across all repos"}

6. Q: "Free space on Default Backup Repository"
   A: {"needs_query": true, "sql": "SELECT free_gb FROM repo_states WHERE name = 'Default Backup Repository'", "reasoning": "Get free space for specific repository"}

## Important Rules:
- ALWAYS respond with JSON only, no other text
- NEVER include markdown formatting, code blocks, or explanations
- Be precise with column names and table names
- If user question doesn't need database query, still return JSON: {"needs_query": false, "sql": null, "reasoning": "explanation"}
"""


def check_rate_limit() -> bool:
    """Check if request is within rate limit (Free tier protection)."""
    global request_times
    now = time.time()

    # Remove old requests outside the window
    request_times = [t for t in request_times if now - t < RATE_LIMIT_WINDOW]

    if len(request_times) >= RATE_LIMIT_REQUESTS:
        return False

    request_times.append(now)
    return True


def validate_sql_query(sql_query: str) -> tuple[bool, Optional[str]]:
    """
    Validate SQL query for security and correctness.
    Returns (is_valid, error_message)
    """
    if not sql_query:
        return False, "SQL query is empty"

    sql_upper = sql_query.strip().upper()

    # Only SELECT allowed
    if not sql_upper.startswith("SELECT"):
        return False, "Only SELECT queries are allowed"

    # Block dangerous operations
    dangerous_keywords = [
        "INSERT",
        "UPDATE",
        "DELETE",
        "DROP",
        "ALTER",
        "CREATE",
        "TRUNCATE",
        "EXEC",
        "UNION",
    ]
    if any(kw in sql_upper for kw in dangerous_keywords):
        return False, f"Query contains forbidden operations"

    # Check for comment injection
    if "--" in sql_query or "/*" in sql_query:
        return False, "SQL comments are not allowed"

    return True, None


def execute_data_query(sql_query: str) -> dict:
    """
    Execute a SELECT query on the backup data.
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

    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(sql_query)
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
    if len(data) <= 20:
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
    summary_lines = [f"Found {len(data)} results. Showing first 20:"]
    for row in data[:20]:
        if len(row) == 1:
            summary_lines.append(f"- {list(row.values())[0]}")
        else:
            items = [f"{k}: {v}" for k, v in row.items()]
            summary_lines.append(", ".join(items))
    summary_lines.append(f"... and {len(data) - 20} more results")
    return "\n".join(summary_lines)


def retry_api_call(max_retries: int = 3) -> callable:
    """Decorator for retrying API calls with exponential backoff."""

    def decorator(func):
        async def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except RateLimitError as e:
                    if attempt < max_retries - 1:
                        wait_time = (2**attempt) + 1  # Exponential backoff
                        logger.warning(
                            f"Rate limited. Retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})"
                        )
                        time.sleep(wait_time)
                    else:
                        raise
                except APIError as e:
                    if "free trial" in str(e).lower() or "quota" in str(e).lower():
                        raise HTTPException(
                            status_code=status.HTTP_402_PAYMENT_REQUIRED,
                            detail="OpenAI API quota exceeded. Please check your account or add payment method.",
                        )
                    raise
            return None

        return wrapper

    return decorator


@router.post("/ask", response_model=ChatResponse)
async def chat_ask(request: ChatRequest):
    """
    Ask the backup data assistant a question.
    Supports multilingual questions and generates SQL queries to retrieve accurate data.
    """
    # Check prerequisites
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured. Set OPENAI_API_KEY environment variable.",
        )

    # Rate limiting for Free tier
    if not check_rate_limit():
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Maximum {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds.",
        )

    try:
        # Build conversation history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if request.history:
            for msg in request.history:
                messages.append({"role": msg.role, "content": msg.content})

        # Add current user message
        messages.append({"role": "user", "content": request.message})

        # Call OpenAI API to get query decision
        logger.info(f"User message: {request.message}")

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Use cheaper model for free tier
            messages=messages,
            temperature=0.2,  # Lower temperature for more consistent responses
            max_tokens=300,  # Limit tokens to reduce costs
            timeout=30,
        )

        assistant_text = response.choices[0].message.content.strip()
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
        reasoning = parsed.get("reasoning", "")

        # If query is needed, execute it
        final_reply = ""
        if needs_query and sql_query:
            logger.info(f"Executing SQL: {sql_query}")
            query_result = execute_data_query(sql_query)

            if query_result.get("success"):
                # Format results
                formatted_data = format_query_results_for_user(query_result)

                # Ask LLM to provide final answer based on data
                messages.append({"role": "assistant", "content": assistant_text})
                messages.append(
                    {
                        "role": "user",
                        "content": f"""Based on this data from the database:

{formatted_data}

Please answer the user's original question: "{request.message}"

Answer concisely and naturally. Respond in the same language as the original question.""",
                    }
                )

                # Get final response from LLM
                final_response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500,
                    timeout=30,
                )
                final_reply = final_response.choices[0].message.content.strip()
            else:
                final_reply = f"Unable to retrieve data: {query_result.get('error')}"
        else:
            final_reply = "I cannot answer this question based on the available data."

        return ChatResponse(
            reply=final_reply,
            meta={
                "tokens_used": response.usage.total_tokens,
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
                detail="OpenAI Free trial credits exhausted or usage limit exceeded. Please add a payment method to your OpenAI account.",
            )
        elif "invalid api key" in error_msg:
            logger.error("Invalid OpenAI API key")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OpenAI API key. Check your OPENAI_API_KEY environment variable.",
            )
        elif "model" in error_msg:
            logger.error("Model error")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OpenAI API error: Model temporarily unavailable. Please try again later.",
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
            detail=f"Internal server error. Please try again or contact support.",
        )
