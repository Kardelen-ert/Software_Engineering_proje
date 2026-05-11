import React, { useEffect, useState } from "react";
import bear from "./bear.gif";
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

  const happy = emotions.happy || [];
  const sad = emotions.sad || [];
  const anxiety = emotions.anxiety || [];
  const anger = emotions.anger || [];

  const stress = data.weeklyStress || [];

  const avg = (arr) =>
    arr.length
      ? Math.round(arr.reduce((sum, value) => sum + value, 0) / arr.length)
      : 0;

  const moodScore =
    avg(happy) - avg(sad) - avg(anxiety) - avg(anger);

  const moodText =
    moodScore > 40
      ? "Bu hafta enerjin oldukça iyi görünüyordu 🌿"
      : moodScore > 10
      ? "Duyguların dengeli ilerliyor ✨"
      : "Biraz dinlenmeye ihtiyacın olabilir 🤍";

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
          "#A8D5BA",
          "#F6C6C6",
          "#F7D6A3",
          "#E8B4B8"
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
        borderColor: "#8CBFA3",
        backgroundColor: "#8CBFA3",
        tension: 0.4,
        pointRadius: 5
      },

      {
        label: "Üzgünlük",
        data: sad,
        borderColor: "#E6A4A4",
        backgroundColor: "#E6A4A4",
        tension: 0.4,
        pointRadius: 5
      },

      {
        label: "Kaygı",
        data: anxiety,
        borderColor: "#E8C07D",
        backgroundColor: "#E8C07D",
        tension: 0.4,
        pointRadius: 5
      },

      {
        label: "Öfke",
        data: anger,
        borderColor: "#D998A4",
        backgroundColor: "#D998A4",
        tension: 0.4,
        pointRadius: 5
      }
    ]
  };

  const stressData = {
    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"],

    datasets: [
      {
        label: "Stres",
        data: stress,
        borderColor: "#9BBFA7",
        backgroundColor: "rgba(155,191,167,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        position: "top"
      }
    }
  };

  return (
<>
    <img
      src={bear}
      alt="bear"
      className="floating-sticker"
    />

    
  
    <div className="weekly-analysis">
      

      <div className="blur blur-1"></div>
      <div className="blur blur-2"></div>

      <div className="top-section">
        <div className="welcome-card">
          <h1>Weekly Mood Analysis 🌸</h1>

          <p>
            Ruh halindeki değişimleri incele ve haftalık
            duygusal dengeni keşfet.
          </p>
        </div>

        <div className="quote-card">
          <span>✨ Haftanın Mesajı</span>

          <h3>{moodText}</h3>
        </div>
      </div>

      <div className="grid">
        <div className="card big-card">
          <h2>Duygu Dağılımı</h2>

          <div className="chart-wrapper">
            <Doughnut data={doughnutData} />
          </div>

          <div className="emotion-list">
            <div className="emotion-item happy">
              🌿 Mutluluk %{avg(happy)}
            </div>

            <div className="emotion-item sad">
              🌸 Üzgünlük %{avg(sad)}
            </div>

            <div className="emotion-item anxiety">
              ☁️ Kaygı %{avg(anxiety)}
            </div>

            <div className="emotion-item anger">
              🔥 Öfke %{avg(anger)}
            </div>
          </div>
        </div>

        <div className="side-cards">
          <div className="mini-card">
            <span>🫶 Ortalama Mutluluk</span>

            <h2>%{avg(happy)}</h2>
          </div>

          <div className="mini-card">
            <span>😴 Stres Seviyesi</span>

            <h2>{data.stressLevel}/10</h2>
          </div>

          <div className="mini-card">
            <span>🌙 Haftalık Durum</span>

            <h2>
              {moodScore > 20 ? "Dengeli" : "Hassas"}
            </h2>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="card">
          <h2>Duygu Trendleri 📈</h2>

          <Line data={lineData} options={options} />
        </div>

        <div className="card">
          <h2>Stres Analizi 🌿</h2>

          <Line data={stressData} options={options} />
        </div>
      </div>

      <div className="card advice-card">
        <h2>İçgörü & Tavsiyeler 💌</h2>

        <p>
          {data.suggestions?.join(" ") ||
            "Bu hafta genel olarak dengeli görünüyorsun 🌸"}
        </p>
      </div>
    </div>
    </>
  );
}
