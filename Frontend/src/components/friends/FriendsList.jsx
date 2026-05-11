import React, { useState } from "react";
import UserCard from "./UserCard";

export default function FriendsList({ friends }) {
  const [selectedFriend, setSelectedFriend] = useState(null); // 💥 STATE

  if (!friends || friends.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#777" }}>
        <p>Henüz arkadaşın yok 🫠</p>
        <p>Yeni arkadaşlar ekleyerek başlayabilirsin</p>
      </div>
    );
  }

  return (
    <>
      <div>
        {friends.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => setSelectedFriend(user)} // 💥 TIKLAYINCA AÇ
          />
        ))}
      </div>

      {/* 💥 COMING SOON MODAL */}
      {selectedFriend && (
        <div
          onClick={() => setSelectedFriend(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "20px",
              width: "320px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>
              {selectedFriend.username}
            </h2>

            <p style={{ color: "#666", marginBottom: "20px" }}>
              🚧 Yakında burada arkadaşının analizlerini görebilecek ve emoji gönderebileceksin!
            </p>

            <button
              onClick={() => setSelectedFriend(null)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#ddd",
                cursor: "pointer"
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}