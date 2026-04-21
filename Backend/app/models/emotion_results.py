from sqlalchemy import Column, Integer, Float, ForeignKey
from app.core.database import Base


class EmotionResult(Base):
    __tablename__ = "emotion_results"

    id = Column(Integer, primary_key=True, index=True)

    # daily_entries tablosuna bağlı
    entry_id = Column(Integer, ForeignKey("daily_entries.id"))

    happy = Column(Float, default=0)
    sad = Column(Float, default=0)
    anger = Column(Float, default=0)
    anxiety = Column(Float, default=0)