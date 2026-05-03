import { useEffect, useState } from "react";
import "./DailySection.css";

const API_URL = "http://127.0.0.1:8000";
const HISTORY_KEY = "moodtrack-habit-history";
const PROFILE_KEY = "moodtrack-profile-habits";

const baseHabitGroups = [
  {
    title: "Saglik",
    description: "Bedene iyi gelen gunluk hedefler",
    habits: [
      { name: "Su ictim", category: "Saglik", icon: "Su", theme: "theme-water", description: "Gun icinde su hedefimi tamamladim." },
      { name: "Spor yaptim", category: "Saglik", icon: "Spor", theme: "theme-move", description: "Hareket ederek enerjimi yukselttim." },
      { name: "Erken uyudum", category: "Saglik", icon: "Uyku", theme: "theme-sleep", description: "Dinlenmek icin uyku duzenimi korudum." }
    ]
  },
  {
    title: "Zihin",
    description: "Ruh halini sakinlestiren kucuk pratikler",
    habits: [
      { name: "Meditasyon yaptim", category: "Zihin", icon: "Nefes", theme: "theme-focus", description: "Biraz durup nefesime odaklandim." },
      { name: "Kitap okudum", category: "Zihin", icon: "Kitap", theme: "theme-book", description: "Zihnimi besleyen bir okuma yaptim." }
    ]
  },
  {
    title: "Uretkenlik",
    description: "Gunu daha verimli hissettiren adimlar",
    habits: [
      { name: "Ders calistim", category: "Uretkenlik", icon: "Not", theme: "theme-study", description: "Odaklanip hedefim icin emek verdim." }
    ]
  }
];

const moodOptions = ["Mutlu", "Uzgun", "Kaygili", "Ofkeli"];

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
      title: "Kisisel Kartlarin",
      description: "Profiline ekledigin aliskanliklar burada gorunur",
      habits: profileHabits.map((habit) => ({
        ...habit,
        description: "Bu aliskanlik profilinde kayitli ve her gun tekrar secilebilir."
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
      setEntryMessage("Once eklemek istedigin aliskanligi yaz.");
      return;
    }

    const exists = profileHabits.some((habit) => habit.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      setEntryMessageType("error");
      setEntryMessage("Bu aliskanlik zaten profilinde kayitli.");
      return;
    }

    const nextHabits = [
      ...profileHabits,
      { name, category: "Kisisel", icon: "Yildiz", theme: "theme-custom" }
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
      setEntryMessage("Devam etmeden once bir duygu etiketi sec.");
      return;
    }

    if (selectedHabits.length === 0) {
      setEntryMessageType("error");
      setEntryMessage("En az bir aliskanlik sec veya kendi aliskanligini ekle.");
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
      setHabitMessage(`Once "${missingHabit.name}" icin secim yap.`);
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
        throw new Error("Gunluk kaydi gonderilemedi.");
      }

      saveLocalHistory(payload);
      await fetchEntries();
      resetFlow();
      setEntryMessageType("success");
      setEntryMessage("Gunluk ve aliskanlik notlarin kaydedildi.");
    } catch (error) {
      saveLocalHistory(payload);
      setHabitMessageType("error");
      setHabitMessage(`Backend kaydi alinamadi ama aliskanliklar tarayicida saklandi: ${error.message}`);
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
          <span className="hero-badge">Gunluk planlayici</span>
          <h1>Gunun nasil gectigini ve aliskanlik hedeflerini birlikte duzenleyelim.</h1>
          <p className="subtitle">
            Bu alan artik kisiye ozel calisiyor. Ekledigin aliskanliklar profilinde kalir, istediginde tekrar secip gunluk takibini yapabilirsin.
          </p>
        </div>

        <form className="stack-lg" onSubmit={submitEntry}>
          <div>
            <label htmlFor="journal">Gunluk Metin</label>
            <textarea
              id="journal"
              placeholder="Bugun neler oldu, nasil hissediyorsun?"
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
            <label htmlFor="stress">Duygu / Stres Yogunlugu: <span>{form.stress_self}</span></label>
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
              <label htmlFor="water">Su Miktari / Litre</label>
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
                <h2>Aliskanliklarini Sec</h2>
                <p>Hazir kartlardan sec, kendi kartini ekle ve profilinde sakla.</p>
              </div>

              <div className="habit-stats">
                <div className="habit-stat-card">
                  <strong>{selectedHabits.length}</strong>
                  <span>Bugun secilen</span>
                </div>
                <div className="habit-stat-card">
                  <strong>{profileHabits.length}</strong>
                  <span>Profilde kayitli</span>
                </div>
              </div>
            </div>

            <section className="profile-panel">
              <div className="selected-header">
                <h3>Kisisel Profil Aliskanliklarin</h3>
                <span className="selected-badge">{profileHabits.length} kayit</span>
              </div>
              <p className="profile-copy">Buraya ekledigin aliskanliklar sonraki girislerinde de burada kalir.</p>
              <ul className="selected-list">
                {profileHabits.length === 0 ? (
                  <li className="empty-state">Henuz profiline ozel aliskanlik eklenmedi.</li>
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
                    <div className="empty-custom-habits">Henuz profiline ozel kart yok.</div>
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
                          <span className="habit-check">Secildi</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}

            <div className="custom-habit-panel">
              <div className="custom-habit-copy">
                <h3>Kendi aliskanligini olustur</h3>
              </div>
              <div className="custom-habit-row">
                <input
                  type="text"
                  placeholder="Ornek: 20 dakika yurudum"
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
                <h3>Bugun Secilen Aliskanliklar</h3>
                <span className="selected-badge">{selectedHabits.length} secim</span>
              </div>
              <ul className="selected-list">
                {selectedHabits.length === 0 ? (
                  <li className="empty-state">Henuz aliskanlik secilmedi.</li>
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

          <button type="submit" className="save-btn">Aliskanlik sayfasina gec</button>
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
          <span className="hero-badge">Aliskanlik takibi</span>
          <h1>Sectigin aliskanliklari simdi tek tek isaretleyebilirsin.</h1>
        </div>

        <section className="summary-card">
          <h2>Bugunku Ozet</h2>
          <p>{form.text}</p>
          <div className="summary-grid">
            <div className="summary-chip"><strong>Duygu</strong><span>{form.mood}</span></div>
            <div className="summary-chip"><strong>Stres</strong><span>{form.stress_self}/10</span></div>
            <div className="summary-chip"><strong>Su</strong><span>{form.water_liters} litre</span></div>
            <div className="summary-chip"><strong>Uyku</strong><span>{form.sleep_hours} saat</span></div>
            <div className="summary-chip"><strong>Aliskanlik sayisi</strong><span>{selectedHabits.length}</span></div>
          </div>
        </section>

        <section className="progress-panel">
          <div className="progress-copy">
            <h2>Bugunku ilerlemen</h2>
            <p>
              {progress.total === 0
                ? "Henuz secim yapilmadi."
                : `${progress.total} aliskanliktan ${progress.completed} tanesinde secim yapildi.`}
            </p>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
        </section>

        <section className="stack-lg">
          <div className="section-heading">
            <h2>Bugunku Aliskanliklarin</h2>
            <p>Tum kartlarda tik veya carpi secildiginde kaydetme akisi tamamlanir.</p>
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
                      <p>Bugun bu aliskanlik icin tik veya carpi sec.</p>
                    </div>
                    <span className="tracker-meta">{habit.category}</span>
                  </div>

                  <div className="status-group">
                    <button
                      type="button"
                      className={`status-btn done${state.status === "done" ? " active" : ""}`}
                      onClick={() => updateHabitStatus(habit.name, "status", "done")}
                    >
                      Yapildi
                    </button>
                    <button
                      type="button"
                      className={`status-btn not-done${state.status === "not-done" ? " active" : ""}`}
                      onClick={() => updateHabitStatus(habit.name, "status", "not-done")}
                    >
                      Yapilmadi
                    </button>
                  </div>

                  <div>
                    <label htmlFor={`note-${index}`}>Kucuk not</label>
                    <textarea
                      id={`note-${index}`}
                      placeholder="Kendine kisa bir not birakabilirsin..."
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
              Geri don
            </button>
            <button type="button" className="save-btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Kaydediliyor..." : "Gunlugu kaydet"}
            </button>
          </div>
        </section>

        <p className="message" style={{ color: habitMessageType === "success" ? "#15803d" : "#dc2626" }}>
          {habitMessage}
        </p>

        <section className="entries-section">
          <div className="section-heading">
            <h2>Son Kayitlar</h2>
            <p>Kaydedilen gunluk bilgileri burada gorunsun.</p>
          </div>
          <div className="entries-grid">
            {entries.length === 0 ? (
              <p className="empty-state">Henuz kayit yok veya backend erisilemiyor.</p>
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
            <h2>Kaydedilen Aliskanlik Notlari</h2>
          </div>
          <div className="entries-grid">
            {history.length === 0 ? (
              <p className="empty-state">Henuz kaydedilmis aliskanlik notu yok.</p>
            ) : (
              history.map((item) => (
                <article key={item.saved_at} className="entry-card">
                  <h3>{item.mood} hissiyle kaydedildi</h3>
                  <p>{item.text}</p>
                  <ul>
                    {item.habits.map((habit) => (
                      <li key={`${item.saved_at}-${habit.name}`}>
                        <strong>{habit.name}:</strong> {habit.status === "done" ? "Yapildi" : "Yapilmadi"}
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
