import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DailySection from "../pages/DailySection/DailySection";
import MoodAnalysis from "../pages/home/moodanalysis";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/daily" replace />} />
      <Route path="/daily" element={<DailySection />} />
       <Route path="/analysis" element={<MoodAnalysis />}/>
      <Route path="*" element={<Navigate to="/daily" replace />} />
      
    </Routes>
  );
}
