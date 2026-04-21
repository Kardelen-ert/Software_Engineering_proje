from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.emotion_result import EmotionResult

router = APIRouter()

@router.get("/analysis/weekly")
def weekly_analysis(db: Session = Depends(get_db)):
    emotions = db.query(EmotionResult).all()
    if not emotions:
        return {"weekly_average": {}, "ai_report": "Henüz veri yok."}

    total = {"happy":0, "sad":0, "anger":0, "anxiety":0}
    for e in emotions:
        total["happy"] += e.happy
        total["sad"] += e.sad
        total["anger"] += e.anger
        total["anxiety"] += e.anxiety

    n = len(emotions)
    avg = {k: round(v/n, 2) for k,v in total.items()}

    report = ""
    if avg["anxiety"] > 0.5:
        report += "Bu hafta kaygı seviyen yüksek görünüyor. "
    if avg["sad"] > 0.4:
        report += "Üzüntü seviyen ortalamanın üzerinde. "
    if avg["happy"] > 0.6:
        report += "Mutluluk seviyen iyi durumda. "
    if report == "":
        report = "Bu hafta ruh halin dengeli görünüyor."

    return {"weekly_average": avg, 
            "ai_report": report}