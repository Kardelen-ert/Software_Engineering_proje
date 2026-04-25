from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entry import DailyEntry
from app.schemas.ai import EntryAnalysisResponse
from app.services.emotion_service import analyze_entry_nlp
from app.services.recommendation_service import generate_recommendation
from app.services.stress_model_service import predict_stress, predict_stress_batch
from app.schemas.entry import EntryCreate
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


@router.post("/entries")
def create_entry(entry: EntryCreate, db: Session = Depends(get_db)):
    new_entry = DailyEntry(
        text=entry.text,
        water_liters=entry.water_liters,
        sleep_hours=entry.sleep_hours,
        stress_self=entry.stress_self
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return {
        "id": new_entry.id,
        "message": "Entry created successfully"
    }


@router.get("/entries")
def get_entries(db: Session = Depends(get_db)):
    entries = db.query(DailyEntry).all()

    if not entries:
        return []

    return entries


@router.delete("/entries/{id}")
def delete_entry(id: int, db: Session = Depends(get_db)):

    entry = db.query(DailyEntry).filter(DailyEntry.id == id).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    db.delete(entry)
    db.commit()

    return {"message": "Entry deleted"}



@router.post("/entries/{id}/analyze", response_model=EntryAnalysisResponse)
def analyze_entry(id: int, db: Session = Depends(get_db)):
    entry = db.query(DailyEntry).filter(DailyEntry.id == id).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    emotion = analyze_entry_nlp(db, entry)
    stress = predict_stress(entry)
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
