import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import DailySection from "../pages/DailySection/DailySection";
import MoodAnalysis from "../pages/home/moodanalysis";

import Profile from "../pages/ProfileSection/Profile";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Home from "../pages/Home/Home";

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/daily" element={<DailySection />} />

      <Route path="/analysis" element={<MoodAnalysis />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/profile" element={<Profile />} />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
