from fastapi import APIRouter

router = APIRouter()

@router.get("/ai/test")
def ai_test():
    return {"message": "ai route çalışıyor"} #ham json mesajı
#olumlu ai endpoint çalışıyor
