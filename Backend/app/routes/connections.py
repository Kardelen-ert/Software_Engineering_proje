from fastapi import APIRouter

router = APIRouter()

@router.get("/connections/test")
def connections_test():
    return {"message": "connections route çalışıyor"}
#olumlu connections endpoint çalışıyor