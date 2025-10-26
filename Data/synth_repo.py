import sqlite3
from datetime import datetime, timezone


def append_repo_state(db_path: str,
                      repo_id: str,
                      host: str,
                      name: str = None,
                      rtype: str = None,
                      path: str = None,
                      capacity_gb: float = None,
                      free_gb: float = None,
                      used_gb: float = None,
                      is_online: str = None,       # "true"/"false"
                      is_out_of_date: str = None,  # "true"/"false"
                      created_at: str = None       # ISO 8601; если None — сейчас (UTC)
                      ) -> bool:

    if created_at is None:
        created_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

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
        cur = c.execute("""
        INSERT OR IGNORE INTO repo_states
        (repo_id, host, name, rtype, path, capacity_gb, free_gb, used_gb, is_online, is_out_of_date, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, (repo_id, host, name, rtype, path, capacity_gb, free_gb, used_gb, is_online, is_out_of_date, created_at))
        return cur.rowcount == 1

append_repo_state(
    "data_synth.db",
    repo_id="1",
    host="mybackup.local",
    name="Default Backup Reposotory",
    rtype="WinLocal",
    path=r"C:\Backup Repository",
    capacity_gb=300.0,
    free_gb=210.5,
    used_gb=89.5,
    is_online="true",
    is_out_of_date="false",
    created_at="2025-10-16T03:00:00Z"
)

append_repo_state(
    "data_synth.db",
    repo_id="2",
    host="mybackup.local",
    name="MyRepo1",
    rtype="WinLocal",
    path=r"C:\MyRepo",
    capacity_gb=300.0,
    free_gb=210.5,
    used_gb=89.5,
    is_online="true",
    is_out_of_date="false",
    created_at="2025-10-16T03:00:00Z"
)