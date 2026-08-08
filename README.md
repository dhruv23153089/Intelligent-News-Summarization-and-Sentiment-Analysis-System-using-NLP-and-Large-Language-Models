# Intelligent News Summarization and Sentiment Analysis System

**News Intelligence Studio** is a full-stack web application for turning news articles into structured, readable intelligence. It accepts article text, URLs, uploaded documents, curated stories, and live topic searches; then applies NLP techniques to produce summaries, sentiment, entities, keywords, categories, statistics, and article-grounded answers.

The project is designed as an interactive news-analysis workspace rather than a simple summarizer. Users can discover stories, analyze a selected item directly, compare results in context, retain a local reading history, and review trends derived from their saved analysis.

## Contents

- [Website capabilities](#website-capabilities)
- [How the website works](#how-the-website-works)
- [Technology and frameworks](#technology-and-frameworks)
- [System architecture](#system-architecture)
- [Project structure](#project-structure)
- [Installation and local use](#installation-and-local-use)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [NLP and analysis pipeline](#nlp-and-analysis-pipeline)
- [Quality checks](#quality-checks)
- [Important notes](#important-notes)

## Website capabilities

### Discover live and curated news

- Search live news by topic from the header search or the Discover-page search box.
- Fetch a topic by pressing **Enter**, clicking the search icon, or using **Fetch Live News**.
- Select a category pill - Technology, Business, World, Politics, Science, Health, Sports, or Entertainment - to update the query and fetch that topic immediately.
- Keep the header and Discover search fields synchronized so that one current topic is always shown.
- Display only unique live results. Duplicate provider responses are removed by title and URL; if fewer unique results exist, the feed shows the smaller number instead of repeating an article.
- Browse curated example briefings with category, source, tags, sentiment, reading-time, and summary details.
- Filter curated Discover cards by category, tone, publisher, and text search.
- Open a live or curated story with **Analyze** to send it directly to the Intelligence workspace.

### Analyze articles in the Intelligence workspace

- Paste article text and provide an optional headline.
- Import article text from a web URL.
- Upload `.txt`, `.pdf`, or `.docx` files for text extraction.
- Show a guided processing sequence while the analysis is running.
- Generate five summary views:
  - Brief summary
  - Standard summary
  - Detailed summary
  - TextRank-style extractive summary
  - LexRank-style extractive summary
- Enable optional abstractive transformer summarization when configured.
- Read the selected summary aloud using the browser speech-synthesis feature.
- Print or save the briefing through the browser print dialog.

### NLP intelligence output

- Overall sentiment label with positive, neutral, and negative scores.
- Sentiment confidence and an explanation of the detected tone.
- Keywords and key phrases.
- Named entities grouped by entity type, such as people, organizations, and locations.
- Topic/category prediction.
- Word cloud generated from meaningful terms in the article.
- Reading time, word count, sentence count, summary word count, and compression ratio.
- Headline suggestions.
- Experimental fake-news-risk indicator based on a transparent heuristic.

### Ask questions about an article

- Ask natural-language questions about the currently loaded article.
- Receive an answer based only on the supplied article text.
- See confidence and supporting evidence sentences.
- Retain the question-and-answer conversation for the current workspace session.

### Trends, analytics, and saved workspace

- View a Trending page with topic cards and editorial trend signals.
- Review Analytics based on locally saved analyses, including article totals, average confidence, sentiment distribution, category activity, and recent analysis history.
- Save analyzed articles automatically in browser `localStorage`.
- Load a saved article back into the Intelligence workspace.
- Remove individual saved items or clear the saved library.
- Compare saved or curated article results through the comparison selection available in the workspace.
- Switch between light and dark themes; the chosen theme is retained locally.
- Receive toast messages for key actions, such as successful fetches, analysis, upload, saves, and deletions.

## How the website works

1. A user enters or selects a news topic, chooses a curated article, pastes text, supplies a URL, or uploads a document.
2. The React interface sends the selected content to the FastAPI backend through `/api`.
3. The backend normalizes the text and runs summarization, sentiment analysis, keyword extraction, named-entity extraction, category detection, statistics, and question-answer retrieval.
4. The interface displays the analysis in the Intelligence workspace and stores completed items in local browser history.
5. Live topic results come from NewsData.io or NewsAPI.org when `NEWS_API_KEY` is configured. The system removes duplicate results before rendering them.

## Technology and frameworks

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend | React 18 | Component-based user interface and application state |
| Frontend tooling | Vite 6 | Local development server and production build tooling |
| HTTP client | Axios | Frontend requests to the backend API |
| Icons | Lucide React | Interface icon set |
| Backend | Python 3 and FastAPI | REST API and application server |
| Validation | Pydantic 2 | Request/response data validation |
| Server | Uvicorn | ASGI server for the FastAPI application |
| Web extraction | Requests and Beautiful Soup | Retrieve and parse article pages |
| Document extraction | pypdf and python-docx | Read PDF, DOCX, and TXT uploads |
| NLP | spaCy, NLTK, YAKE, scikit-learn, NetworkX | Entities, preprocessing, keywords, vector retrieval, and extractive ranking |
| Sentiment | VADER Sentiment and TextBlob | Sentiment scoring with fallback logic |
| Optional LLM layer | Hugging Face Transformers | Abstractive summary generation when enabled |
| Persistence | Browser localStorage | Theme preference and analysis history on the user’s device |

## System architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│ React + Vite: News Intelligence Studio                          │
│ Discover · Intelligence · Trending · Analytics · Saved          │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP requests to /api
┌───────────────────────────────▼─────────────────────────────────┐
│ FastAPI application                                             │
│ analysis routes: /analyze, /ask                                 │
│ ingestion routes: /upload, /fetch-url, /latest-news             │
└──────────┬────────────────────┬───────────────────────┬─────────┘
           │                    │                       │
┌──────────▼─────────┐ ┌────────▼─────────┐ ┌──────────▼──────────┐
│ Ingestion service  │ │ Analysis service │ │ Question answering  │
│ URL, upload, news  │ │ NLP pipeline     │ │ TF-IDF + evidence   │
└──────────┬─────────┘ └────────┬─────────┘ └─────────────────────┘
           │                    │
┌──────────▼─────────┐ ┌────────▼─────────────────────────────────┐
│ NewsData.io /      │ │ Summaries · sentiment · entities ·       │
│ NewsAPI.org        │ │ keywords · category · statistics         │
└────────────────────┘ └──────────────────────────────────────────┘
```

## Project structure

```text
.
├── backend/
│   ├── app.py                    # FastAPI application and CORS setup
│   ├── models/schemas.py          # Pydantic request/response models
│   ├── routes/                    # Analysis and ingestion endpoints
│   ├── services/                  # NLP, summarization, QA, and ingestion services
│   └── nlp/preprocessing.py       # Text normalization utilities
├── frontend/
│   ├── src/App.jsx                # Main React application and workspace UI
│   ├── src/api.js                 # API client functions
│   ├── src/styles.css             # Responsive application styling
│   └── vite.config.js             # Vite configuration and API proxy
├── tests/test_api.py              # API tests
├── scripts/evaluate.py            # ROUGE evaluation utility
├── requirements.txt               # Python dependencies
├── requirements-llm.txt           # Optional transformer dependencies
└── .env.example                   # Environment variable template
```

## Installation and local use

### Prerequisites

- Python 3.10 or later
- Node.js 18 or later with npm
- An optional NewsData.io or NewsAPI.org key for live news search

### 1. Create the Python environment

From the project root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

The spaCy model improves entity recognition. The application retains lightweight fallback behavior when it is unavailable.

Install the optional transformer stack only if you want abstractive summaries:

```powershell
pip install -r requirements-llm.txt
```

### 2. Configure environment values

Copy `.env.example` to `backend/.env`, then set the values you want to use. See [Configuration](#configuration).

### 3. Start the backend

```powershell
uvicorn backend.app:app --reload --port 8000
```

The API is available at `http://localhost:8000`, and interactive API documentation is available at `http://localhost:8000/docs`.

### 4. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

## Configuration

Create `backend/.env` from the root `.env.example` file. Do not commit real API keys.

```env
# A NewsData.io key begins with pub_. A NewsAPI.org key uses its standard format.
NEWS_API_KEY=

# Set to true only after installing requirements-llm.txt.
ENABLE_TRANSFORMERS=false
ABSTRACTIVE_MODEL=sshleifer/distilbart-cnn-12-6

# Optional comma-separated additional browser origins.
CORS_ORIGINS=
```

The frontend uses the Vite `/api` proxy by default. If the API is hosted at a different origin during development, set this in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

## API reference

All application endpoints are prefixed with `/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Returns backend health status |
| `POST` | `/analyze` | Analyzes article text and returns the intelligence result |
| `POST` | `/ask` | Answers a question using supplied article text |
| `POST` | `/upload` | Extracts text from a TXT, PDF, or DOCX upload |
| `POST` | `/fetch-url` | Extracts title and readable text from an article URL |
| `GET` | `/latest-news?query=technology&country=us` | Fetches unique live news articles for a topic |

### `POST /api/analyze`

```json
{
  "title": "Optional article headline",
  "text": "Article text with at least 80 characters.",
  "abstractive": false
}
```

The response contains `summaries`, `sentiment`, `keywords`, `key_phrases`, `entities`, `category`, `reading_time`, `statistics`, `word_cloud`, `headline_suggestions`, and `fake_news_probability`.

### `POST /api/ask`

```json
{
  "text": "The article text to search.",
  "question": "What is the main conclusion?"
}
```

The response includes the `answer`, a `confidence` score, and supporting `evidence` sentences.

### `POST /api/upload`

Submit multipart form data with a `file` field. Supported file types are `.txt`, `.pdf`, and `.docx`.

### `POST /api/fetch-url`

```json
{
  "url": "https://example.com/article"
}
```

The response supplies the extracted `title` and `text`.

## NLP and analysis pipeline

1. **Normalize** - Clean whitespace and prepare article text for processing.
2. **Summarize** - Build frequency-based and graph-ranked extractive summaries. When enabled, the transformer layer adds an abstractive option.
3. **Measure sentiment** - Score positive, neutral, and negative tone with VADER, with fallback scoring where needed.
4. **Extract signals** - Identify keywords/key phrases with YAKE or TF-IDF fallback, and detect entities with spaCy or fallback rules.
5. **Classify and quantify** - Predict a broad news category, generate word-cloud data, calculate reading and compression metrics, and derive headline suggestions.
6. **Answer questions** - Rank article sentences using TF-IDF similarity and return the most relevant evidence-backed answer.

## Quality checks

Run the backend tests and evaluation from the project root:

```powershell
pytest -q
python -m scripts.evaluate
```

Build the frontend:

```powershell
cd frontend
npm run build
```

## Important notes

- Live news requires a valid `NEWS_API_KEY`. Without one, the API returns a clearly labelled demo item.
- Live providers can return fewer than ten unique stories for a topic. The application displays only the unique results available and never fills the feed with repeated cards.
- Some publishers restrict automated text extraction or render their articles with JavaScript. Pasting the text or uploading a document remains available as an alternative input method.
- The fake-news-risk result is an experimental heuristic. It is not fact checking, source verification, or a substitute for editorial judgement.
- Saved analyses, history, and theme preference are stored only in the current browser’s local storage; they are not user accounts or cloud-synced records.
