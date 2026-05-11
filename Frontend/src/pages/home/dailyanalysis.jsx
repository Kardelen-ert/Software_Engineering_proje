import React, { useEffect, useState } from "react";
import "./dailyanalysis.css";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = "http://127.0.0.1:8000/analysis/daily";

const quotes = [
  "Bugün küçük bir adım atman bile yeterli 🌱",
  "Duyguların geçici, sen güçlüsün ✨",
  "Kendine nazik davranmayı unutma 💚",
  "Dinlenmek de üretkenliğin bir parçasıdır ☁️",
  "Şu an elinden gelenin en iyisini yapıyorsun 🌸",
];

export default function DailyAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="daily-loading">
        Günlük analiz yükleniyor...
      </div>
    );
  }

  const emotions = data.dailyEmotions || {};

  const chartData = {
    labels: ["Mutluluk", "Üzgünlük", "Kaygı", "Öfke"],
    datasets: [
      {
        data: [
          emotions.happy || 0,
          emotions.sad || 0,
          emotions.anxiety || 0,
          emotions.anger || 0,
        ],
        backgroundColor: [
          "#B8D8BA",
          "#F5CFCF",
          "#F8E1B7",
          "#E8BDBD",
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="daily-page">

      <div className="bg-blob blob1"></div>
      <div className="bg-blob blob2"></div>

      <div className="daily-top">

        <div className="chart-card fade-up">

          <h2>🌿 Günlük Ruh Hali</h2>

          <div className="chart-wrapper">
            <Doughnut data={chartData} />
          </div>

        </div>

        <div className="stats-column">

          <div className="stat-card fade-up">
            <span>😵‍💫 Stres</span>
            <h1>{data.stressLevel}/10</h1>
          </div>

          <div className="stat-card fade-up">
            <span>💧 Su</span>
            <h1>{data.waterAvg} L</h1>
          </div>

          <div className="stat-card fade-up">
            <span>😴 Uyku</span>
            <h1>{data.sleepAvg} Saat</h1>
          </div>

        </div>

      </div>

      <div className="summary-card fade-up">

        <h2>✨ Günlük Özet</h2>

        <p>
          {data.suggestions?.join(" ") ||
            "Bugün dengeli görünüyorsun."}
        </p>

      </div>

      <div className="quote-card fade-up">

        <h2>🌸 Günün Motivasyon Sözü</h2>

        <p>
          {quotes[Math.floor(Math.random() * quotes.length)]}
        </p>

      </div>

      <div className="advice-card fade-up">

        <h2>💚 İçgörü & Tavsiyeler</h2>

        {data.detailedAdvice?.map((item, index) => (
          <div key={index} className="advice-item">
            ✨ {item}
          </div>
        ))}

      </div>

    </div>
  );
}