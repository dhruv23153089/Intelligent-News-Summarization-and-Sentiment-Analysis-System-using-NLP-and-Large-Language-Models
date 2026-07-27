# News Intelligence Studio

News Intelligence Studio is a React and FastAPI application for analyzing news articles. It generates summaries, sentiment, entities, keywords, article-grounded question answers, categories, and reading analytics.

## Features

- Paste article text or upload TXT, PDF, and DOCX files
- Fetch article text from a news URL
- Search and select live stories by topic with NewsData.io or NewsAPI.org
- Generate extractive summaries and an optional transformer summary
- View sentiment, keywords, named entities, category, word cloud, and reading statistics
- Ask questions against the loaded article
- Save analyzed articles locally in browser history

## Architecture

```text
React + Vite UI
    |  /api proxy
FastAPI service
    |-- ingestion: text, URL, TXT/PDF/DOCX, live news
    |-- NLP: preprocessing, NER, keywords, sentiment, classification
    |-- summarization: frequency, TextRank-style, LexRank-style
    `-- QA: TF-IDF retrieval with supporting evidence
```

The UI sends requests to `/api` by default. Vite and Nginx proxy this path to FastAPI locally. Set `VITE_API_URL` only when the frontend and backend are deployed at separate origins.

## Quick Start

### Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn backend.app:app --reload --port 8000
```

The spaCy model is optional; the backend uses lightweight fallback logic when it is not installed.

For optional transformer summarization or KeyBERT experiments:

```bash
pip install -r requirements-llm.txt
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Create a `.env` file when using optional integrations:

```env
# Supports NewsData.io keys (pub_...) and NewsAPI.org keys.
NEWS_API_KEY=your_news_provider_key
ENABLE_TRANSFORMERS=false
ABSTRACTIVE_MODEL=sshleifer/distilbart-cnn-12-6
```

One `NEWS_API_KEY` is enough for every topic search. Enter a topic such as `technology`, `climate`, or `sports` in the live-news field to fetch matching stories.

## Quality Checks

```bash
pytest -q
python scripts/evaluate.py

cd frontend
npm run build
```

## Docker

```bash
docker compose up --build
```

Open `http://localhost:5173`. The API health endpoint is available at `http://localhost:8000/api/health`.

## API Endpoints

- `GET /api/health`
- `POST /api/analyze`
- `POST /api/upload`
- `POST /api/ask`
- `POST /api/fetch-url`
- `GET /api/latest-news?query=technology`

## Limitations

- Some publishers block automated article extraction. Paste or upload the article text if extraction fails.
- The fake-news indicator is an experimental heuristic, not fact checking.
- News-provider and transformer features require their respective optional configuration.
