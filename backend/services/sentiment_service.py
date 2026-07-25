from collections import Counter

POSITIVE_WORDS = {
    "gain", "gains", "growth", "improve", "improved", "positive", "success",
    "win", "wins", "strong", "benefit", "record", "rise", "rises", "boost",
    "support", "safe", "peace", "approved", "profit", "progress",
}

NEGATIVE_WORDS = {
    "loss", "losses", "fall", "falls", "decline", "declined", "negative",
    "risk", "risks", "crisis", "war", "attack", "attacks", "death", "dead",
    "failed", "failure", "fraud", "inflation", "cuts", "concern", "concerns",
}


def analyze_sentiment(text: str) -> dict:
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

        raw = SentimentIntensityAnalyzer().polarity_scores(text)
        positive = round(max(raw["pos"], 0) * 100, 1)
        negative = round(max(raw["neg"], 0) * 100, 1)
        neutral = round(max(0, 100 - positive - negative), 1)
    except Exception:
        words = Counter(word.lower().strip(".,;:!?") for word in text.split())
        pos_count = sum(words[word] for word in POSITIVE_WORDS)
        neg_count = sum(words[word] for word in NEGATIVE_WORDS)
        total = max(1, pos_count + neg_count)
        positive = round((pos_count / total) * 70, 1) if total else 0
        negative = round((neg_count / total) * 70, 1) if total else 0
        neutral = round(max(0, 100 - positive - negative), 1)

    scores = {"positive": positive, "neutral": neutral, "negative": negative}
    label = max(scores, key=scores.get)
    confidence = scores[label]
    return {"label": label.title(), "confidence": confidence, "scores": scores}
