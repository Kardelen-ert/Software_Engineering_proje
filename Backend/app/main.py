
from fastapi import FastAPI
from app.routes.health import router as health_routher
from app.routes.entries import router as entries_router
from app.routes.auth import router as auth_router
from app.routes.connections import router as connections_router
from app.routes.weekly_analysis import router as weekly_router
app=FastAPI()
app.include_router(health_routher)
app.include_router(entries_router)
app.include_router(auth_router)
app.include_router(weekly_router)
app.include_router(connections_router)


