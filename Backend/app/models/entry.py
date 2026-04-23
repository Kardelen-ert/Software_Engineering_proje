from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from datetime import datetime

from app.core.database import Base


class DailyEntry(Base):
    __tablename__ = "daily_entries"

    id = Column(Integer, primary_key=True, index=True)

    #user_id = Column(Integer, ForeignKey("users.id"))
# TODO: User sistemi henüz aktif değil (MVP aşaması)
# Bu yüzden ForeignKey geçici olarak devre dışı bırakıldı.
# User modeli ve users tablosu eklendiğinde tekrar aktif edilecek.
# user_id = Column(Integer, ForeignKey("users.id"))




    text = Column(Text)  

    water_liters = Column(Float)
    sleep_hours = Column(Float)
    stress_self = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)