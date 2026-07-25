from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from backend.nlp.preprocessing import split_sentences


def answer_question(text: str, question: str) -> dict:
    sentences = split_sentences(text)
    if not sentences:
        return {"answer": "No article content was available.", "confidence": 0, "evidence": []}

    lowered = question.lower()
    if "summarize" in lowered and "one sentence" in lowered:
        evidence = [sentences[0]]
        return {"answer": sentences[0], "confidence": 72, "evidence": evidence}

    corpus = sentences + [question]
    vectors = TfidfVectorizer(stop_words="english").fit_transform(corpus)
    similarities = cosine_similarity(vectors[-1], vectors[:-1]).flatten()
    top_indexes = similarities.argsort()[-3:][::-1]
    evidence = [sentences[index] for index in top_indexes if similarities[index] > 0]
    if not evidence:
        evidence = sentences[:2]

    answer = evidence[0]
    if lowered.startswith("who"):
        answer = _extract_capitalized(evidence) or answer
    elif lowered.startswith("when"):
        answer = _extract_date(evidence) or answer
    elif lowered.startswith("where"):
        answer = _extract_place_like(evidence) or answer
    elif lowered.startswith("why"):
        answer = next((item for item in evidence if "because" in item.lower() or "due to" in item.lower()), answer)

    confidence = round(float(max(similarities)) * 100, 1) if len(similarities) else 0
    return {"answer": answer, "confidence": min(95, max(35, confidence)), "evidence": evidence}


def _extract_capitalized(sentences):
    import re

    text = " ".join(sentences)
    matches = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b", text)
    return ", ".join(dict.fromkeys(matches[:6]))


def _extract_date(sentences):
    import re

    text = " ".join(sentences)
    matches = re.findall(r"\b\d{1,2}\s+[A-Z][a-z]+\s+\d{4}\b|\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b|\b\d{4}\b", text)
    return ", ".join(dict.fromkeys(matches[:4]))


def _extract_place_like(sentences):
    import re

    text = " ".join(sentences)
    matches = re.findall(r"\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})", text)
    return ", ".join(dict.fromkeys(matches[:4]))
