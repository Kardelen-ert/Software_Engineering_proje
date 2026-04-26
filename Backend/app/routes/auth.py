from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.config import settings
from app.services import auth_services 
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin
from app.services.auth_services import get_current_user
from fastapi.security import OAuth2PasswordRequestForm


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
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
   
    # 1. Kullanıcıyı form_data.username ile veritabanında bul
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # 2. Kullanıcı yoksa veya şifre (form_data.password) eşleşmiyorsa hata ver
    if not user or not auth_services.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Her şey doğruysa Token oluştur
    access_token = auth_services.create_access_token(data={"sub": user.username})
    
    # 4. Token'ı döndür (FastAPI'nin beklediği format budur)
    return {"access_token": access_token, "token_type": "bearer"}
    
    


@router.get("/me")
def read_user_me(current_user: User = Depends(get_current_user)):
   
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }
