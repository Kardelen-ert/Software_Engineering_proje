import React, { useState } from "react";

import DailyAnalysis from "./dailyanalysis";
import WeeklyAnalysis from "./weeklyanalysis";

import "./moodanalysis.css";

export default function MoodAnalysis() {

  const [activeTab, setActiveTab] = useState("day");

  return (

    <div className="analysis-page">

      {/* HEADER */}
      <div className="analysis-header">

        <h1>Mood Analysis</h1>

        <p>Dashboard / Mood Analysis</p>

      </div>

      {/* TABS */}
      <div className="analysis-tabs">

        <button
          className={activeTab === "day" ? "active" : ""}
          onClick={() => setActiveTab("day")}
        >
          Day
        </button>

        <button
          className={activeTab === "week" ? "active" : ""}
          onClick={() => setActiveTab("week")}
        >
          Week
        </button>

        <button
          className={activeTab === "month" ? "active" : ""}
          onClick={() => setActiveTab("month")}
        >
          Month
        </button>

        <button
          className={activeTab === "year" ? "active" : ""}
          onClick={() => setActiveTab("year")}
        >
          Year
        </button>

      </div>

      {/* CONTENT */}
      <div className="analysis-content">

        {activeTab === "day" && <DailyAnalysis />}

        {activeTab === "week" && <WeeklyAnalysis />}

        {activeTab === "month" && (
          <div className="fake-card">
            Monthly analysis coming soon 🌿
          </div>
        )}

        {activeTab === "year" && (
          <div className="fake-card">
            Yearly analysis coming soon 🌸
          </div>
        )}

      </div>

    </div>
  );
}