
import React from "react";
import { useEffect, useState } from "react";
import "./weeklyanalysis.css";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function WeeklyAnalysis() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("http://127.0.0.1:8000/analysis/weekly");
      const json = await res.json();
      console.log(json);
      setData(json);
    } catch (err) {
      console.error(err);
    }
  }

  if (!data) return <div className="loading">Yükleniyor...</div>;

  const emotions = data.weeklyEmotions;

  const avg = (arr) =>
    arr.length
      ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
      : 0;

  // 🎯 DOUGHNUT
  const doughnutData = {
    labels: ["Mutluluk", "Üzgünlük", "Kaygı", "Öfke"],
    datasets: [
      {
        data: [
          avg(emotions.happy),
          avg(emotions.sad),
          avg(emotions.anxiety),
          avg(emotions.anger)
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

  // 📈 LINE
  const lineData = {
    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"],
    datasets: [
      {
        label: "Mutluluk",
        data: emotions.happy,
        borderColor: "#A8E6CF",
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4
      },
      {
        label: "Üzgünlük",
        data: emotions.sad,
        borderColor: "#FF8B94",
        pointRadius: 5,
        tension: 0.4
      },
      {
        label: "Kaygı",
        data: emotions.anxiety,
        borderColor: "#FFD3B6",
        pointRadius: 5,
        tension: 0.4
      },
      {
        label: "Öfke",
        data: emotions.anger,
        borderColor: "#FFAAA5",
        pointRadius: 5,
        tension: 0.4
      }
    ]
  };

  const options = {
    plugins: {
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#333",
        bodyColor: "#555",
        borderColor: "#e0e0e0",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors:true,

        callbacks:{
          label:function(context){
            return `✨ ${context.dataset.label}: ${context.raw}%`;
          }
        }
      },
      legend: {
        position: "top"
      }
    }
  };

  return (
    <div className="container">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>☁️ Mood Analysis</h1>
          <p className="subtitle">Dashboard / Mood Analysis</p>
        </div>

        <div className="top-right">
          <span>🔔</span>
          <span>👩🏻</span>
        </div>
      </header>

      {/* TABS */}
      <div className="tabs">
        <button>Day</button>
        <button className="active">Week</button>
        <button>Month</button>
        <button>Year</button>
      </div>

      {/* TOP GRID */}
      <div className="grid">

        {/* DOUGHNUT + LEGEND */}
        <div className="card big">
          <h2>Mood Analysis</h2>

          <div className="doughnut-wrapper">
             <Doughnut data={doughnutData} />
               

            <div className="legend">
              <p>😊 {avg(emotions.happy)}% Mutlu</p>
              <p>😢 {avg(emotions.sad)}% Üzgün</p>
              <p>😰 {avg(emotions.anxiety)}% Kaygı</p>
              <p>😡 {avg(emotions.anger)}% Öfke</p>
            </div>
          </div>

          <div className="info-box">
            💡 Ruh halin genel olarak dengeli görünüyor.
          </div>
        </div>

        {/* LINE CHART */}
        <div className="card">
          <h2>Mood Trends</h2>
          <Line data={lineData} options={options} />
        </div>
      </div>

      {/* AI */}
      <div className="card ai">
        <h2>✨ Insights & Advice</h2>
        <p>{data.suggestions?.join(" ") || "Harika gidiyorsun 💖"}</p>
      </div>

      {/* NAVBAR */}
      <div className="navbar">
        <span>🏠 Home</span>
        <span>📖 Journal</span>
        <span>👥 Friends</span>
        <span>👤 Profile</span>
      </div>

    </div>
  );
}