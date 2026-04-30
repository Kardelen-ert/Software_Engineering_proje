from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import UserRegister
from app.services import auth_services
from app.core.security import get_current_user
from app.models.user import User
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(prefix="/auth", tags=["Authentication"])


#  REGISTER
@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    return auth_services.register_user(user_data, db)


#  LOGIN
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    return auth_services.login_user(
        username=form_data.username,
        password=form_data.password,
        db=db
    )


# GET CURRENT USER
@router.get("/me")
def read_user_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }
