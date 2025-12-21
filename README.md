# Monitoring Hub

Monitoring Hub is a full-stack demo that showcases how to collect Veeam Backup & Replication (VBR) metrics, persist them in a database, and surface the data through a FastAPI backend and a React single-page application. It is packaged for local development and containerized deployment to Google Cloud Run + Firebase Hosting.

## Features

- **Collector** (`main.py`) that authenticates against the VBR REST API, retrieves repository/job state snapshots, and stores both raw and processed records in the database.
- **FastAPI backend** (`backend/`) that exposes health/self-check endpoints and read-only demo APIs for browsing the captured snapshots.
- **React + Vite frontend** (`frontend/`) that renders a marketing-style landing page, a self-check status view, and an interactive TanStack Table demo backed by the API.
- **Docker-first deployment** with a slim Python image and GitHub Actions-friendly layout.

## Architecture

```text
VBR REST API → Collector (`main.py`, `vbr.py`) → Database (`data/`)
                                  ↓
                           FastAPI (`backend/`)
                                  ↓
                         React Frontend (`frontend/`)
```

- The collector runs as a CLI process that populates the database using helpers in `storage.py`.
- The backend reads from the same database (configurable through the `DB_PATH` env var) and publishes JSON endpoints under `/api/*`.
- The React SPA calls the backend through the `VITE_API_URL` environment variable and provides a marketing shell plus data exploration tools.

## Repository layout

```
PetProject/
├── main.py              # Entry point for the VBR data collector
├── vbr.py               # Minimal VBR REST client
├── storage.py           # Database helpers (init/load/retention)
├── backend/             # FastAPI application package
│   ├── api.py           # FastAPI app factory and router wiring
│   ├── db_context.py    # DB connection manager & path resolution
│   └── routers/         # API routes (demo data + DB utilities)
├── data/                # Database files (demo data included)
├── frontend/            # React + Vite single-page application
└── Dockerfile           # Container image for the backend API
```

## Backend API

All endpoints are served under the `/api` prefix.

| Endpoint | Description |
| --- | --- |
| `GET /api/status` | Lightweight health probe exposed by `backend/api.py`. |
| `GET /api/db/ping` | Returns the database version and a list of tables using `backend/routers/dbutils.py`. |
| `GET /api/demo/table/{table}/rows?limit=50&offset=0` | Paginates rows from any database table while validating the table name (`backend/routers/demo.py`). |

The backend defaults to `data/data_synth.db`. Override the database file by exporting `DB_PATH` before starting the server.

Start the backend locally:

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn backend.api:app --reload --host 0.0.0.0 --port 8080
```

## Collector configuration

The collector expects a `secrets.json` file in the project root with VBR connection details:

```json
{
  "BASE": "https://vbr.example.com:9419",
  "USER": "DOMAIN\\service_account",
  "PASS": "your-password",
  "VERIFY": false,
  "API_VER": "1.1-rev1",
  "LIMIT": 200,
  "DB_PATH": "data/data_synth.db",
  "COLLECT": ["repository_states", "job_states"],
  "RETENTION_DAYS": 30
}
```

> ⚠️ **Never commit real credentials.** Provide a local-only file or rely on environment-specific secrets.

Run the collector to populate/update the database:

```bash
python main.py
```

The process will create the database (and tables) on first run, fetch the configured datasets, insert raw payloads into `raw_events`, and materialize clean records in `repo_states`/`job_states`. Old records are purged according to `RETENTION_DAYS`.

## Frontend

The single-page application is built with React 18, Vite, and TanStack Table.

1. Create a `.env.local` inside `frontend/` and point it at the backend URL:
   ```ini
   VITE_API_URL=http://localhost:8080
   ```
2. Install dependencies and start the dev server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Visit the printed URL (default `http://localhost:5173`) to browse the marketing page, run the self-check, and explore the job states table.

## Docker

Build and run the backend API image:

```bash
docker build -t monitoring-hub-backend .
docker run --rm -p 8080:8080 -v $(pwd)/data:/app/data monitoring-hub-backend
```

Mounting the `data/` directory keeps the database file editable by both the collector and the containerized API. Provide a production-ready `secrets.json` to the collector before populating the database.

## Deployment notes

- Designed for Google Cloud Run (backend) and Firebase Hosting (frontend). Both services can source artifacts from GitHub Actions pipelines.
- SQLite is ideal for the self-contained demo; swap `storage.py` + `backend/db_context.py` for another database if you scale beyond single-instance deployments.
- The frontend uses static hosting and consumes the public Cloud Run URL via the `VITE_API_URL` environment variable during its build step.

## Roadmap ideas

- Replace raw SQLite queries with SQLModel/SQLAlchemy for richer schema control.
- Add authentication for API endpoints and tighten table browsing permissions.
- Expand the collector with scheduling (e.g., cron/Cloud Scheduler) and additional VBR datasets.
- Enhance frontend visualizations with charts or status badges.

---

Built by Roman Key
