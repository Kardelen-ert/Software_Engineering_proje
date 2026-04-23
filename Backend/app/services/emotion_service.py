from sqlalchemy.orm import Session
from transformers import pipeline

from app.models.emotion_results import EmotionResult

MODEL_NAME = "savasy/bert-base-turkish-sentiment-cased"
_classifier = None


def get_classifier():
    global _classifier

    if _classifier is None:
        _classifier = pipeline("sentiment-analysis", model=MODEL_NAME)

    return _classifier


def split_text(text: str, max_words: int = 400) -> list[str]:
    clean_text = (text or "").strip()
    if not clean_text:
        return []

    words = clean_text.split()
    chunks = []

    for i in range(0, len(words), max_words):
        chunks.append(" ".join(words[i:i + max_words]))

    return chunks


def _map_sentiment_to_emotions(label: str, score: float) -> dict[str, float]:
    normalized_label = label.lower()

    if "pos" in normalized_label:
        return {
            "happy": score,
            "sad": 0.0,
            "anger": 0.0,
            "anxiety": 0.0,
        }

    return {
        "happy": 0.0,
        "sad": score * 0.5,
        "anger": score * 0.2,
        "anxiety": score * 0.3,
    }


def ensure_emotion_results_table(db: Session) -> None:
    bind = db.get_bind()
    EmotionResult.__table__.create(bind=bind, checkfirst=True)


def analyze_entry_nlp(db: Session, entry) -> EmotionResult:
    ensure_emotion_results_table(db)

    chunks = split_text(entry.text)
    scores = {
        "happy": 0.0,
        "sad": 0.0,
        "anger": 0.0,
        "anxiety": 0.0,
    }

    if chunks:
        classifier = get_classifier()

        for chunk in chunks:
            result = classifier(chunk)[0]
            mapped_scores = _map_sentiment_to_emotions(result["label"], float(result["score"]))

            for key, value in mapped_scores.items():
                scores[key] = max(scores[key], value)

    emotion = db.query(EmotionResult).filter(EmotionResult.entry_id == entry.id).first()

    if emotion is None:
        emotion = EmotionResult(entry_id=entry.id)
        db.add(emotion)

    emotion.happy = scores["happy"]
    emotion.sad = scores["sad"]
    emotion.anger = scores["anger"]
    emotion.anxiety = scores["anxiety"]

    db.commit()
    db.refresh(emotion)

    return emotion
