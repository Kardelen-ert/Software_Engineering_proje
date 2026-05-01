from pydantic import BaseModel

class SendRequest(BaseModel):
    receiver_id: int

class HandleRequest(BaseModel):
    request_id: int

class IncomingRequestResponse(BaseModel):
    id: int
    requester_id: int
    requester_username: str
    status: str

class FriendResponse(BaseModel):
    id: int
    username: str