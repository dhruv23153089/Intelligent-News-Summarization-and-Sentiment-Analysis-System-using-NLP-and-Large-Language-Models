from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.analysis import router as analysis_router
from backend.routes.ingestion import router as ingestion_router


load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(
    title="Intelligent News Summarization and Sentiment Analysis System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    # Vite may be opened through localhost or a private-network address.
    # It can also select another port when 5173 is busy.
    allow_origin_regex=(
        r"https?://(localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|"
        r"192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}):\d+"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/api", tags=["analysis"])
app.include_router(ingestion_router, prefix="/api", tags=["ingestion"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "news-nlp-backend"}
