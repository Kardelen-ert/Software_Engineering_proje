import React from "react";
import { NavLink } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          gap: "12px",
          padding: "16px 20px",
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e5e7eb"
        }}
      >
        <NavLink
          to="/daily"
          style={({ isActive }) => ({
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: "999px",
            fontWeight: 700,
            color: isActive ? "#ffffff" : "#44524a",
            background: isActive ? "#95b38b" : "#f6f7f2",
            border: "1px solid #d9e2d4"
          })}
        >
          Daily
        </NavLink>
        <NavLink
          to="/analysis"
          style={({ isActive }) => ({
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: "999px",
            fontWeight: 700,
            color: isActive ? "#ffffff" : "#44524a",
            background: isActive ? "#8ea9bd" : "#f6f7f2",
            border: "1px solid #d9e2d4"
          })}
        >
          Weekly Analysis
        </NavLink>
      </nav>

      <AppRoutes />
    </>
  );
}
