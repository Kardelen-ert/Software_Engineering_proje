import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function getUserInitialFromToken(token) {
  if (!token) {
    return "P";
  }

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return "P";
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    const username = decoded?.sub;

    if (!username || typeof username !== "string") {
      return "P";
    }

    return username.charAt(0).toUpperCase();
  } catch {
    return "P";
  }
}

export default function App() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const profileInitial = getUserInitialFromToken(token);
  const hideNavbarPaths = ["/", "/login", "/register"];
  const shouldShowNavbar = Boolean(token) && !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar ? (
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "16px 20px",
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #e5e7eb"
          }}
        >
          <div />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px"
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
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <NavLink
              to="/profile"
              title="Profile"
              style={({ isActive }) => ({
                textDecoration: "none",
                width: "44px",
                height: "44px",
                borderRadius: "999px",
                fontWeight: 700,
                color: isActive ? "#ffffff" : "#44524a",
                background: isActive ? "#8f9fbe" : "#f6f7f2",
                border: "1px solid #d9e2d4",
                display: "grid",
                placeItems: "center",
                boxShadow: isActive ? "0 8px 18px rgba(143, 159, 190, 0.25)" : "none"
              })}
            >
              {profileInitial}
            </NavLink>
          </div>
        </nav>
      ) : null}

      <AppRoutes />
    </>
  );
}
