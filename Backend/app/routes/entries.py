from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entry import Entry  

from app.services.emotion_service import analyze_entry_nlp
from app.services.stress_model_service import predict_stress, predict_stress_batch
from app.services.recommendation_service import generate_recommendations

router = APIRouter()


@router.post("/entries/{id}/analyze")
def analyze_entry(id: int, db: Session = Depends(get_db)):

    entry = db.query(Entry).filter(   
        Entry.id == id
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    emotion = analyze_entry_nlp(db, entry)
    stress = predict_stress(entry)
    rec = generate_recommendations(emotion, stress)

    return {
        "entry_id": entry.id,
        "emotion": {
            "happy": emotion.happy,
            "sad": emotion.sad,
            "anger": emotion.anger,
            "anxiety": emotion.anxiety
        },
        "predicted_stress": float(stress),
        "recommendations": rec
    }


@router.get("/entries/analyze/all")
def analyze_all(db: Session = Depends(get_db)):

    entries = db.query(Entry).all()   

    if not entries:
        return {"message": "No entries found"}

    stresses = predict_stress_batch(entries)

    results = []

    for entry, stress in zip(entries, stresses):

        emotion = analyze_entry_nlp(db, entry)
        rec = generate_recommendations(emotion, stress)

        results.append({
            "entry_id": entry.id,
            "emotion": {
                "happy": emotion.happy,
                "sad": emotion.sad,
                "anger": emotion.anger,
                "anxiety": emotion.anxiety
            },
            "predicted_stress": float(stress),
            "recommendations": rec
        })

    return results
