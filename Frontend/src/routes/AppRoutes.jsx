
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WeeklyAnalysis from "../pages/home/weeklyanalysis";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/analysis" element={<WeeklyAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}