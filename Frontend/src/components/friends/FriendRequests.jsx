import React from "react";
import { acceptRequest, rejectRequest } from "../../services/friendServices";

export default function FriendRequests({ requests, refresh }) {
  if (!requests || requests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#777" }}>
        <p>Hiç istek yok 📭</p>
      </div>
    );
  }

  const handleAccept = async (id) => {
    try {
      await acceptRequest(id);
      alert("Kabul edildi ✅");
      refresh && refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id);
      alert("Reddedildi ❌");
      refresh && refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            background: "#ffffff",
            padding: "14px 18px",
            borderRadius: "16px",
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            transition: "0.2s"
          }}
        >
          {/* USER */}
          <div style={{ fontWeight: "600", fontSize: "15px" }}>
            {req.requester_username}
          </div>

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: "10px" }}>
            {/* ACCEPT */}
            <button
              onClick={() => handleAccept(req.id)}
              style={{
                background: "#4CAF50",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                transition: "0.2s"
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              ✔ Accept
            </button>

            {/* REJECT */}
            <button
              onClick={() => handleReject(req.id)}
              style={{
                background: "#ff5c5c",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                transition: "0.2s"
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}