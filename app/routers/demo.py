from fastapi import APIRouter, HTTPException, Query

from app.db_context import get_conn

router = APIRouter()


@router.get("/table/{name}/rows")
def table_rows(
    name: str,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Review tables.

    Security: table name validate by sqlite_master
    LIMIT/OFFSET params.
    """
    try:
        with get_conn() as conn:
            # check if exists
            row = conn.execute(
                "select name from sqlite_master where type='table' and name=?",
                (name,),
            ).fetchone()
            if not row:
                raise HTTPException(status_code=404, detail=f"Table '{name}' not found")

            # get lines with limit/offset
            cur = conn.execute(
                f"select * from {name} limit ? offset ?", (limit, offset)
            )
            rows = cur.fetchall()
            cols = [d[0] for d in cur.description] if cur.description else []

            # convert to list of dicts
            data = [dict(r) for r in rows]

            return {
                "table": name,
                "columns": cols,
                "count": len(data),
                "limit": limit,
                "offset": offset,
                "rows": data,
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
