from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entry import DailyEntry
from app.schemas.ai import EntryAnalysisResponse
from app.services.emotion_service import analyze_entry_nlp
from app.services.recommendation_service import generate_recommendation
from app.services.stress_model_service import predict_stress, predict_stress_batch
from app.schemas.entry import EntryCreate, EntryResponse, EntryUpdate
from app.services.entry_service import (
    DailyEntryLimitExceededError,
    create_entry,
    delete_entry,
    get_all_entries,
    update_entry,
)
router = APIRouter()


def build_analysis_response(entry, emotion, stress: float, recommendations: list[str]) -> dict:
    return {
        "entry_id": entry.id,
        "emotion": {
            "happy": emotion.happy,
            "sad": emotion.sad,
            "anger": emotion.anger,
            "anxiety": emotion.anxiety,
        },
        "predicted_stress": float(stress),
        "recommendations": recommendations,
    }


@router.post("/entries", response_model=EntryResponse)
def create_entry_endpoint(entry: EntryCreate, db: Session = Depends(get_db)):
    try:
        return create_entry(db, entry)
    except DailyEntryLimitExceededError as error:
        raise HTTPException(status_code=429, detail=str(error)) from error


@router.get("/entries", response_model=list[EntryResponse])
def get_entries(db: Session = Depends(get_db)):
    return get_all_entries(db)


@router.delete("/entries/{id}")
def delete_entry_endpoint(id: int, db: Session = Depends(get_db)):
    entry = delete_entry(db, id)

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    return {"message": "Entry deleted"}


@router.put("/entries/{id}", response_model=EntryResponse)
def update_entry_endpoint(
    id: int,
    entry: EntryUpdate = Body(...),
    db: Session = Depends(get_db)
):
    updated_entry = update_entry(db, id, entry)

    if not updated_entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    return updated_entry


@router.post("/entries/{id}/analyze", response_model=EntryAnalysisResponse)
def analyze_entry(id: int, db: Session = Depends(get_db)):
    entry = db.query(DailyEntry).filter(DailyEntry.id == id).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    emotion = analyze_entry_nlp(db, entry)
    stress = entry.stress_self
    recommendations = generate_recommendation(emotion, stress)

    return build_analysis_response(entry, emotion, stress, recommendations)


@router.get("/entries/analyze/all", response_model=list[EntryAnalysisResponse])
def analyze_all(db: Session = Depends(get_db)):
    entries = db.query(DailyEntry).all()

    if not entries:
        return []

    stresses = predict_stress_batch(entries)
    results = []

    for entry, stress in zip(entries, stresses):
    # TODO: Her istekte emotion analizi yeniden hesaplanıyor.
    # İleride performans için sonuçlar cache'lenmeli veya DB'den çekilmeli.


        emotion = analyze_entry_nlp(db, entry)
        recommendations = generate_recommendation(emotion, stress)
        results.append(build_analysis_response(entry, emotion, stress, recommendations))

    return results

