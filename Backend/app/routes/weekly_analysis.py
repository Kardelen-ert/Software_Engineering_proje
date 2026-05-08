from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.emotion_results import EmotionResult
from app.models.entry import DailyEntry
from app.services.emotion_service import analyze_entry_nlp

router = APIRouter()

@router.get("/analysis/weekly")
def weekly_analysis(db: Session = Depends(get_db)):
    entries = db.query(DailyEntry).order_by(DailyEntry.created_at.asc()).all()
    results = []

    for entry in entries:
        emotion = db.query(EmotionResult).filter(EmotionResult.entry_id == entry.id).first()

        if emotion is None:
            try:
                emotion = analyze_entry_nlp(db, entry)
            except Exception:
                emotion = EmotionResult(entry_id=entry.id, happy=0, sad=0, anger=0, anxiety=0)
                db.add(emotion)
                db.commit()
                db.refresh(emotion)

        results.append((emotion, entry))

    if not results:
        return {
            "weeklyEmotions": {
              "happy":[],
              "sad": [],
              "anxiety": [],
              "anger": []
               
           },
           "WeeklyStress":[],
           "stressLevel": 0,
           "suggestions":["henüz yeterli veri yok ama iyi gidiyorsun!"]
        } 

    last = results[-7:]

    weekly_emotions = {
        "happy": [round(e.happy * 100) for e,entry in last],
        "sad": [round(e.sad * 100) for e,entry in last],
        "anxiety": [round(e.anxiety * 100) for e,entry in last],
        "anger": [round(e.anger * 100) for e,entry in last],
        }
        
    weekly_stress = [
        round((entry.stress_self or 0) * 10)
        for e,entry in last
        ]
        
    stress_values = [
        entry.stress_self for e,entry in results
        if entry.stress_self is not None
        ]

    if stress_values:
          stress_level = round(sum(stress_values) / len(stress_values), 1)
    else:
        stress_level = 0

    total = {"happy": 0, "sad": 0, "anger": 0, "anxiety": 0}

    for e,entry in results:
        total["happy"] += e.happy
        total["sad"] += e.sad
        total["anger"] += e.anger
        total["anxiety"] += e.anxiety

    n = len(results)
    avg = {k: v / n for k, v in total.items()}

    # 🔹 AI RAPOR
    report = ""

    if avg["anxiety"] > 0.5:
        report += "Kaygı seviyen biraz yüksek. "
    if avg["sad"] > 0.4:
        report += "Üzüntü seviyen ortalamanın üstünde. "
    if avg["happy"] > 0.6:
        report += "Mutluluk seviyen iyi durumda. "

    if report == "":
        report = "Ruh halin dengeli görünüyor."

    return {
        "weeklyEmotions": weekly_emotions,
        "weeklyStress": weekly_stress,
        "stressLevel": stress_level,
        "suggestions": [report]
    }    
