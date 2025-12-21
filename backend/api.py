import os
from dotenv import load_dotenv

# Load .env.local FIRST before any other imports
load_dotenv(".env.local")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import demo
from backend.routers import dbutils
from backend.routers import chat

app = FastAPI(title="Monitoring Hub API", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/status")
def status():
    """Return the status."""
    return {"status": "ok"}


app.include_router(demo.router, prefix="/api/demo", tags=["Data For Demo"])
app.include_router(dbutils.router, prefix="/api/db", tags=["Database Utilities"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat AI"])
