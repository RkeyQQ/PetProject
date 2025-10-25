from fastapi import APIRouter, HTTPException
from app.db_context import get_conn

router = APIRouter()


@router.get("/ping")
def db_ping():
    """Return version and tables in API."""
    try:
        with get_conn() as conn:
            v = conn.execute("select sqlite_version() as v").fetchone()["v"]
            tables = conn.execute(
                "select name from sqlite_master where type='table' order by name"
            ).fetchall()
            return {
                "sqlite_version": v,
                "tables": [r["name"] for r in tables],
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
