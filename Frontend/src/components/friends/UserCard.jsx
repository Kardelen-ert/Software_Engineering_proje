import React from "react";

export default function UserCard({ user, onAdd, onClick }) {

  /*  RANDOM CARD COLORS */
const cardColors = [
  "rgba(248, 245, 243, 0.96)", // soft cream
  "rgba(244, 247, 244, 0.96)", // sage white
  "rgba(242, 245, 247, 0.96)", // mist blue
  "rgba(247, 242, 245, 0.96)", // dusty pink
  "rgba(245, 244, 240, 0.96)", // warm linen
  "rgba(243, 242, 247, 0.96)", // lavender mist
  "rgba(248, 244, 239, 0.96)", // soft peach
  "rgba(241, 247, 244, 0.96)", // pale mint
  "rgba(246, 243, 238, 0.96)", // oat
  "rgba(241, 243, 250, 0.96)", // cloud blue
  "rgba(248, 242, 244, 0.96)", // blush white
  "rgba(244, 248, 242, 0.96)"  // pastel sage
];

 const usernameValue =
  user.username
    ?.split("")
    .reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );

const randomCardColor =
  cardColors[
    usernameValue % cardColors.length
  ];

  return (
    <div
      className="friend-card"
      onClick={() => onClick && onClick(user)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",

        padding: "16px 20px",

        borderRadius: "20px",

        background: randomCardColor,

        marginBottom: "14px",

        transition: "all 0.25s ease",

        cursor: "pointer",

        border: "1px solid rgba(255,255,255,0.65)",

        boxShadow:
          "0 4px 14px rgba(0,0,0,0.03)"
      }}
    >
      {/* LEFT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px"
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",

            borderRadius: "50%",

            background:
              "linear-gradient(135deg, #e4dbe8, #f1eaf3)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            fontWeight: "700",
            fontSize: "18px",

            color: "#555",

            border: "2px solid rgba(255,255,255,0.75)",

            boxShadow:
              "0 4px 12px rgba(0,0,0,0.05)"
          }}
        >
          {user.username?.charAt(0)}
        </div>

        <div>
          <p
            style={{
              margin: 0,
              fontWeight: "700",
              fontSize: "18px",
              color: "#2f3a33"
            }}
          >
            {user.username}
          </p>

          <p
            style={{
              marginTop: "4px",
              fontSize: "14px",
              color: "#7d7d7d",
              fontWeight: "500"
            }}
          >
            {onAdd ? "Kullanıcı" : "Bağlantın"}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      {onAdd ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(user.id);
          }}
          style={{
            border: "none",

            background:
              "linear-gradient(135deg, #7fb77e, #93c78f)",

            color: "white",

            padding: "9px 18px",

            borderRadius: "14px",

            cursor: "pointer",

            fontWeight: "600",
            fontSize: "14px",

            boxShadow:
              "0 6px 18px rgba(127, 183, 126, 0.25)",

            transition: "all 0.25s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0)";
          }}
        >
          Add
        </button>
      ) : (
        <div
          style={{
            background: "#f1ebe8",

            padding: "8px 14px",

            borderRadius: "14px",

            fontSize: "16px",

            boxShadow:
              "0 3px 10px rgba(0,0,0,0.04)"
          }}
        >
          😊
        </div>
      )}
    </div>
  );
}