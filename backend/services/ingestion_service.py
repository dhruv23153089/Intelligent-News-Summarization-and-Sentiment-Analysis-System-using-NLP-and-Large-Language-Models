import io
import os

import requests
from bs4 import BeautifulSoup
from fastapi import UploadFile


ARTICLE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def _unique_articles(articles: list[dict]) -> list[dict]:
    """Keep the first instance of each article returned by a news provider."""
    unique_articles = []
    seen_titles = set()
    seen_urls = set()
    for article in articles:
        title = " ".join((article.get("title") or "").lower().split())
        url = (article.get("url") or article.get("link") or "").strip().lower()
        if (title and title in seen_titles) or (url and url in seen_urls):
            continue
        if title:
            seen_titles.add(title)
        if url:
            seen_urls.add(url)
        unique_articles.append(article)
    return unique_articles


async def read_upload(file: UploadFile) -> str:
    content = await file.read()
    filename = (file.filename or "").lower()
    if filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    if filename.endswith(".pdf"):
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as exc:
            raise ValueError("Could not read the PDF file. Check that it contains selectable text.") from exc
    if filename.endswith(".docx"):
        try:
            from docx import Document

            document = Document(io.BytesIO(content))
            return "\n".join(paragraph.text for paragraph in document.paragraphs)
        except Exception as exc:
            raise ValueError("Could not read the DOCX file.") from exc
    raise ValueError("Supported uploads are .txt, .pdf, and .docx files.")


def fetch_url_text(url: str) -> dict:
    if not url.startswith(("http://", "https://")):
        raise ValueError("Enter a complete URL starting with http:// or https://.")

    try:
        response = requests.get(url, timeout=20, headers=ARTICLE_HEADERS)
    except requests.RequestException as exc:
        raise ValueError("Could not reach that URL. Check the link and your internet connection.") from exc

    if response.status_code >= 400:
        raise ValueError(
            f"The publisher blocked this request (HTTP {response.status_code}). "
            "Paste the article text or upload the article instead."
        )

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    title_tag = soup.find("meta", property="og:title") or soup.title
    title = (title_tag.get("content") or "").strip() if title_tag and title_tag.name == "meta" else (
        title_tag.get_text(" ", strip=True) if title_tag else None
    )
    article = soup.find("article") or soup.find("main") or soup.body
    paragraphs = [paragraph.get_text(" ", strip=True) for paragraph in article.find_all("p")] if article else []
    text = "\n".join(paragraph for paragraph in paragraphs if len(paragraph.split()) > 8)
    if len(text) < 80:
        raise ValueError(
            "Could not find enough article text on that page. "
            "The site may load the article with JavaScript or restrict automated access; paste or upload it instead."
        )
    return {"title": title, "text": text}


def fetch_latest_news(query: str = "technology", country: str = "us") -> dict:
    query = (query or "").strip() or "technology"
    country = (country or "").strip() or "us"
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        return {
            "source": "demo",
            "articles": [
                {
                    "title": "Demo latest news item",
                    "description": "Set NEWS_API_KEY in backend/.env to fetch live articles from NewsAPI.",
                    "url": "",
                }
            ],
        }
    if api_key.startswith("pub_"):
        return _fetch_newsdata(api_key, query, country)

    try:
        response = requests.get(
            "https://newsapi.org/v2/top-headlines",
            params={"q": query, "country": country, "apiKey": api_key, "pageSize": 10},
            timeout=12,
        )
    except requests.RequestException as exc:
        raise ValueError("Could not reach NewsAPI. Check your internet connection and try again.") from exc

    if response.status_code in {401, 403}:
        raise ValueError(
            "NewsAPI rejected the configured key. Confirm it was created at newsapi.org "
            "and that it is active for this endpoint."
        )
    if response.status_code >= 400:
        raise ValueError(f"NewsAPI request failed (HTTP {response.status_code}). Try a different query later.")

    try:
        data = response.json()
    except ValueError as exc:
        raise ValueError("NewsAPI returned an unreadable response.") from exc
    return {"source": "newsapi", "articles": _unique_articles(data.get("articles", []))}


def _fetch_newsdata(api_key: str, query: str, country: str) -> dict:
    """Fetch from NewsData.io, whose public keys use the `pub_` prefix."""
    try:
        response = requests.get(
            "https://newsdata.io/api/1/latest",
            params={"apikey": api_key, "q": query, "country": country, "language": "en"},
            timeout=12,
        )
    except requests.RequestException as exc:
        raise ValueError("Could not reach NewsData.io. Check your internet connection and try again.") from exc

    if response.status_code in {401, 403}:
        raise ValueError("NewsData.io rejected the configured key. Confirm that it is active in your NewsData.io dashboard.")
    if response.status_code == 429:
        raise ValueError("NewsData.io daily request limit has been reached. Try again later.")
    if response.status_code >= 400:
        raise ValueError(f"NewsData.io request failed (HTTP {response.status_code}). Try again later.")

    try:
        data = response.json()
    except ValueError as exc:
        raise ValueError("NewsData.io returned an unreadable response.") from exc

    if data.get("status") not in {None, "success"}:
        details = data.get("results")
        message = details.get("message") if isinstance(details, dict) else None
        raise ValueError(message or "NewsData.io could not return articles.")

    articles = [
        {
            "title": item.get("title") or "Untitled article",
            "description": item.get("description") or item.get("content") or "",
            "url": item.get("link") or "",
        }
        for item in data.get("results", [])
    ]
    return {"source": "newsdata", "articles": _unique_articles(articles)}
