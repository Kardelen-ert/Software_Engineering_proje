import React from "react";

export default function UserCard({ user, onAdd, onClick }) {
  return (
    <div
      onClick={() => onClick && onClick(user)} // 💥 TIKLANABİLİR
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 18px",
        borderRadius: "16px",
        background: "#f6f3f2",
        marginBottom: "12px",
        transition: "0.2s",
        cursor: "pointer" // 💥 EL İKONU
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "scale(1.02)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "scale(1)")
      }
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            background: "#e0d6e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
            color: "#555"
          }}
        >
          {user.username?.charAt(0)}
        </div>

        <div>
          <p style={{ margin: 0, fontWeight: "600" }}>
            {user.username}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#777" }}>
            Arkadaş
          </p>
        </div>
      </div>

      {/* RIGHT */}
      {onAdd ? (
        <button
          onClick={(e) => {
            e.stopPropagation(); // 💥 MODAL AÇILMASIN
            onAdd(user.id);
          }}
          style={{
            border: "none",
            background: "#ddd",
            padding: "6px 12px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Add
        </button>
      ) : (
        <div
          style={{
            background: "#efe9e6",
            padding: "6px 12px",
            borderRadius: "12px",
            fontSize: "13px"
          }}
        >
          🙂
        </div>
      )}
    </div>
  );
}