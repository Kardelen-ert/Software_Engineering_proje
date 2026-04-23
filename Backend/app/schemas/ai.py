from pydantic import BaseModel


class EmotionScores(BaseModel):
    happy: float
    sad: float
    anger: float
    anxiety: float


class EntryAnalysisResponse(BaseModel):
    entry_id: int
    emotion: EmotionScores
    predicted_stress: float
    recommendations: list[str]
