from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.models.entry import DailyEntry
from app.models.emotion_results import EmotionResult

from datetime import datetime

from app.services.recommendation_service import generate_recommendation

router = APIRouter()

@router.get("/analysis/daily")
def daily_analysis(db: Session = Depends(get_db)):

    today = datetime.utcnow().date()

    results = (
        db.query(EmotionResult, DailyEntry)
        .join(DailyEntry, EmotionResult.entry_id == DailyEntry.id)
        .all()
    )

    # sadece bugünkü entryler
    today_results = [
        (e, entry)
        for e, entry in results
        if entry.created_at.date() == today
    ]

    # max son 5 giriş
    today_results = today_results[-5:]

    if not today_results:
        return {
            "dailyEmotions": {
                "happy": 0,
                "sad": 0,
                "anxiety": 0,
                "anger": 0
            },
            "stressLevel": 0,
            "sleepAvg": 0,
            "waterAvg": 0,
            "suggestions": [
                "Bugün için henüz veri bulunmuyor."
            ],
            "detailedAdvice": []
        }

    # emotion ortalamaları
    total = {
        "happy": 0,
        "sad": 0,
        "anxiety": 0,
        "anger": 0
    }

    stress_values = []
    sleep_values = []
    water_values = []

    detailed_advice = []

    for e, entry in today_results:

        total["happy"] += e.happy
        total["sad"] += e.sad
        total["anxiety"] += e.anxiety
        total["anger"] += e.anger

        if entry.stress_self is not None:
            stress_values.append(entry.stress_self)

        if entry.sleep_hours is not None:
            sleep_values.append(entry.sleep_hours)

        if entry.water_liters is not None:
            water_values.append(entry.water_liters)

        # AI recommendation üret
        recommendations = generate_recommendation(
            e,
            entry.stress_self or 0
        )

        detailed_advice.extend(recommendations)

    n = len(today_results)

    daily_emotions = {
        "happy": round((total["happy"] / n) * 100),
        "sad": round((total["sad"] / n) * 100),
        "anxiety": round((total["anxiety"] / n) * 100),
        "anger": round((total["anger"] / n) * 100),
    }

    stress_level = (
        round(sum(stress_values) / len(stress_values), 1)
        if stress_values else 0
    )

    sleep_avg = (
        round(sum(sleep_values) / len(sleep_values), 1)
        if sleep_values else 0
    )

    water_avg = (
        round(sum(water_values) / len(water_values), 1)
        if water_values else 0
    )

    # kısa summary
    report = ""

    if daily_emotions["sad"] > 50:
        report += "Bugün duygusal olarak biraz zorlanıyor görünüyorsun. "

    if daily_emotions["anxiety"] > 40:
        report += "Kaygı seviyen gün içinde yükselmiş olabilir. "

    if daily_emotions["happy"] > 60:
        report += "Bugün genel olarak olumlu bir ruh halindesin. "

    if stress_level > 6:
        report += "Stres seviyen biraz yüksek görünüyor. "

    if report == "":
        report = "Bugünkü ruh hali verilerin dengeli görünüyor."

    # tekrar eden recommendationları temizle
    detailed_advice = list(set(detailed_advice))

    return {
        "dailyEmotions": daily_emotions,
        "stressLevel": stress_level,
        "sleepAvg": sleep_avg,
        "waterAvg": water_avg,
        "suggestions": [report],
        "detailedAdvice": detailed_advice
    }