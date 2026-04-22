from transformers import pipeline
from app.models.emotion_results import EmotionResult

classifier= pipeline(
    "sentiment-analysis",
    model="savasy/bert-base-turkish-sentiment-cased"
)

#metni ayır
def split_text(text, max_len=400):
    words=text.split()
    chunks=[]

    for i in range(0, len(words), max_len):
        chunk=" ".join(words[i:i+max_len])
        chunks.append(chunk)
    return chunks

#duygu analizi
def analyze_entry_nlp(db, entry):
    chunks=split_text(entry.text)

    happy=0
    sad=0
    anger=0
    anxiety=0

    for c in chunks:
        result=classifier(c)[0]
        label=result["label"]
        score=result["score"]

        if label == "positive":
           happy = max(happy, score)
        else:
          sad = max(sad, score * 0.5)
          anxiety = max(anxiety, score * 0.3)
          anger = max(anger, score * 0.2)
    
    emotion=EmotionResult(
        entry_id= entry.id,
        happy=happy,
        sad=sad,
        anger=anger,
        anxiety=anxiety
    )

    db.add(emotion)
    db.commit()
    db.refresh(emotion)

    return emotion

