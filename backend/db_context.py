import sqlite3
from contextlib import contextmanager
from pathlib import Path
import os

# Absolute path to backend
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "data_synth.db"

# Using environment variable, just incase we want to override the DB path
DB_PATH = Path(os.environ.get("DB_PATH", str(DEFAULT_DB_PATH)))


@contextmanager
def get_conn():
    """Context manager to get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.row_factory = sqlite3.Row
        yield conn
    finally:
        conn.close()
