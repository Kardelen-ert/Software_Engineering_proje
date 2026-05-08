import React, { useEffect, useState } from "react";

import { Doughnut, Line } from "react-chartjs-2";

import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";

import "./weeklyanalysis.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_URL = "http://127.0.0.1:8000/analysis/weekly";

export default function WeeklyAnalysis() {

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    try {

      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Analiz verisi alınamadı.");
      }

      const json = await response.json();

      setData(json);

    } catch (err) {

      console.error(err);

      setError(err.message || "Analiz yüklenemedi.");
    }
  }

  if (error) {
    return <div className="loading">{error}</div>;
  }

  if (!data) {
    return <div className="loading">Haftalık analiz yükleniyor...</div>;
  }

  const emotions = data.weeklyEmotions || {};

  const happy = Array.isArray(emotions.happy)
    ? emotions.happy
    : [];

  const sad = Array.isArray(emotions.sad)
    ? emotions.sad
    : [];

  const anxiety = Array.isArray(emotions.anxiety)
    ? emotions.anxiety
    : [];

  const anger = Array.isArray(emotions.anger)
    ? emotions.anger
    : [];

  const avg = (arr) =>
    Array.isArray(arr) && arr.length
      ? Math.round(
          arr.reduce((sum, value) => sum + value, 0) / arr.length
        )
      : 0;

  const doughnutData = {
    labels: ["Mutluluk", "Üzgünlük", "Kaygı", "Öfke"],

    datasets: [
      {
        data: [
          avg(happy),
          avg(sad),
          avg(anxiety),
          avg(anger)
        ],

        backgroundColor: [
          "#A8E6CF",
          "#FF8B94",
          "#FFD3B6",
          "#FFAAA5"
        ],

        borderWidth: 0
      }
    ]
  };

  const lineData = {

    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"],

    datasets: [
      {
        label: "Mutluluk",
        data: happy,
        borderColor: "#A8E6CF",
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4
      },

      {
        label: "Üzgünlük",
        data: sad,
        borderColor: "#FF8B94",
        pointRadius: 5,
        tension: 0.4
      },

      {
        label: "Kaygı",
        data: anxiety,
        borderColor: "#FFD3B6",
        pointRadius: 5,
        tension: 0.4
      },

      {
        label: "Öfke",
        data: anger,
        borderColor: "#FFAAA5",
        pointRadius: 5,
        tension: 0.4
      }
    ]
  };

  const options = {

    responsive: true,

    plugins: {

      tooltip: {

        backgroundColor: "#ffffff",
        titleColor: "#333",
        bodyColor: "#555",
        borderColor: "#e0e0e0",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,

        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      },

      legend: {
        position: "top"
      }
    }
  };

  return (

    <div className="weekly-analysis">

      <div className="grid">

        {/* Doughnut Card */}
        <div className="card big">

          <h2>Mood Analysis</h2>

          <div className="doughnut-wrapper">

            <Doughnut data={doughnutData} />

            <div className="legend">

              <p>{avg(happy)}% Mutlu</p>

              <p>{avg(sad)}% Üzgün</p>

              <p>{avg(anxiety)}% Kaygılı</p>

              <p>{avg(anger)}% Öfkeli</p>

            </div>

          </div>

          <div className="info-box">
            Ruh halinin haftalık dağılımı burada görünüyor 🌿
          </div>

        </div>

        {/* Line Chart */}
        <div className="card">

          <h2>Mood Trends</h2>

          <Line data={lineData} options={options} />

        </div>

      </div>

      {/* AI Advice */}
      <div className="card ai">

        <h2>Insights & Advice</h2>

        <p>
          {data.suggestions?.join(" ") ||
            "Bu hafta genel olarak dengeli görünüyorsun 🌸"}
        </p>

      </div>

    </div>
  );
}
