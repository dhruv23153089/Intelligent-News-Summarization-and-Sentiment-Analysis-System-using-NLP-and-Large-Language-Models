import re
from functools import lru_cache
from typing import Any, Dict, List

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
    "he", "in", "is", "it", "its", "of", "on", "that", "the", "to", "was",
    "were", "will", "with", "this", "these", "those", "their", "or", "but",
    "about", "into", "after", "before", "over", "under", "than", "then",
}


@lru_cache(maxsize=1)
def load_spacy():
    try:
        import spacy

        return spacy.load("en_core_web_sm")
    except Exception:
        return None


def split_sentences(text: str) -> List[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [sentence.strip() for sentence in sentences if len(sentence.strip()) > 2]


def tokenize(text: str) -> List[str]:
    return re.findall(r"[A-Za-z][A-Za-z'-]*|\d+(?:\.\d+)?%?", text)


def simple_lemma(token: str) -> str:
    lowered = token.lower()
    for suffix in ("ing", "edly", "edly", "ed", "ly", "s"):
        if lowered.endswith(suffix) and len(lowered) > len(suffix) + 3:
            return lowered[: -len(suffix)]
    return lowered


def preprocess_text(text: str) -> Dict[str, Any]:
    nlp = load_spacy()
    if nlp:
        doc = nlp(text[:1_000_000])
        tokens = [token.text for token in doc if not token.is_space]
        cleaned = [
            token.lemma_.lower()
            for token in doc
            if token.is_alpha and not token.is_stop
        ]
        pos_tags = [
            {"text": token.text, "pos": token.pos_, "tag": token.tag_}
            for token in doc
            if token.is_alpha
        ][:120]
        entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
        return {
            "tokens": tokens[:500],
            "lowercased": [token.lower() for token in tokens[:500]],
            "without_stopwords": cleaned[:500],
            "lemmas": cleaned[:500],
            "pos_tags": pos_tags,
            "entities_raw": entities,
            "sentence_count": len(list(doc.sents)),
        }

    raw_tokens = tokenize(text)
    lowercased = [token.lower() for token in raw_tokens]
    without_stopwords = [token for token in lowercased if token not in STOPWORDS]
    lemmas = [simple_lemma(token) for token in without_stopwords]
    return {
        "tokens": raw_tokens[:500],
        "lowercased": lowercased[:500],
        "without_stopwords": without_stopwords[:500],
        "lemmas": lemmas[:500],
        "pos_tags": [{"text": token, "pos": "NOUN"} for token in raw_tokens[:120]],
        "entities_raw": [],
        "sentence_count": len(split_sentences(text)),
    }
