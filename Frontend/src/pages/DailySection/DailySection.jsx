import React, { useEffect, useState } from "react";
import "./DailySection.css";

const API_URL = "http://127.0.0.1:8000";
const HISTORY_KEY = "moodtrack-habit-history";
const PROFILE_KEY = "moodtrack-profile-habits";

const baseHabitGroups = [
  {
    title: "Sağlık",
    description: "Bedene iyi gelen günlük hedefler",
    habits: [
      { name: "Su içtim", category: "Sağlık", icon: "Su", theme: "theme-water", description: "Gün içinde su hedefimi tamamladım." },
      { name: "Spor yaptım", category: "Sağlık", icon: "Spor", theme: "theme-move", description: "Hareket ederek enerjimi yükselttim." },
      { name: "Erken uyudum", category: "Sağlık", icon: "Uyku", theme: "theme-sleep", description: "Dinlenmek için uyku düzenimi korudum." }
    ]
  },
  {
    title: "Zihin",
    description: "Ruh halini sakinleştiren küçük pratikler",
    habits: [
      { name: "Meditasyon yaptım", category: "Zihin", icon: "Nefes", theme: "theme-focus", description: "Biraz durup nefesime odaklandım." },
      { name: "Kitap okudum", category: "Zihin", icon: "Kitap", theme: "theme-book", description: "Zihnimi besleyen bir okuma yaptım." }
    ]
  },
  {
    title: "Üretkenlik",
    description: "Günü daha verimli hissettiren adımlar",
    habits: [
      { name: "Ders çalıştım", category: "Üretkenlik", icon: "Not", theme: "theme-study", description: "Odaklanıp hedefim için emek verdim." }
    ]
  }
];

const moodOptions = ["Mutlu", "Üzgün", "Kaygılı", "Öfkeli"];

const initialForm = {
  text: "",
  mood: "",
  water_liters: "",
  sleep_hours: "",
  stress_self: 5
};

export default function DailySection() {
  const [step, setStep] = useState("entry");
  const [form, setForm] = useState(initialForm);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [profileHabits, setProfileHabits] = useState([]);
  const [customHabit, setCustomHabit] = useState("");
  const [habitStatuses, setHabitStatuses] = useState({});
  const [entryMessage, setEntryMessage] = useState("");
  const [entryMessageType, setEntryMessageType] = useState("success");
  const [habitMessage, setHabitMessage] = useState("");
  const [habitMessageType, setHabitMessageType] = useState("success");
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

  const allHabitGroups = [
    ...baseHabitGroups,
    {
      title: "Kişisel Kartların",
      description: "Profiline eklediğin alışkanlıklar burada görünür",
      habits: profileHabits.map((habit) => ({
        ...habit,
        description: "Bu alışkanlık profilinde kayıtlı ve her gün tekrar seçilebilir."
      }))
    }
  ];

  const progress = {
    total: selectedHabits.length,
    completed: selectedHabits.filter((habit) => habitStatuses[habit.name]?.status).length,
    percent: 0
  };
  progress.percent = progress.total === 0 ? 0 : Math.round((progress.completed / progress.total) * 100);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleHabit(habit) {
    setSelectedHabits((current) => {
      const exists = current.some((item) => item.name === habit.name);
      if (exists) {
        const next = current.filter((item) => item.name !== habit.name);
        setHabitStatuses((prev) => {
          const clone = { ...prev };
          delete clone[habit.name];
          return clone;
        });
        return next;
      }

      return [...current, { name: habit.name, category: habit.category }];
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
      { name, category: "Kişisel", icon: "Yıldız", theme: "theme-custom" }
    ];

    setProfileHabits(nextHabits);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextHabits));
    setCustomHabit("");
    setEntryMessageType("success");
    setEntryMessage(`"${name}" profiline eklendi.`);
  }

  function submitEntry(event) {
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

    setEntryMessage("");
    setHabitMessage("");
    setStep("habits");
  }

  function updateHabitStatus(name, field, value) {
    setHabitStatuses((current) => ({
      ...current,
      [name]: {
        status: current[name]?.status || "",
        note: current[name]?.note || "",
        [field]: value
      }
    }));
  }

  async function handleSave() {
    const missingHabit = selectedHabits.find((habit) => !habitStatuses[habit.name]?.status);
    if (missingHabit) {
      setHabitMessageType("error");
      setHabitMessage(`Önce "${missingHabit.name}" için seçim yap.`);
      return;
    }

    const payload = {
      text: form.text.trim(),
      mood: form.mood,
      water_liters: Number(form.water_liters),
      sleep_hours: Number(form.sleep_hours),
      stress_self: Number(form.stress_self),
      habits: selectedHabits.map((habit) => ({
        ...habit,
        status: habitStatuses[habit.name]?.status || "",
        note: habitStatuses[habit.name]?.note || ""
      }))
    };

    setIsSaving(true);

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
      setEntryMessage("Günlük ve alışkanlık notların kaydedildi.");
    } catch (error) {
      setHabitMessageType("error");
      setHabitMessage(error.message);
      resetFlow({ keepStep: true, preserveMessage: true });
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
    setHabitStatuses({});
    if (!options.preserveMessage) {
      setHabitMessage("");
    }
    if (!options.keepStep) {
      setStep("entry");
      setEntryMessage("");
    }
  }

  return (
    <main className="page-shell">
      <section className="card card-wide">
        {step === "entry" ? renderEntryView() : renderHabitsView()}
      </section>
    </main>
  );

  function renderEntryView() {
    return (
      <>
        <div className="hero">
          <span className="hero-badge">Günlük planlayıcı</span>
          <h1>Günün nasıl geçtiğini ve alışkanlık hedeflerini birlikte düzenleyelim.</h1>
          <p className="subtitle">
            Bu alan artık kişiye özel çalışıyor. Eklediğin alışkanlıklar profilinde kalır, istediğinde tekrar seçip günlük takibini yapabilirsin.
          </p>
        </div>

        <form className="stack-lg" onSubmit={submitEntry}>
          <div>
            <label htmlFor="journal">Günlük Metin</label>
            <textarea
              id="journal"
              placeholder="Bugün neler oldu, nasıl hissediyorsun?"
              required
              value={form.text}
              onChange={(event) => updateForm("text", event.target.value)}
            />
          </div>

          <div>
            <label>Duygu Etiketi</label>
            <div className="mood-list">
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

          <div>
            <label htmlFor="stress">Duygu / Stres Yoğunluğu: <span>{form.stress_self}</span></label>
            <input
              id="stress"
              type="range"
              min="1"
              max="10"
              value={form.stress_self}
              onChange={(event) => updateForm("stress_self", event.target.value)}
            />
          </div>

          <div className="input-group">
            <div>
              <label htmlFor="water">Su Miktarı / Litre</label>
              <input
                id="water"
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="2.5"
                required
                value={form.water_liters}
                onChange={(event) => updateForm("water_liters", event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="sleep">Uyku Saati</label>
              <input
                id="sleep"
                type="number"
                min="0"
                step="0.5"
                placeholder="7"
                required
                value={form.sleep_hours}
                onChange={(event) => updateForm("sleep_hours", event.target.value)}
              />
            </div>
          </div>

          <section className="habit-builder">
            <div className="habit-builder-top">
              <div className="section-heading">
                <h2>Alışkanlıklarını Seç</h2>
                <p>Hazır kartlardan seç, kendi kartını ekle ve profilinde sakla.</p>
              </div>

              <div className="habit-stats">
                <div className="habit-stat-card">
                  <strong>{selectedHabits.length}</strong>
                  <span>Bugün seçilen</span>
                </div>
                <div className="habit-stat-card">
                  <strong>{profileHabits.length}</strong>
                  <span>Profilde kayıtlı</span>
                </div>
              </div>
            </div>

            <section className="profile-panel">
              <div className="selected-header">
                <h3>Kişisel Profil Alışkanlıkların</h3>
                <span className="selected-badge">{profileHabits.length} kayıt</span>
              </div>
              <p className="profile-copy">Buraya eklediğin alışkanlıklar sonraki girişlerinde de burada kalır.</p>
              <ul className="selected-list">
                {profileHabits.length === 0 ? (
                  <li className="empty-state">Henüz profiline özel alışkanlık eklenmedi.</li>
                ) : (
                  profileHabits.map((habit) => (
                    <li key={habit.name} className="selected-item">
                      <span>{habit.name}</span>
                      <span className="selected-item-tag">{habit.category}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            {allHabitGroups.map((group) => (
              <div key={group.title} className="habit-category">
                <div className="habit-category-header">
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
                <div className="habit-options">
                  {group.habits.length === 0 ? (
                    <div className="empty-custom-habits">Henüz profiline özel kart yok.</div>
                  ) : (
                    group.habits.map((habit) => {
                      const isActive = selectedHabits.some((item) => item.name === habit.name);
                      return (
                        <button
                          key={habit.name}
                          type="button"
                          className={`habit-card ${habit.theme}${isActive ? " active" : ""}`}
                          onClick={() => toggleHabit(habit)}
                        >
                          <span className="habit-icon">{habit.icon}</span>
                          <span className="habit-title">{habit.name}</span>
                          <span className="habit-desc">{habit.description}</span>
                          <span className="habit-check">Seçildi</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}

            <div className="custom-habit-panel">
              <div className="custom-habit-copy">
                <h3>Kendi alışkanlığını oluştur</h3>
              </div>
              <div className="custom-habit-row">
                <input
                  type="text"
                  placeholder="Örnek: 20 dakika yürüdüm"
                  value={customHabit}
                  onChange={(event) => setCustomHabit(event.target.value)}
                />
                <button type="button" id="addHabitBtn" className="secondary-btn" onClick={addCustomHabit}>
                  Profile ekle
                </button>
              </div>
            </div>

            <div className="selected-habits-box">
              <div className="selected-header">
                <h3>Bugün Seçilen Alışkanlıklar</h3>
                <span className="selected-badge">{selectedHabits.length} seçim</span>
              </div>
              <ul className="selected-list">
                {selectedHabits.length === 0 ? (
                  <li className="empty-state">Henüz alışkanlık seçilmedi.</li>
                ) : (
                  selectedHabits.map((habit) => (
                    <li key={habit.name} className="selected-item">
                      <span>{habit.name}</span>
                      <span className="selected-item-tag">{habit.category}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          <button type="submit" className="save-btn">Alışkanlık sayfasına geç</button>
        </form>

        <p className="message" style={{ color: entryMessageType === "success" ? "#15803d" : "#dc2626" }}>
          {entryMessage}
        </p>
      </>
    );
  }

  function renderHabitsView() {
    return (
      <>
        <div className="hero">
          <span className="hero-badge">Alışkanlık takibi</span>
          <h1>Seçtiğin alışkanlıkları şimdi tek tek işaretleyebilirsin.</h1>
        </div>

        <section className="summary-card">
          <h2>Bugünkü Özet</h2>
          <p>{form.text}</p>
          <div className="summary-grid">
            <div className="summary-chip"><strong>Duygu</strong><span>{form.mood}</span></div>
            <div className="summary-chip"><strong>Stres</strong><span>{form.stress_self}/10</span></div>
            <div className="summary-chip"><strong>Su</strong><span>{form.water_liters} litre</span></div>
            <div className="summary-chip"><strong>Uyku</strong><span>{form.sleep_hours} saat</span></div>
            <div className="summary-chip"><strong>Alışkanlık sayısı</strong><span>{selectedHabits.length}</span></div>
          </div>
        </section>

        <section className="progress-panel">
          <div className="progress-copy">
            <h2>Bugünkü ilerlemen</h2>
            <p>
              {progress.total === 0
                ? "Henüz seçim yapılmadı."
                : `${progress.total} alışkanlıktan ${progress.completed} tanesinde seçim yapıldı.`}
            </p>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
        </section>

        <section className="stack-lg">
          <div className="section-heading">
            <h2>Bugünkü Alışkanlıkların</h2>
            <p>Tüm kartlarda tik veya çarpı seçildiğinde kaydetme akışı tamamlanır.</p>
          </div>

          <div className="habit-tracker-list">
            {selectedHabits.map((habit, index) => {
              const state = habitStatuses[habit.name] || { status: "", note: "" };
              const selectedClass =
                state.status === "done" ? " done-selected" : state.status === "not-done" ? " not-done-selected" : "";

              return (
                <article key={habit.name} className={`tracker-card${selectedClass}`}>
                  <div className="tracker-top">
                    <div>
                      <h3>{habit.name}</h3>
                      <p>Bugün bu alışkanlık için tik veya çarpı seç.</p>
                    </div>
                    <span className="tracker-meta">{habit.category}</span>
                  </div>

                  <div className="status-group">
                    <button
                      type="button"
                      className={`status-btn done${state.status === "done" ? " active" : ""}`}
                      onClick={() => updateHabitStatus(habit.name, "status", "done")}
                      aria-label="Yapıldı"
                      title="Yapıldı"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      className={`status-btn not-done${state.status === "not-done" ? " active" : ""}`}
                      onClick={() => updateHabitStatus(habit.name, "status", "not-done")}
                      aria-label="Yapılmadı"
                      title="Yapılmadı"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label htmlFor={`note-${index}`}>Küçük not</label>
                    <textarea
                      id={`note-${index}`}
                      placeholder="Kendine kısa bir not bırakabilirsin..."
                      value={state.note}
                      onChange={(event) => updateHabitStatus(habit.name, "note", event.target.value)}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="page-actions">
            <button type="button" className="secondary-btn" onClick={() => setStep("entry")}>
              Geri dön
            </button>
            <button type="button" className="save-btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Günlüğü kaydet"}
            </button>
          </div>
        </section>

        <p className="message" style={{ color: habitMessageType === "success" ? "#15803d" : "#dc2626" }}>
          {habitMessage}
        </p>

        <section className="entries-section">
          <div className="section-heading">
            <h2>Son Kayıtlar</h2>
            <p>Kaydedilen günlük bilgileri burada görünsün.</p>
          </div>
          <div className="entries-grid">
            {entries.length === 0 ? (
              <p className="empty-state">Henüz kayıt yok veya backend erişilemiyor.</p>
            ) : (
              entries.map((entry, index) => (
                <article key={`${entry.text}-${index}`} className="entry-card">
                  <h3>{entry.text}</h3>
                  <p><strong>Su:</strong> {entry.water_liters} L</p>
                  <p><strong>Uyku:</strong> {entry.sleep_hours} saat</p>
                  <p><strong>Stres:</strong> {entry.stress_self}/10</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="entries-section">
          <div className="section-heading">
            <h2>Kaydedilen Alışkanlık Notları</h2>
          </div>
          <div className="entries-grid">
            {history.length === 0 ? (
              <p className="empty-state">Henüz kaydedilmiş alışkanlık notu yok.</p>
            ) : (
              history.map((item) => (
                <article key={item.saved_at} className="entry-card">
                  <h3>{item.mood} hissiyle kaydedildi</h3>
                  <p>{item.text}</p>
                  <ul>
                    {item.habits.map((habit) => (
                      <li key={`${item.saved_at}-${habit.name}`}>
                        <strong>{habit.name}:</strong> {habit.status === "done" ? "Yapıldı" : "Yapılmadı"}
                        {habit.note ? ` - ${habit.note}` : ""}
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>
        </section>
      </>
    );
  }
}
