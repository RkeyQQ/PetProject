import sqlite3
from contextlib import contextmanager
from pathlib import Path
import os

DEFAULT_DB_PATH = Path("Data") / "data_synth.db"

DB_PATH = Path(os.environ.get("DB_PATH", DEFAULT_DB_PATH))

@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.row_factory = sqlite3.Row
        yield conn
    finally:
        conn.close()
