from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.services.connection_service import get_friends
from app.schemas.connection import FriendResponse

from app.core.database import get_db
from app.services import user_service
from app.services.connection_service import (
    send_request,
    accept_request,
    reject_request,
    get_incoming_requests
)

from app.schemas.user import UserSearchResponse
from app.schemas.connection import (
    SendRequest,
    HandleRequest,
    IncomingRequestResponse
)

from app.core.security import get_current_user
from app.models.user import User


# Router
router = APIRouter(prefix="/connections", tags=["Connections"])


# 🔍 KULLANICI ARAMA
@router.get("/users/search", response_model=List[UserSearchResponse])
def search_users(query: str, db: Session = Depends(get_db)):
    return user_service.search_users(db, query)


# 📤 ARKADAŞLIK İSTEĞİ GÖNDER
@router.post("/request")
def send_friend_request(
    data: SendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return send_request(
        db,
        requester_id=current_user.id,
        receiver_id=data.receiver_id
    )


# ✅ İSTEĞİ KABUL ET
@router.post("/accept")
def accept_friend_request(
    data: HandleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return accept_request(db, data.request_id, current_user.id)


# ❌ İSTEĞİ REDDET
@router.post("/reject")
def reject_friend_request(
    data: HandleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return reject_request(db, data.request_id, current_user.id)


# 📥 GELEN İSTEKLERİ LİSTELE
@router.get("/incoming", response_model=List[IncomingRequestResponse])
def get_incoming(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_incoming_requests(db, current_user.id)

# 👥 ARKADAŞ LİSTESİ
@router.get("/friends", response_model=List[FriendResponse])
def friends_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_friends(db, current_user.id)