from transformers import pipeline 
from app.models.emotion_results import EmotionResult

classifier = pipeline(
    "sentiment-analysis",
    model="savasy/bert-base-turkish-sentiment-cased"
)

def analyze_entry_nlp(db, entry):
    
    result=classifier(entry.text)[0]

    label=result["Label"]
    score=result["score"]

    happy=0
    sad=0
    anger=0
    anxiety=0

    if label == "pozitive":
        happy=score
    
    else:
        sad=score
        anxiety=score * 0,7
    
    emotion= EmotionResult(
        entry_id=entry.id,
        happy=happy,
        sad=sad,
        anger=anger,
        anxiety=anxiety
    )

    db.add(emotion)
    db.commit()
    db.refresh(emotion)

    return emotion