from __future__ import annotations

from pathlib import Path

import torch
from sqlalchemy.orm import Session
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from app.models.emotion_results import EmotionResult


LABEL_COLUMNS = ["happy", "sad", "anger", "anxiety"]
MODEL_DIR = Path(__file__).resolve().parents[2] / "models" / "emotion_model"
_tokenizer = None
_model = None


def get_emotion_model():
    global _tokenizer, _model

    if _tokenizer is None or _model is None:
        if not MODEL_DIR.exists():
            raise FileNotFoundError(
                f"Emotion model not found: {MODEL_DIR}. "
                "Önce Backend/train_emotion_model.py ile modeli eğit."
            )

        _tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        _model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        _model.eval()

    return _tokenizer, _model


def split_text(text: str, max_words: int = 200) -> list[str]:
    clean_text = (text or "").strip()
    if not clean_text:
        return []

    words = clean_text.split()
    return [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]


def predict_chunk_scores(text: str) -> dict[str, float]:
    tokenizer, model = get_emotion_model()
    encoded = tokenizer(
        text,
        truncation=True,
        padding=True,
        max_length=128,
        return_tensors="pt",
    )

    with torch.no_grad():
        outputs = model(**encoded)
        probabilities = torch.sigmoid(outputs.logits).squeeze(0).cpu().tolist()

    return {label: float(score) for label, score in zip(LABEL_COLUMNS, probabilities)}


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

    for chunk in chunks:
        chunk_scores = predict_chunk_scores(chunk)
        for key, value in chunk_scores.items():
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
