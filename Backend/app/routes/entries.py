from fastapi import APIRouter

router = APIRouter()

@router.get("/entries/test")
def entries_test():
    return {"message": "entries route çalışıyor"}
#olumlu entries endpoint çalışıyor