import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import DailySection from "../pages/DailySection/DailySection";
import MoodAnalysis from "../pages/home/moodanalysis";
import Profile from "../pages/ProfileSection/Profile";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Home from "../pages/Home/Home";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/daily"
        element={(
          <ProtectedRoute>
            <DailySection />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/analysis"
        element={(
          <ProtectedRoute>
            <MoodAnalysis />
          </ProtectedRoute>
        )}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
