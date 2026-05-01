from pydantic import BaseModel
from pydantic import Field
from typing import Optional


class EntryCreate(BaseModel):
    text: str
    water_liters: float | None = None
    sleep_hours: float | None = None
    stress_self: float | None = None


class EntryResponse(BaseModel):
    id: int
    text: str
    water_liters: float | None = None
    sleep_hours: float | None = None
    stress_self: float | None = None

    class Config:
        from_attributes = True


class EntryUpdate(BaseModel):
    text: str | None = None
    water_liters: float | None = None
    sleep_hours: float | None = None
    stress_self: float | None = None

    class Config:
        extra = "ignore"