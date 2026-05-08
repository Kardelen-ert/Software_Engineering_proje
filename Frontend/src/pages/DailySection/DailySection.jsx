import React, { useEffect, useMemo, useState } from "react";
import "./DailySection.css";

const API_URL = "http://127.0.0.1:8000";
const HISTORY_KEY = "moodtrack-habit-history";
const PROFILE_KEY = "moodtrack-profile-habits";

const baseHabitGroups = [
  {
    title: "Sağlık",
    description: "Bedene iyi gelen günlük hedefler",
    accent: "health",
    habits: [
      { name: "Su içtim", category: "Sağlık",  theme: "theme-water", description: "Günlük su hedefimi tamamladım.", defaultRate: 80 },
      { name: "Spor yaptım", category: "Sağlık", theme: "theme-move", description: "Hareket ederek enerjimi yükselttim.", defaultRate: 60 },
      { name: "Erken uyudum", category: "Sağlık", theme: "theme-sleep", description: "Uyku düzenimi koruyarak dinlendim.", defaultRate: 40 }
    ]
  },
  {
    title: "Zihin",
    description: "Ruh halini sakinleştiren küçük pratikler",
    accent: "mind",
    habits: [
      { name: "Meditasyon yaptım", category: "Zihin",  theme: "theme-focus", description: "Biraz durup nefesime odaklandım.", defaultRate: 70 },
      { name: "Kitap okudum", category: "Zihin", theme: "theme-book", description: "Zihnimi besleyen bir okuma yaptım.", defaultRate: 50 }
    ]
  },
  {
    title: "Üretkenlik",
    description: "Günü daha verimli hissettiren adımlar",
    accent: "work",
    habits: [
      { name: "Ders çalıştım", category: "Üretkenlik", theme: "theme-study", description: "Odaklanıp hedefim için emek verdim.", defaultRate: 90 }
    ]
  }
];

const moodOptions = ["Mutlu", "Üzgün", "Kaygılı", "Öfkeli"];

const plannerDayLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const initialForm = {
  text: "",
  mood: "",
  water_liters: "",
  sleep_hours: "",
  stress_self: 5
};

function formatDateLabel(value) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(value);
}

function buildPlannerCards(history) {
  return plannerDayLabels.map((label, index) => {
    const item = history[index];
    if (!item) {
      return {
        key: `${label}-${index}`,
        label,
        dateLabel: "Plan yok",
        completed: 0,
        total: 0,
        percent: 0
      };
    }

    const completed = item.habits.filter((habit) => habit.status === "done").length;
    const total = item.habits.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      key: item.saved_at,
      label,
      dateLabel: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(item.saved_at)),
      completed,
      total,
      percent
    };
  });
}

export default function DailySection() {
  const [form, setForm] = useState(initialForm);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [profileHabits, setProfileHabits] = useState([]);
  const [customHabit, setCustomHabit] = useState("");
  const [entryMessage, setEntryMessage] = useState("");
  const [entryMessageType, setEntryMessageType] = useState("success");
  const [entries, setEntries] = useState([]);
  const [history, setHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      setProfileHabits(JSON.parse(localStorage.getItem(PROFILE_KEY) || "[]"));
      setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
    } catch {
      setProfileHabits([]);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, []);

  const allHabitGroups = useMemo(() => ([
    ...baseHabitGroups,
    {
      title: "Kişisel Kartların",
      description: "Profiline eklediğin alışkanlıklar burada görünür",
      accent: "personal",
      habits: profileHabits.map((habit) => ({
        ...habit,
        description: "Bu alışkanlık profilinde kayıtlı ve her gün tekrar seçilebilir.",
        defaultRate: 65
      }))
    }
  ]), [profileHabits]);

  const progress = useMemo(() => {
    const total = selectedHabits.length;
    const completed = selectedHabits.length;
    return {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
  }, [selectedHabits]);

  const weeklyCompletion = useMemo(() => {
    const recent = history.slice(0, 7);
    const totals = recent.reduce((accumulator, item) => {
      accumulator.completed += item.habits.filter((habit) => habit.status === "done").length;
      accumulator.total += item.habits.length;
      return accumulator;
    }, { completed: 0, total: 0 });

    return totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100);
  }, [history]);

  const plannerCards = useMemo(() => buildPlannerCards(history), [history]);

  const quickSummary = [
    { label: "Ruh Hali", value: form.mood || "Seçilmedi", tone: "primary" },
    { label: "Su Tüketimi", value: form.water_liters ? `${form.water_liters} L` : "-", tone: "info" },
    { label: "Uyku Süresi", value: form.sleep_hours ? `${form.sleep_hours} saat` : "-", tone: "accent" },
    { label: "Stres Seviyesi", value: `${form.stress_self} / 10`, tone: "danger" }
  ];

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleHabit(habit) {
    setSelectedHabits((current) => {
      const exists = current.some((item) => item.name === habit.name);
      if (exists) {
        return current.filter((item) => item.name !== habit.name);
      }

      return [...current, habit];
    });
  }

  function addCustomHabit() {
    const name = customHabit.trim();

    if (!name) {
      setEntryMessageType("error");
      setEntryMessage("Önce eklemek istediğin alışkanlığı yaz.");
      return;
    }

    const exists = profileHabits.some((habit) => habit.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      setEntryMessageType("error");
      setEntryMessage("Bu alışkanlık zaten profilinde kayıtlı.");
      return;
    }

    const nextHabits = [
      ...profileHabits,
      { name, category: "Kişisel", icon: "✨", theme: "theme-custom" }
    ];

    setProfileHabits(nextHabits);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextHabits));
    setCustomHabit("");
    setEntryMessageType("success");
    setEntryMessage(`"${name}" profiline eklendi.`);
  }

  async function submitEntry(event) {
    event.preventDefault();

    if (!form.mood) {
      setEntryMessageType("error");
      setEntryMessage("Devam etmeden önce bir duygu etiketi seç.");
      return;
    }

    if (selectedHabits.length === 0) {
      setEntryMessageType("error");
      setEntryMessage("En az bir alışkanlık seç veya kendi alışkanlığını ekle.");
      return;
    }

    const payload = {
      text: form.text.trim(),
      mood: form.mood,
      water_liters: Number(form.water_liters),
      sleep_hours: Number(form.sleep_hours),
      stress_self: Number(form.stress_self),
      habits: selectedHabits.map((habit) => ({
        name: habit.name,
        category: habit.category,
        status: "done",
        note: ""
      }))
    };

    setIsSaving(true);
    setEntryMessage("");

    try {
      const response = await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: payload.text,
          water_liters: payload.water_liters,
          sleep_hours: payload.sleep_hours,
          stress_self: payload.stress_self
        })
      });

      if (!response.ok) {
        let errorMessage = "Günlük kaydı gönderilemedi.";

        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Varsayılan mesaj kullanılır.
        }

        throw new Error(errorMessage);
      }

      saveLocalHistory(payload);
      await fetchEntries();
      resetFlow();
      setEntryMessageType("success");
      setEntryMessage("Günlük kaydın ve seçtiğin alışkanlıklar kaydedildi.");
    } catch (error) {
      setEntryMessageType("error");
      setEntryMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function fetchEntries() {
    try {
      const response = await fetch(`${API_URL}/entries`);
      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    }
  }

  function saveLocalHistory(payload) {
    setHistory((current) => {
      const nextHistory = [{ ...payload, saved_at: new Date().toISOString() }, ...current].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
  }

  function resetFlow(options = {}) {
    setForm(initialForm);
    setSelectedHabits([]);
    if (!options.keepMessage) {
      setEntryMessage("");
    }
  }

  return (
    <main className="daily-shell">
      <section className="daily-page is-visible">
        {renderEntryView()}
      </section>
    </main>
  );

  function renderEntryView() {
    return (
      <div className="dashboard-layout">
        <section className="hero-panel">
          <div>
            <span className="hero-badge">Günlük planlayıcı</span>
            <h1>Merhaba, bugün kendine iyi bakma günü.</h1>
            <p className="subtitle">Günün nasıl geçtiğini yaz, alışkanlıklarını seç ve kısa bir plan oluştur.</p>
          </div>
          <div className="hero-actions">
            <button type="button" className="icon-chip" aria-label="Bildirimler">🔔</button>
            <div className="avatar-chip">S</div>
          </div>
        </section>

        <section className="overview-grid">
          <article className="glass-card progress-card">
            <div className="card-head">
              <h2>Bu Haftaki İlerlemen</h2>
              <strong>%{weeklyCompletion}</strong>
            </div>
            <div className="progress-track large">
              <div className="progress-fill" style={{ width: `${weeklyCompletion}%` }} />
            </div>
            <div className="mini-days">
              {plannerCards.map((card) => (
                <div key={card.key} className="mini-day-box">
                  <span>{card.label}</span>
                  <div className={`mini-day-dot${card.percent > 0 ? " is-complete" : ""}`}>{card.percent > 0 ? "✓" : ""}</div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card quote-card">
            <div>
              <p className="quote-mark">“</p>
              <h2>Küçük adımlar büyük değişimler yaratır.</h2>
            </div>
            <div className="plant-illustration" aria-hidden="true">
              <span>🌿</span>
            </div>
          </article>
        </section>

        <section className="content-grid">
          <article className="glass-card habit-selection-card">
            <div className="card-head card-head-spread">
              <div>
                <h2>Alışkanlıklarını Seç</h2>
                <p>Bugün odaklanmak istediğin alışkanlıkları belirle.</p>
              </div>
              <button type="button" className="outline-action" onClick={addCustomHabit}>
                + Kendi Alışkanlığını Ekle
              </button>
            </div>

            <div className="journal-grid">
              <label className="field-block field-span-2 journal-spotlight">
                <div className="journal-spotlight-head">
                  <span className="journal-kicker">Bugünün Hikayesi</span>
                  <strong>Günlük Metin</strong>
                  <p>Bugün yaşadıklarını, seni yoran ya da iyi hissettiren şeyleri birkaç cümleyle yaz.</p>
                </div>
                <textarea
                  className="journal-textarea"
                  placeholder="Bugün neler oldu, nasıl hissediyorsun?"
                  required
                  value={form.text}
                  onChange={(event) => updateForm("text", event.target.value)}
                />
              </label>

              <div className="field-block">
                <span>Duygu Etiketi</span>
                <div className="mood-list compact">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      className={`mood-btn${form.mood === mood ? " active" : ""}`}
                      onClick={() => updateForm("mood", mood)}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-block">
                <span>Su, Uyku ve Stres</span>
                <div className="micro-fields">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Su (L)"
                    value={form.water_liters}
                    onChange={(event) => updateForm("water_liters", event.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Uyku"
                    value={form.sleep_hours}
                    onChange={(event) => updateForm("sleep_hours", event.target.value)}
                  />
                  <div className="range-wrap">
                    <label htmlFor="stress-range">Stres {form.stress_self}/10</label>
                    <input
                      id="stress-range"
                      type="range"
                      min="1"
                      max="10"
                      value={form.stress_self}
                      onChange={(event) => updateForm("stress_self", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {allHabitGroups.map((group) => (
              <div key={group.title} className="habit-group-block">
                <div className="group-head">
                  <div className={`group-icon ${group.accent}`}>●</div>
                  <div>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                </div>

                <div className="habit-grid">
                  {group.habits.length === 0 ? (
                    <div className="empty-inline">Henüz bu grupta kart yok.</div>
                  ) : (
                    group.habits.map((habit) => {
                      const isActive = selectedHabits.some((item) => item.name === habit.name);
                      return (
                        <button
                          key={habit.name}
                          type="button"
                          className={`habit-dashboard-card ${habit.theme}${isActive ? " active" : ""}`}
                          onClick={() => toggleHabit(habit)}
                        >
                          <div className="habit-dashboard-top">
                            <span className="habit-emoji">{habit.icon}</span>
                            <span className={`select-indicator${isActive ? " active" : ""}`}>{isActive ? "✓" : ""}</span>
                          </div>
                          <strong>{habit.name}</strong>
                          <p>{habit.description}</p>
                          <div className="habit-rate-row">
                            <div className="progress-track small">
                              <div className="progress-fill" style={{ width: `${habit.defaultRate || 50}%` }} />
                            </div>
                            <span>%{habit.defaultRate || 50}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}

            <div className="custom-habit-row">
              <input
                type="text"
                placeholder="Örnek: 20 dakika yürüdüm"
                value={customHabit}
                onChange={(event) => setCustomHabit(event.target.value)}
              />
              <button type="button" className="secondary-btn" onClick={addCustomHabit}>
                Profile ekle
              </button>
            </div>

            <div className="planner-cta-row">
              <div className="selection-strip">
                <span>Bugün seçilenler</span>
                <div className="selection-tags">
                  {selectedHabits.length === 0 ? (
                    <span className="selection-tag muted">Henüz seçim yok</span>
                  ) : (
                    selectedHabits.map((habit) => (
                      <span key={habit.name} className="selection-tag">{habit.name}</span>
                    ))
                  )}
                </div>
              </div>
              <button type="button" className="save-btn action-inline" onClick={submitEntry}>
                {isSaving ? "Kaydediliyor..." : "Günlüğü kaydet"}
              </button>
            </div>

            <p className={`message ${entryMessageType === "error" ? "is-error" : "is-success"}`}>{entryMessage}</p>
          </article>

          <aside className="dashboard-sidebar">
            <article className="glass-card sidebar-card">
              <h2>Bugünkü Planın</h2>
              <div className="ring-wrap">
                <div className="progress-ring">
                  <strong>{progress.completed}/{progress.total || selectedHabits.length || 0}</strong>
                </div>
                <p>Bu ekranda seçtiğin alışkanlıklar yapılmış olarak kaydedilir.</p>
              </div>
              <button type="button" className="primary-prompt" onClick={submitEntry}>
                {isSaving ? "Kaydediliyor..." : "Şimdi kaydet"}
              </button>
            </article>

            <article className="glass-card sidebar-card">
              <h2>Hızlı Özet</h2>
              <div className="summary-list">
                {quickSummary.map((item) => (
                  <div key={item.label} className="summary-row">
                    <span>{item.label}</span>
                    <strong className={`tone-${item.tone}`}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card sidebar-card reminder-card">
              <span>Unutma</span>
              <p>Bugün dünü geçmenin en iyi yolu, küçük bir adım atmaktır.</p>
            </article>
          </aside>
        </section>

        <section className="glass-card planner-section">
          <div className="card-head card-head-spread">
            <div>
              <h2>Günlük Planlayıcı</h2>
              <p>Her gününü planla, ilerlemeni gör.</p>
            </div>
            <div className="planner-badges">
              <span className="pill-badge">Takvimi gör</span>
              <span className="pill-badge active">{formatDateLabel(new Date())}</span>
            </div>
          </div>

          <div className="planner-board">
            {plannerCards.map((card, index) => (
              <article key={card.key} className={`planner-card${index === 0 ? " featured" : ""}`}>
                <div className="planner-card-head">
                  <strong>{index === 0 ? "Bugün" : card.label}</strong>
                  <span>{card.dateLabel}</span>
                </div>
                <div className="planner-card-body">
                  {index === 0 && selectedHabits.length > 0 ? (
                    selectedHabits.slice(0, 4).map((habit) => (
                      <div key={habit.name} className="planner-task-row">
                        <span className="task-checkbox active">✓</span>
                        <span>{habit.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="planner-stats">
                      <strong>%{card.percent}</strong>
                      <span>{card.total === 0 ? "Henüz kayıt yok" : `${card.completed}/${card.total} tamamlandı`}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card records-section">
          <div className="card-head">
            <h2>Son Kayıtların</h2>
          </div>
          <div className="records-grid">
            {history.length === 0 ? (
              <div className="empty-inline">Henüz kaydedilmiş günlük yok.</div>
            ) : (
              history.slice(0, 5).map((item) => {
                const completed = item.habits.filter((habit) => habit.status === "done").length;
                const total = item.habits.length;
                return (
                  <article key={item.saved_at} className="record-card">
                    <div>
                      <strong>{new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(new Date(item.saved_at))}</strong>
                      <span>{new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" }).format(new Date(item.saved_at))}</span>
                    </div>
                    <div className="record-score">
                      <strong>{completed}/{total || 0}</strong>
                      <span>{item.mood}</span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    );
  }
}
