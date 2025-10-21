import sqlite3
import json
import datetime as dt


def init_db(db_path):
    """Initialize the raw_events table in the database."""
    with sqlite3.connect(db_path) as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS raw_events(
          id INTEGER PRIMARY KEY,
          host TEXT NOT NULL,
          object_type TEXT NOT NULL,
          created_at TEXT NOT NULL,
          payload TEXT NOT NULL
        )""")


def save_raw(db_path, host, object_type, data):
    """Save raw data into the raw_events table."""
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    with sqlite3.connect(db_path) as c:
        c.execute(
            "INSERT INTO raw_events("
            "host,object_type,created_at,payload"
            ") VALUES(?,?,?,?)",
            (host, object_type, now, json.dumps(data)),
        )


def cleanup_retention(db_path, days):
    """Clean up old raw events based on retention policy.

    Removes all records older than the specified number of days
    based on the 'created_at' timestamp.

    Args:
        db_path (str): Path to the SQLite database file.
        days (int): Number of days to keep records. Older records are deleted.

    """
    with sqlite3.connect(db_path) as c:
        c.execute(
            "DELETE FROM raw_events WHERE created_at < datetime('now','-%d days')"
            % days
        )


def init_repo_state_table(db_path):
    """Initialize the repo_states table in the database.

    Args:
        db_path (str): Path to the SQLite database file.

    """
    with sqlite3.connect(db_path) as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS repo_states (
          repo_id TEXT NOT NULL,
          host TEXT NOT NULL,
          name TEXT,
          rtype TEXT,
          path TEXT,
          capacity_gb REAL,
          free_gb REAL,
          used_gb REAL,
          is_online TEXT,
          is_out_of_date TEXT,
          created_at TEXT NOT NULL,
          PRIMARY KEY (repo_id, created_at)
        )""")


def load_repo_states(db_path, host, payload):
    """Load repository states into the repo_states table.

    Args:
        db_path (str): Path to the SQLite database file.
        host (str): Hostname of the VBR server.
        payload (dict): Payload containing repository states data.

    """
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    rows = []
    for it in payload.get("data", []):
        rows.append(
            (
                it.get("id"),
                host,
                it.get("name"),
                it.get("type"),
                it.get("path"),
                it.get("capacityGB"),
                it.get("freeGB"),
                it.get("usedSpaceGB"),
                str(bool(it.get("isOnline"))).lower(),
                str(it.get("isOutOfDate")),
                now,
            )
        )
    if not rows:
        return
    with sqlite3.connect(db_path) as c:
        c.executemany(
            (
                "INSERT INTO repo_states("
                "repo_id, host, name, rtype, path,"
                "capacity_gb, free_gb, used_gb,"
                "is_online, is_out_of_date, created_at"
                ") VALUES (?,?,?,?,?,?,?,?,?,?,?)"
            ),
            rows,
        )


def init_job_state_table(db_path):
    """Initialize the job_states table in the database.

    Args:
        db_path (str): Path to the SQLite database file.

    """
    with sqlite3.connect(db_path) as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS job_states (
          job_id TEXT NOT NULL,
          host TEXT NOT NULL,
          name TEXT,
          jtype TEXT,
          last_result TEXT,
          is_running TEXT,
          progress REAL,
          last_run TEXT,
          next_run TEXT,
          created_at TEXT NOT NULL,
          PRIMARY KEY (job_id, created_at)
        )""")


def load_job_states(db_path, host, payload):
    """Load job states into the job_states table.

    Args:
        db_path (str): Path to the SQLite database file.
        host (str): Hostname of the VBR server.
        payload (dict): Payload containing job states data.

    """
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    rows = []
    for it in payload.get("data", []):
        rows.append(
            (
                it.get("id"),
                host,
                it.get("name"),
                it.get("type"),
                it.get("lastResult"),
                str(bool(it.get("isRunning"))).lower(),
                it.get("progress"),
                it.get("lastRun"),
                it.get("nextRun"),
                now,
            )
        )
    if not rows:
        return
    with sqlite3.connect(db_path) as c:
        c.executemany(
            """
        INSERT INTO job_states(
          job_id, host, name, jtype, last_result, is_running,
          progress, last_run, next_run, created_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?)""",
            rows,
        )
