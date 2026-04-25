from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.config import settings
from app.services import auth_services 
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış.")

    hashed_pw = auth_services.get_password_hash(user_data.password)

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Kullanıcı başarıyla oluşturuldu", "user_id": new_user.id}

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user_data.username).first()
    
    if not db_user or not auth_services.verify_password(user_data.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Kullanıcı adı veya şifre hatalı.")

    access_token_expires= timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_services.create_access_token(
        data={"sub": db_user.username}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

