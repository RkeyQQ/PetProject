import sqlite3
from datetime import datetime, timezone


def append_job_state(db_path: str,
                     job_id: str,
                     host: str,
                     name: str = None,
                     jtype: str = None,
                     last_result: str = None,   # Success / Warning / Failed
                     is_running: str = None,    # "true"/"false"
                     progress: float = None,
                     last_run: str = None,
                     next_run: str = None,
                     created_at: str = None
                     ) -> bool:

    if created_at is None:
        created_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

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
        cur = c.execute("""
        INSERT OR IGNORE INTO job_states
        (job_id, host, name, jtype, last_result, is_running, progress, last_run, next_run, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
        """, (job_id, host, name, jtype, last_result, is_running, progress, last_run, next_run, created_at))
        return cur.rowcount == 1

append_job_state(
    "data_synth.db",
    job_id="1",
    host="mybackup.local",
    name="VM Backup",
    jtype="Backup",
    last_result="Success",
    is_running="false",
    progress=100.0,
    last_run="2025-10-16T02:00:00Z",
    next_run="2025-10-17T02:00:00Z"
)

append_job_state(
    "data_synth.db",
    job_id="2",
    host="mybackup.local",
    name="VM Backup 2",
    jtype="Backup",
    last_result="Success",
    is_running="false",
    progress=100.0,
    last_run="2025-10-16T02:00:00Z",
    next_run="2025-10-17T02:00:00Z"
)