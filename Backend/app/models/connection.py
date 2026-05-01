from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from app.core.database import Base


class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)

    requester_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))

    status = Column(String, default="pending")

    __table_args__ = (
        UniqueConstraint('requester_id', 'receiver_id', name='unique_connection'),
    )