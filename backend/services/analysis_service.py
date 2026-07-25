from backend.nlp.preprocessing import preprocess_text, split_sentences, tokenize
from backend.services.extraction_service import (
    extract_entities,
    extract_keywords,
    predict_category,
    suggest_headlines,
    word_cloud_data,
)
from backend.services.sentiment_service import analyze_sentiment
from backend.services.summarization_service import build_summaries


def analyze_article(text: str, title: str | None = None, use_abstractive: bool = False) -> dict:
    clean_text = " ".join(text.split())
    summaries = build_summaries(clean_text, use_abstractive=use_abstractive)
    sentiment = analyze_sentiment(clean_text)
    extracted = extract_keywords(clean_text)
    entities = extract_entities(clean_text)
    preprocessing = preprocess_text(clean_text)
    category = predict_category(clean_text)
    word_count = len(tokenize(clean_text))
    sentence_count = len(split_sentences(clean_text))
    summary_words = len(tokenize(summaries["medium"]))
    reading_minutes = max(1, round(word_count / 220))
    summary_minutes = max(1, round(summary_words / 220))
    compression = round((1 - (summary_words / max(1, word_count))) * 100, 1)
    fake_news = _estimate_fake_news_probability(clean_text, sentiment, entities)

    return {
        "title": title,
        "summaries": summaries,
        "sentiment": sentiment,
        "keywords": extracted["keywords"],
        "key_phrases": extracted["key_phrases"],
        "entities": entities,
        "preprocessing": preprocessing,
        "category": category,
        "reading_time": {
            "original": f"{reading_minutes} minute{'s' if reading_minutes != 1 else ''}",
            "summary": f"{summary_minutes} minute{'s' if summary_minutes != 1 else ''}",
        },
        "statistics": {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "summary_word_count": summary_words,
            "compression_ratio": compression,
            "sentiment_score": sentiment["confidence"],
        },
        "word_cloud": word_cloud_data(clean_text),
        "headline_suggestions": suggest_headlines(clean_text, extracted["keywords"]),
        "fake_news_probability": fake_news,
    }


def _estimate_fake_news_probability(text: str, sentiment: dict, entities: dict) -> dict:
    sensational_terms = ["shocking", "secret", "miracle", "exposed", "unbelievable", "guaranteed"]
    lowered = text.lower()
    sensational_hits = sum(term in lowered for term in sensational_terms)
    entity_count = sum(len(values) for values in entities.values())
    probability = 18 + sensational_hits * 12
    if entity_count < 2:
        probability += 12
    if sentiment["confidence"] > 75 and sentiment["label"] != "Neutral":
        probability += 8
    probability = min(92, probability)
    label = "Experimental low risk" if probability < 35 else "Experimental medium risk" if probability < 65 else "Experimental high risk"
    return {"probability": probability, "label": label}
