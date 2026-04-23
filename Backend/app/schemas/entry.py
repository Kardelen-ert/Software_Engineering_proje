from pydantic import BaseModel

class EntryCreate(BaseModel):
    text: str
    water_liters: float | None = None
    sleep_hours: float | None = None
    stress_self: float | None = None