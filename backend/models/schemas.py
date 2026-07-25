from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=80)
    title: Optional[str] = None
    summary_style: str = "balanced"
    abstractive: bool = False


class QuestionRequest(BaseModel):
    text: str = Field(..., min_length=20)
    question: str = Field(..., min_length=3)


class UrlRequest(BaseModel):
    url: str


class SummaryBundle(BaseModel):
    short: str
    medium: str
    detailed: str
    extractive_textrank: str
    extractive_lexrank: str
    abstractive: Optional[str] = None


class SentimentResult(BaseModel):
    label: str
    confidence: float
    scores: Dict[str, float]


class EntityResult(BaseModel):
    label: str
    text: str


class AnalysisResponse(BaseModel):
    title: Optional[str]
    summaries: SummaryBundle
    sentiment: SentimentResult
    keywords: List[str]
    key_phrases: List[str]
    entities: Dict[str, List[str]]
    preprocessing: Dict[str, Any]
    category: str
    reading_time: Dict[str, Any]
    statistics: Dict[str, Any]
    word_cloud: List[Dict[str, Any]]
    headline_suggestions: List[str]
    fake_news_probability: Dict[str, Any]


class AnswerResponse(BaseModel):
    answer: str
    confidence: float
    evidence: List[str]
