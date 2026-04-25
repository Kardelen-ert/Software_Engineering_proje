from fastapi import FastAPI
from app.core.database import Base,engine




from app.routes.auth import router as auth_router
from app.routes.connections import router as connections_router
from app.routes.entries import router as entries_router
from app.routes.health import router as health_router
from app.routes.weekly_analysis import router as weekly_router

from app.models.user import User
from app.models import entry
from app.models import emotion_results


app = FastAPI()


Base.metadata.create_all(bind=engine)

app.include_router(health_router)
app.include_router(entries_router)
app.include_router(auth_router)
app.include_router(weekly_router)
app.include_router(connections_router)
