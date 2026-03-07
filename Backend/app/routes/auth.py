from fastapi import APIRouter

router = APIRouter()

@router.get("/auth/test")
def auth_test():
    return {"message": "auth route çalışıyor"} #kontrol
#olumlu route endpoint çalışıyor