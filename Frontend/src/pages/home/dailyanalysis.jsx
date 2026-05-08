import React, { useEffect, useState } from "react";
import "./dailyanalysis.css";

import { Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function DailyAnalysis() {

  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/analysis/daily"
      );

      const json = await res.json();

      setData(json);

    } catch (err) {
      console.error(err);
    }
  }

  if (!data) {
    return (
      <div className="daily-loading">
        Günlük analiz yükleniyor...
      </div>
    );
  }

  const emotions = data.dailyEmotions;

  const doughnutData = {

    labels: [
      "Mutluluk",
      "Üzgünlük",
      "Kaygı",
      "Öfke"
    ],

    datasets: [
      {
        data: [
          emotions.happy,
          emotions.sad,
          emotions.anxiety,
          emotions.anger
        ],

        backgroundColor: [
          "#A8E6CF",
          "#FFB7B2",
          "#FFD8A8",
          "#FFAAA5"
        ],

        borderWidth: 0,
        hoverOffset: 12
      }
    ]
  };

  const doughnutOptions = {

    plugins: {
      legend: {
        position: "top"
      }
    },

    cutout: "68%"
  };

  return (

    <div className="daily-analysis">

      {/* TOP GRID */}

      <div className="daily-top-grid">

        {/* CHART */}

        <div className="daily-card chart-card">

          <div className="card-header">
            <h2>🌿 Günlük Ruh Hali</h2>
          </div>

          <div className="chart-wrapper">

            <Doughnut
              data={doughnutData}
              options={doughnutOptions}
            />

          </div>

        </div>

        {/* METRICS */}

        <div className="daily-metrics">

          <div className="metric-card">
            <span>😵‍💫 Stres</span>
            <h3>{data.stressLevel} / 10</h3>
          </div>

          <div className="metric-card">
            <span>💧 Su</span>
            <h3>{data.waterAvg} L</h3>
          </div>

          <div className="metric-card">
            <span>😴 Uyku</span>
            <h3>{data.sleepAvg} Saat</h3>
          </div>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="daily-card summary-card">

        <h2>✨ Günlük Özet</h2>

        <p>
          {data.suggestions?.join(" ")}
        </p>

      </div>

      {/* ADVICE */}

      <div className="daily-card">

        <h2>💚 İçgörü & Tavsiyeler</h2>

        <div className="advice-list">

          {data.detailedAdvice?.map((item, index) => (

            <div
              className="advice-item"
              key={index}
            >
              ✨ {item}
            </div>

          ))}

        </div>

      </div>

    </div>
  );
}