import sqlite3, json, datetime as dt

def init_db(path):
    with sqlite3.connect(path) as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS raw_events(
          id INTEGER PRIMARY KEY,
          host TEXT NOT NULL,
          object_type TEXT NOT NULL,          
          created_at TEXT NOT NULL,
          payload TEXT NOT NULL
        )""")

def save_raw(path, host, object_type, data):
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    with sqlite3.connect(path) as c:
        c.execute(
            "INSERT INTO raw_events(host,object_type,created_at,payload) VALUES(?,?,?,?)",
            (host, object_type, now, json.dumps(data))
        )

def cleanup_retention(path, days):
    with sqlite3.connect(path) as c:
        c.execute("DELETE FROM raw_events WHERE created_at < datetime('now','-%d days')" % days)
