from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import demo
from app.routers import dbutils

app = FastAPI(title="Monitoring Hub API", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# share static
app.mount("/static", StaticFiles(directory="static"), name="static")


# @app.get("/health", tags=["System"])
# def health():
#     return {"status": "ok"}


app.include_router(demo.router, prefix="/api/demo", tags=["Data For Demo"])
app.include_router(dbutils.router, prefix="/api/db", tags=["Database Utilities"])
