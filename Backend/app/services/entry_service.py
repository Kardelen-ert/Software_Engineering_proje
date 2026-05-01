from sqlalchemy.orm import Session
from app.models.entry import DailyEntry


def create_entry(db: Session, entry_data):
    new_entry = DailyEntry(
        text=entry_data.text,
        water_liters=entry_data.water_liters,
        sleep_hours=entry_data.sleep_hours,
        stress_self=entry_data.stress_self
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return new_entry


def get_all_entries(db: Session):
    return db.query(DailyEntry).all()


def delete_entry(db: Session, entry_id: int):
    entry = db.query(DailyEntry).filter(DailyEntry.id == entry_id).first()

    if not entry:
        return None

    db.delete(entry)
    db.commit()

    return entry



def update_entry(db: Session, entry_id: int, entry_data):
    entry = db.query(DailyEntry).filter(DailyEntry.id == entry_id).first()

    if not entry:
        return None

    update_data = entry_data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)

    return entry