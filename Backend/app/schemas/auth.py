from pydantic import BaseModel,Field

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    password: str = Field(..., min_length=8, description="Şifre en az 8 karakter olmalı")

class UserLogin(BaseModel):
    username: str
    password: str