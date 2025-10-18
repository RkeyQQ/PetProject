from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import random

from app.db import get_conn  # добавили импорт

router = APIRouter()

@router.get("/summary")
def demo_summary():
    """Synth to test - remove later"""
    return {
        "targets": 5,
        "jobs": 12,
        "lastRunAt": datetime.utcnow().isoformat() + "Z",
        "okRate": round(random.uniform(0.8, 0.99), 2),
    }


@router.get("/series")
def demo_series(points: int = 30):
    """Synth to test - remove later"""
    now = datetime.utcnow()
    data = []
    for i in range(points):
        t = now - timedelta(minutes=points - i)
        value = 70 + random.randint(-5, 5)
        data.append({"ts": t.isoformat() + "Z", "value": value})
    return {"series": data}


@router.get("/summary-db")
def demo_summary_from_db():
    """Counters to test - remove later"""
    try:
        with get_conn() as conn:
            cnt_job = conn.execute("SELECT COUNT(*) AS c FROM job_states").fetchone()["c"]
            cnt_repo = conn.execute("SELECT COUNT(*) AS c FROM repo_states").fetchone()["c"]
        return {
            "job_states_rows": cnt_job,
            "repo_states_rows": cnt_repo,
            "pulledAt": datetime.utcnow().isoformat() + "Z",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))