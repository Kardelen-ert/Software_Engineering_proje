from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.entry import DailyEntry


class EmotionResult(Base):
    __tablename__ = "emotion_results"

    id = Column(Integer, primary_key=True)

    # daily_entries tablosuna bağlı
    entry_id = Column(Integer, ForeignKey("daily_entries.id"),index=True)
    
    entry =relationship(DailyEntry) 
    

    happy = Column(Float, default=0,nullable=False)
    sad = Column(Float, default=0,nullable=False)
    anger = Column(Float, default=0,nullable=False)
    anxiety = Column(Float, default=0,nullable=False)