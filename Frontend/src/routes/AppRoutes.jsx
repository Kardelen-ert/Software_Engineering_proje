import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DailySection from "../pages/DailySection/DailySection";
import WeeklyAnalysis from "../pages/home/weeklyanalysis";
import Profile from '../pages/ProfileSection/Profile';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/daily" replace />} />
      <Route path="/daily" element={<DailySection />} />
      <Route path="/analysis" element={<WeeklyAnalysis />} />
      <Route path="*" element={<Navigate to="/daily" replace />} />
       <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
