from app.models.user import User
from app.models.connection import Connection
from fastapi import HTTPException


# 🔹 İSTEK GÖNDERME
def send_request(db, requester_id, receiver_id):

    if requester_id == receiver_id:
        raise HTTPException(status_code=400, detail="Kendine istek atamazsın")

    existing = db.query(Connection).filter(
        Connection.requester_id == requester_id,
        Connection.receiver_id == receiver_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Zaten istek göndermişsin")

    new_request = Connection(
        requester_id=requester_id,
        receiver_id=receiver_id,
        status="pending"
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


# 🔹 İSTEĞİ KABUL ETME
def accept_request(db, request_id, current_user_id):
    request = db.query(Connection).filter(Connection.id == request_id).first()

    if not request:
        raise HTTPException(status_code=404, detail="İstek bulunamadı")

    if request.receiver_id != current_user_id:
        raise HTTPException(status_code=403, detail="Bu isteği kabul etme yetkin yok")

    # 🔥 EKLENECEK KONTROL
    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Bu istek zaten işlem görmüş")

    request.status = "accepted"
    db.commit()
    db.refresh(request)

    return request


# 🔹 İSTEĞİ REDDETME
def reject_request(db, request_id, current_user_id):
    request = db.query(Connection).filter(Connection.id == request_id).first()

    if not request:
        raise HTTPException(status_code=404, detail="İstek bulunamadı")

    if request.receiver_id != current_user_id:
        raise HTTPException(status_code=403, detail="Bu isteği reddetme yetkin yok")

    # 🔥 EKLENECEK KONTROL
    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Bu istek zaten işlem görmüş")

    request.status = "rejected"
    db.commit()
    db.refresh(request)

    return request

# 🔹 GELEN İSTEKLERİ LİSTELE (USERNAME İLE)
def get_incoming_requests(db, current_user_id):
    results = db.query(Connection, User)\
        .join(User, Connection.requester_id == User.id)\
        .filter(
            Connection.receiver_id == current_user_id,
            Connection.status == "pending"
        )\
        .all()

    return [
        {
            "id": connection.id,
            "requester_id": connection.requester_id,
            "requester_username": user.username,
            "status": connection.status
        }
        for connection, user in results
    ]

# 🔹 ARKADAŞ LİSTESİ (ACCEPTED OLANLAR)
def get_friends(db, current_user_id):

    connections = db.query(Connection).filter(
        (
            (Connection.requester_id == current_user_id) |
            (Connection.receiver_id == current_user_id)
        ),
        Connection.status == "accepted"
    ).all()

    friends = []

    for conn in connections:
        # karşı tarafı bul
        if conn.requester_id == current_user_id:
            friend_id = conn.receiver_id
        else:
            friend_id = conn.requester_id

        user = db.query(User).filter(User.id == friend_id).first()

        if user:
            friends.append({
                "id": user.id,
                "username": user.username
            })

    return friends