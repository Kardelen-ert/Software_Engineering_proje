import { useEffect, useState } from "react";
import "./weeklyanalysis.css";

export default function WeeklyAnalysis() {

  const [data, setData] = useState(null);

  useEffect(() => {
    loadChart();
  }, []);

  async function loadChart() {
    try {
      const res = await fetch("http://127.0.0.1:8000/analysis/weekly");
      const json = await res.json();

      console.log("API DATA:", json);

      setData(json);

      updateBars(json);
      updateStress(json);
      updateAdvice(json);
      drawChart(json);

    } catch (err) {
      console.error("API ERROR:", err);
    }
  }

  function updateBars(data) {
    const emotions = data.weeklyEmotions;

    const avg = (arr) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    const happy = avg(emotions.happy);
    const sad = avg(emotions.sad);
    const anxiety = avg(emotions.anxiety);
    const anger = avg(emotions.anger);

    setBar("happyBar", "happyText", happy);
    setBar("sadBar", "sadText", sad);
    setBar("anxietyBar", "anxietyText", anxiety);
    setBar("angerBar", "angerText", anger);
  }

  function setBar(barId, textId, value) {
    const bar = document.getElementById(barId);
    const text = document.getElementById(textId);

    if (bar) bar.style.width = value + "%";
    if (text) text.innerText = value + "%";
  }

  function updateStress(data) {
    const el = document.getElementById("stressValue");
    if (el) el.innerText = `${data.stressLevel} / 10`;
  }

  function updateAdvice(data) {
    const el = document.getElementById("adviceText");

    if (!el) return;

    if (data.suggestions && data.suggestions.length > 0) {
      el.innerText = data.suggestions.join(" ");
    } else {
      el.innerText = "Şu an öneri yok.";
    }
  }

  function drawChart(data) {
    const canvas = document.getElementById("trendChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;

    const emotions = data.weeklyEmotions;
    const stress = data.weeklyStress;

    const colors = {
      happy: "#A8E6CF",
      sad: "#B8D8E3",
      anxiety: "#FFE0B2",
      anger: "#FFCDD2",
      stress: "#C5E1A5"
    };

    function drawLine(values, color) {
      if (!values || values.length === 0) return;

      const stepX = (w - padding * 2) / (values.length - 1);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;

      values.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = h - padding - (val / 100) * (h - padding * 2);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    }

    function drawDots(values, color) {
      if (!values) return;

      const stepX = (w - padding * 2) / (values.length - 1);

      values.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = h - padding - (val / 100) * (h - padding * 2);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    }

    function drawGrid() {
      ctx.strokeStyle = "rgba(120,140,130,0.2)";
      ctx.lineWidth = 1;

      for (let i = 0; i <= 5; i++) {
        let y = padding + ((h - padding * 2) / 5) * i;

        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
        ctx.stroke();
      }
    }

    ctx.clearRect(0, 0, w, h);
    drawGrid();

    drawLine(emotions.happy, colors.happy);
    drawDots(emotions.happy, colors.happy);

    drawLine(emotions.sad, colors.sad);
    drawDots(emotions.sad, colors.sad);

    drawLine(emotions.anxiety, colors.anxiety);
    drawDots(emotions.anxiety, colors.anxiety);

    drawLine(emotions.anger, colors.anger);
    drawDots(emotions.anger, colors.anger);

    drawLine(stress, colors.stress);
    drawDots(stress, colors.stress);
  }

  return (
    <div className="container">

      <header>
        <h1>🌿 Ruh Hali Analizi</h1>
        <button onClick={loadChart}>Analiz Et</button>
      </header>

      <div className="grid">

        {/* DUYGULAR */}
        <div className="card">
          <h2>Duygu Dağılımı</h2>

          <div className="bar-group">
            <label>Üzgünlük</label>
            <div className="bar"><div id="sadBar"></div></div>
            <span id="sadText">0%</span>
          </div>

          <div className="bar-group">
            <label>Kaygı</label>
            <div className="bar"><div id="anxietyBar"></div></div>
            <span id="anxietyText">0%</span>
          </div>

          <div className="bar-group">
            <label>Öfke</label>
            <div className="bar"><div id="angerBar"></div></div>
            <span id="angerText">0%</span>
          </div>

          <div className="bar-group">
            <label>Mutluluk</label>
            <div className="bar"><div id="happyBar"></div></div>
            <span id="happyText">0%</span>
          </div>
        </div>

        {/* STRES */}
        <div className="card">
          <h2>Stres Seviyesi</h2>
          <div className="stress-number" id="stressValue">0 / 10</div>
        </div>

        {/* AI */}
        <div className="card full">
          <h2>AI Tavsiyesi</h2>
          <p id="adviceText">Analiz Et butonuna bas</p>
        </div>

        {/* CHART */}
        <div className="card full">
          <h2>Haftalık Ruh Hali Grafiği</h2>
          <div className="chart">
            <canvas id="trendChart"></canvas>
          </div>
        </div>

      </div>
    </div>
  );
}