import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DailySection from "../pages/DailySection/DailySection";
import WeeklyAnalysis from "../pages/home/weeklyanalysis";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/daily" replace />} />
      <Route path="/daily" element={<DailySection />} />
      <Route path="/analysis" element={<WeeklyAnalysis />} />
      <Route path="*" element={<Navigate to="/daily" replace />} />
    </Routes>
  );
}
