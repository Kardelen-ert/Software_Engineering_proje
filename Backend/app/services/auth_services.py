from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token
)


def register_user(user_data, db: Session):
    db_user = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Bu kullanıcı adı zaten alınmış."
        )

    hashed_pw = get_password_hash(user_data.password)

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Kullanıcı başarıyla oluşturuldu"
    }


def authenticate_user(username: str, password: str, db: Session):
    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def login_user(username: str, password: str, db: Session):
    user = authenticate_user(username, password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı"
        )

    token = create_access_token(
        data={"sub": user.username}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }