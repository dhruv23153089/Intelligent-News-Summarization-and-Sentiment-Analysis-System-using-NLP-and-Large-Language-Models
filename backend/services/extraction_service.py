import re
from collections import Counter, defaultdict
from typing import Dict, List

from sklearn.feature_extraction.text import TfidfVectorizer

from backend.nlp.preprocessing import load_spacy, split_sentences, tokenize

CATEGORY_TERMS = {
    "Politics": {"election", "government", "minister", "policy", "parliament", "president", "vote"},
    "Sports": {"match", "team", "player", "tournament", "score", "league", "coach"},
    "Technology": {"ai", "software", "chip", "digital", "startup", "technology", "cyber", "app"},
    "Finance": {"market", "stock", "bank", "economy", "inflation", "revenue", "profit", "investor"},
    "Entertainment": {"film", "movie", "actor", "music", "show", "series", "festival"},
    "Health": {"health", "hospital", "doctor", "disease", "vaccine", "medical", "patients"},
}


def extract_keywords(text: str, limit: int = 10) -> Dict[str, List[str]]:
    try:
        import yake

        extractor = yake.KeywordExtractor(lan="en", n=2, top=limit)
        phrases = [keyword for keyword, _ in extractor.extract_keywords(text)]
    except Exception:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=limit * 2)
        matrix = vectorizer.fit_transform([text])
        scores = matrix.toarray()[0]
        terms = vectorizer.get_feature_names_out()
        ranked = sorted(zip(scores, terms), reverse=True)
        phrases = [term.title() for _, term in ranked[:limit]]

    keywords = []
    for phrase in phrases:
        for word in phrase.split():
            clean = word.strip(".,;:!?").title()
            if len(clean) > 2 and clean not in keywords:
                keywords.append(clean)
    return {"keywords": keywords[:limit], "key_phrases": phrases[:limit]}


def extract_entities(text: str) -> Dict[str, List[str]]:
    nlp = load_spacy()
    grouped = defaultdict(list)
    label_map = {
        "PERSON": "Person",
        "ORG": "Organization",
        "GPE": "Country/Location",
        "LOC": "Location",
        "DATE": "Date",
        "MONEY": "Money",
        "PERCENT": "Percentage",
    }
    if nlp:
        doc = nlp(text[:1_000_000])
        for ent in doc.ents:
            label = label_map.get(ent.label_)
            if label and ent.text not in grouped[label]:
                grouped[label].append(ent.text)
    else:
        for date in re.findall(r"\b\d{1,2}\s+[A-Z][a-z]+\s+\d{4}\b|\b\d{4}\b", text):
            grouped["Date"].append(date)
        for money in re.findall(r"[$₹€]\s?\d+(?:\.\d+)?\s?(?:million|billion|crore|lakh)?", text, flags=re.I):
            grouped["Money"].append(money)
        for percent in re.findall(r"\b\d+(?:\.\d+)?%", text):
            grouped["Percentage"].append(percent)
        for name in re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b", text):
            grouped["Person"].append(name)

    return {label: values[:12] for label, values in grouped.items()}


def predict_category(text: str) -> str:
    words = {word.lower() for word in tokenize(text)}
    scores = {
        category: len(words.intersection(terms))
        for category, terms in CATEGORY_TERMS.items()
    }
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "General"


def word_cloud_data(text: str, limit: int = 35) -> List[dict]:
    stop = {"the", "and", "for", "with", "that", "from", "this", "have", "has", "was", "were", "are"}
    words = [word.lower() for word in tokenize(text) if len(word) > 3 and word.lower() not in stop]
    counts = Counter(words)
    return [{"text": word, "value": count} for word, count in counts.most_common(limit)]


def suggest_headlines(text: str, keywords: List[str]) -> List[str]:
    first_sentence = split_sentences(text)[0] if split_sentences(text) else "Breaking news update"
    trimmed = first_sentence[:86].rstrip(" ,.;:")
    topic = keywords[0] if keywords else "News"
    return [
        trimmed,
        f"{topic}: Key developments and what they mean",
        f"Inside the latest update on {topic.lower()}",
    ]
