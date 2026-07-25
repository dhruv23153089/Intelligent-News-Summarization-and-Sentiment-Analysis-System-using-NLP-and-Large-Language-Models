# News Intelligence Studio

An end-to-end NLP application for analyzing news articles. It combines a React dashboard with a FastAPI NLP service to produce extractive summaries, sentiment, named entities, keywords, article-grounded question answering, categories, and reading analytics.

> Portfolio project: designed to demonstrate practical NLP system design, evaluation, API engineering, and production-ready developer workflow.

## Features

- Paste article text or upload `.txt`, `.pdf`, and `.docx` files
- Optional URL extraction plus NewsData.io / NewsAPI.org integration
- NLP preprocessing: tokenization, lowercasing, stopword removal, lemmatization, POS tagging, and NER
- Extractive summarization with TextRank-style and LexRank-style scoring
- Optional abstractive summarization hook for HuggingFace transformer models
- Sentiment analysis with positive, neutral, negative percentages and confidence score
- Keyword and phrase extraction
- Named entity extraction grouped by entity type
- Question answering over article content
- Category prediction for politics, sports, technology, finance, entertainment, health, and general news
- Reading time, word count, sentence count, compression ratio, and word-cloud data
- Dark/light theme, saved local history, text-to-speech, and PDF export from browser print

## Architecture

```text
React + Vite UI
    |  /api proxy (development and Docker)
FastAPI service
    |-- ingestion: text, URL, TXT/PDF/DOCX, NewsAPI
    |-- NLP: preprocessing, NER, keywords, sentiment, classification
    |-- summarization: frequency, TextRank-style, LexRank-style, optional transformer
    `-- QA: TF-IDF retrieval with supporting evidence
```

The UI sends requests to `/api` by default. Vite proxies that path to FastAPI locally and Nginx proxies it in Docker, avoiding browser CORS issues. Use `VITE_API_URL` only if the frontend and backend are deployed separately.

## Project Structure

```text
News-Summarizer/
|-- frontend/
|   |-- src/
|   |-- index.html
|   `-- package.json
|-- backend/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   |-- nlp/
|   |-- prompts/
|   `-- app.py
|-- dataset/
|-- notebooks/
|-- saved_models/
|-- requirements.txt
|-- requirements-llm.txt
`-- README.md
```

## Quick Start

### Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn backend.app:app --reload --port 8000
```

The spaCy model is optional. If it is not installed, the backend uses lightweight fallback logic.

For transformer-based abstractive summarization or KeyBERT experiments, install the optional package set:

```bash
pip install -r requirements-llm.txt
```

If Windows reports a long-path error while installing `transformers`, either enable Windows Long Path support or keep using the default `requirements.txt`. The app runs without the optional transformer packages.

### Pip Troubleshooting on Windows

If pip prints a warning like this:

```text
WARNING: Ignoring invalid distribution ~ydantic
```

it means a previous interrupted install left a temporary package folder in Python's `site-packages`. First repair the package:

```bash
python -m pip install --force-reinstall pydantic==2.10.4
```

If the warning still appears, remove only the broken temporary folders named like `~ydantic` from your Python `site-packages` directory, then reinstall:

```bash
python -m pip uninstall pydantic -y
python -m pip install pydantic==2.10.4
python -m pip install -r requirements.txt
```

PowerShell command to find the broken folder:

```powershell
Get-ChildItem "$env:LOCALAPPDATA\Packages\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\LocalCache\local-packages\Python311\site-packages" -Directory -Filter "~ydantic*"
```

After confirming it only lists broken `~ydantic` folders, remove them:

```powershell
Get-ChildItem "$env:LOCALAPPDATA\Packages\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\LocalCache\local-packages\Python311\site-packages" -Directory -Filter "~ydantic*" | Remove-Item -Recurse -Force
```

If pip also reports a `transformers` and `tokenizers` version conflict, remove the optional transformer packages because the default app does not need them:

```powershell
python -m pip uninstall transformers tokenizers sentence-transformers keybert -y
python -m pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Quality checks

```bash
# API regression tests
pytest -q

# Reproducible ROUGE evaluation for the local TextRank-style summary
python scripts/evaluate.py

# Production frontend build
cd frontend
npm run build
```

The evaluation script uses the small tracked benchmark in `dataset/evaluation_articles.json`. Expand this set with held-out, human-written reference summaries before reporting a final portfolio metric; do not claim performance from the included smoke-test corpus as a general benchmark.

## Docker

Copy `.env.example` to `.env`, then run:

```bash
docker compose up --build
```

Open `http://localhost:5173`. The API is available at `http://localhost:8000/api/health`.

## Deployment checklist

1. Deploy `backend/` as a Python web service with the start command `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`.
2. Deploy `frontend/` as a static site; set `VITE_API_URL` to the public backend URL plus `/api` if the host cannot proxy `/api`.
3. Configure secrets such as `NEWS_API_KEY` only in the host dashboard.
4. Run `pytest -q` and `npm run build` before deployment. GitHub Actions performs both checks on every push and pull request.

## Environment Variables

Copy `.env.example` to `.env` if you want optional integrations:

```env
# Supports NewsData.io (pub_...) and NewsAPI.org keys.
NEWS_API_KEY=your_news_provider_key
ENABLE_TRANSFORMERS=false
ABSTRACTIVE_MODEL=sshleifer/distilbart-cnn-12-6
```

## API Endpoints

- `GET /api/health`
- `POST /api/analyze`
- `POST /api/upload`
- `POST /api/ask`
- `POST /api/fetch-url`
- `GET /api/latest-news?query=technology`

## Evaluation Plan

- Summarization: ROUGE-1, ROUGE-2, ROUGE-L
- Sentiment: accuracy, precision, recall, F1-score
- Classification: confusion matrix and macro F1-score

## Limitations and responsible use

- Some publishers deliberately block automated article extraction. Use pasted text or document upload as the reliable fallback.
- The fake-news indicator is an experimental heuristic, not fact checking; it must not be used to judge truthfulness.
- Extractive summaries can miss context and nuance. The optional transformer summary should be evaluated against human references before use in a high-stakes setting.
- NewsAPI and transformer functionality are optional and require user-supplied configuration.

## Resume-ready project description

**News Intelligence Studio — React, FastAPI, spaCy, scikit-learn, VADER**  
Built a full-stack NLP platform that ingests articles and documents, generates multiple extractive summaries, performs sentiment analysis and named-entity extraction, retrieves evidence for article-level QA, and exposes reproducible ROUGE evaluation, automated API tests, Docker deployment, and CI.

Datasets to evaluate with: CNN/DailyMail, BBC News Dataset, AG News, and Kaggle News Articles.
