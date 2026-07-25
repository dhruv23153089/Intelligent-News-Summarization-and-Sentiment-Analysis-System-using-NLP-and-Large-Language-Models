"""Run a repeatable ROUGE evaluation for the local extractive summarizer."""

import json
from pathlib import Path

from rouge_score import rouge_scorer

from backend.services.summarization_service import build_summaries


DATASET = Path(__file__).resolve().parents[1] / "dataset" / "evaluation_articles.json"


def main():
    articles = json.loads(DATASET.read_text(encoding="utf-8"))
    scorer = rouge_scorer.RougeScorer(["rouge1", "rouge2", "rougeL"], use_stemmer=True)
    totals = {metric: 0.0 for metric in ("rouge1", "rouge2", "rougeL")}

    for item in articles:
        prediction = build_summaries(item["article"])["medium"]
        scores = scorer.score(item["reference_summary"], prediction)
        for metric, score in scores.items():
            totals[metric] += score.fmeasure

    count = len(articles)
    result = {metric: round(value / count, 4) for metric, value in totals.items()}
    print(json.dumps({"articles": count, "extractive_textrank": result}, indent=2))


if __name__ == "__main__":
    main()
