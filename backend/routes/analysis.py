from fastapi import APIRouter

from backend.models.schemas import AnalyzeRequest, QuestionRequest
from backend.services.analysis_service import analyze_article
from backend.services.qa_service import answer_question

router = APIRouter()


@router.post("/analyze")
def analyze(payload: AnalyzeRequest):
    return analyze_article(
        text=payload.text,
        title=payload.title,
        use_abstractive=payload.abstractive,
    )


@router.post("/ask")
def ask(payload: QuestionRequest):
    return answer_question(payload.text, payload.question)
