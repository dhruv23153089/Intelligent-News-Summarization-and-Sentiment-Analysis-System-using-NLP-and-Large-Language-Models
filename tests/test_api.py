from fastapi.testclient import TestClient

from backend.app import app


client = TestClient(app)
ARTICLE = (
    "Researchers in New Delhi introduced a climate forecasting pilot on 14 July 2026. "
    "The system combines satellite data and local reports to predict floods and heat waves. "
    "The Ministry of Earth Sciences will test it in coastal regions before a wider rollout. "
    "Universities will help evaluate the public-alert tools and protect community data."
)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analyze_returns_portfolio_outputs():
    response = client.post("/api/analyze", json={"text": ARTICLE, "title": "Climate pilot"})
    data = response.json()
    assert response.status_code == 200
    assert data["summaries"]["medium"]
    assert data["sentiment"]["label"] in {"Positive", "Neutral", "Negative"}
    assert data["statistics"]["word_count"] > 20


def test_question_answering_returns_evidence():
    response = client.post("/api/ask", json={"text": ARTICLE, "question": "Where will it be tested?"})
    assert response.status_code == 200
    assert response.json()["evidence"]
