from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import demo
from app.routers import dbutils

app = FastAPI(title="Project Monitor API", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# share static
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/home")
def home_tiles():
    # mainpage
    return {
        "title": "Project Monitor",
        "subtitle": "Subtitle",
        "tiles": [
            {
                "title": "Demo",
                "image": "/static/1.png",
                "href": "/demo"
            },
            {
                "title": "Download Trial",
                "image": "/static/2.png",
                "href": "/about"
            },
            {
                "title": "Subscribe",
                "image": "/static/3.png",
                "href": "/docs"
            },
        ]
    }

app.include_router(demo.router, prefix="/api/demo", tags=["demo"])
app.include_router(dbutils.router, prefix="/api/db", tags=["db"])