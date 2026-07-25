import math
import os
from collections import Counter
from functools import lru_cache
from typing import List

import networkx as nx
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from backend.nlp.preprocessing import STOPWORDS, split_sentences, tokenize


def _normalize_summary(sentences: List[str], target_count: int) -> str:
    selected = sentences[: max(1, target_count)]
    return " ".join(selected).strip()


def _rank_by_graph(sentences: List[str], threshold: float = 0.1) -> List[str]:
    if len(sentences) <= 2:
        return sentences
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(sentences)
    similarity = cosine_similarity(matrix)
    graph = nx.from_numpy_array(similarity)
    scores = nx.pagerank(graph)
    ranked_indexes = sorted(scores, key=scores.get, reverse=True)
    keep = max(1, math.ceil(len(sentences) * threshold))
    ordered_indexes = sorted(ranked_indexes[:keep])
    return [sentences[index] for index in ordered_indexes]


def textrank_summary(text: str, ratio: float = 0.22) -> str:
    sentences = split_sentences(text)
    return " ".join(_rank_by_graph(sentences, ratio))


def lexrank_summary(text: str, ratio: float = 0.28) -> str:
    sentences = split_sentences(text)
    if len(sentences) <= 2:
        return " ".join(sentences)
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(sentences)
    similarity = cosine_similarity(matrix)
    centrality = np.asarray(similarity.mean(axis=1)).flatten()
    keep = max(1, math.ceil(len(sentences) * ratio))
    ordered_indexes = sorted(np.argsort(centrality)[-keep:])
    return " ".join(sentences[index] for index in ordered_indexes)


def frequency_summary(text: str, sentence_count: int) -> str:
    sentences = split_sentences(text)
    words = [
        token.lower()
        for token in tokenize(text)
        if token.lower() not in STOPWORDS and len(token) > 2
    ]
    frequencies = Counter(words)
    scored = []
    for index, sentence in enumerate(sentences):
        sentence_words = tokenize(sentence)
        score = sum(frequencies[token.lower()] for token in sentence_words)
        scored.append((score / max(1, len(sentence_words)), index, sentence))
    selected = sorted(scored, reverse=True)[:sentence_count]
    return " ".join(sentence for _, _, sentence in sorted(selected, key=lambda item: item[1]))


@lru_cache(maxsize=1)
def _load_abstractive_pipeline():
    if os.getenv("ENABLE_TRANSFORMERS", "false").lower() != "true":
        return None
    try:
        from transformers import pipeline

        model_name = os.getenv("ABSTRACTIVE_MODEL", "sshleifer/distilbart-cnn-12-6")
        return pipeline("summarization", model=model_name)
    except Exception:
        return None


def abstractive_summary(text: str) -> str | None:
    summarizer = _load_abstractive_pipeline()
    if not summarizer:
        return None
    trimmed = text[:3500]
    result = summarizer(trimmed, max_length=180, min_length=45, do_sample=False)
    return result[0]["summary_text"]


def build_summaries(text: str, use_abstractive: bool = False) -> dict:
    sentences = split_sentences(text)
    short = frequency_summary(text, 2)
    medium = textrank_summary(text, 0.24)
    detailed = frequency_summary(text, max(4, math.ceil(len(sentences) * 0.36)))
    abstractive = abstractive_summary(text) if use_abstractive else None
    return {
        "short": short or _normalize_summary(sentences, 2),
        "medium": medium or _normalize_summary(sentences, 4),
        "detailed": detailed or _normalize_summary(sentences, 7),
        "extractive_textrank": medium or _normalize_summary(sentences, 4),
        "extractive_lexrank": lexrank_summary(text, 0.24),
        "abstractive": abstractive,
    }
