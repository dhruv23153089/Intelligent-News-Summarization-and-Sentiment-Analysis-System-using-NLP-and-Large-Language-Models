from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.models.schemas import UrlRequest
from backend.services.ingestion_service import fetch_latest_news, fetch_url_text, read_upload

router = APIRouter()


@router.post("/upload")
async def upload_article(file: UploadFile = File(...)):
    try:
        text = await read_upload(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"filename": file.filename, "text": text}


@router.post("/fetch-url")
def fetch_url(payload: UrlRequest):
    try:
        return fetch_url_text(payload.url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        # Publishers can return malformed or non-HTML pages. Keep the API
        # response useful instead of exposing a server error to the frontend.
        raise HTTPException(
            status_code=502,
            detail="The publisher returned a page that could not be processed. Paste or upload the article text instead.",
        ) from exc


@router.get("/latest-news")
def latest_news(query: str = "technology", country: str = "us"):
    try:
        return fetch_latest_news(query=query, country=country)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
