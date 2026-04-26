const API_URL = "http://127.0.0.1:8000";
const page = document.body.dataset.page;
const DRAFT_KEY = "moodtrack-entry-draft";
const HISTORY_KEY = "moodtrack-habit-history";
const PROFILE_KEY = "moodtrack-profile-habits";

if (page === "entry") {
  setupEntryPage();
}

if (page === "habits") {
  setupHabitsPage();
}

function setupEntryPage() {
  const form = document.querySelector("#entryForm");
  const journalInput = document.querySelector("#journal");
  const stressInput = document.querySelector("#stress");
  const stressValue = document.querySelector("#stressValue");
  const waterInput = document.querySelector("#water");
  const sleepInput = document.querySelector("#sleep");
  const moodButtons = document.querySelectorAll(".mood-btn");
  const customHabitInput = document.querySelector("#customHabit");
  const addHabitBtn = document.querySelector("#addHabitBtn");
  const selectedHabitsList = document.querySelector("#selectedHabitsList");
  const selectedHabitCount = document.querySelector("#selectedHabitCount");
  const selectedHabitBadge = document.querySelector("#selectedHabitBadge");
  const profileHabitsList = document.querySelector("#profileHabitsList");
  const profileHabitCount = document.querySelector("#profileHabitCount");
  const profileBadge = document.querySelector("#profileBadge");
  const customHabitOptions = document.querySelector("#customHabitOptions");
  const message = document.querySelector("#message");

  let selectedMood = "";
  const selectedHabits = new Map();
  let profileHabits = readProfileHabits();

  renderCustomHabitCards(customHabitOptions, profileHabits);
  bindHabitCardSelection(selectedHabits, selectedHabitsList, selectedHabitCount, selectedHabitBadge);
  syncSelectedCardStates(selectedHabits);
  renderProfileHabits(profileHabitsList, profileHabits, profileHabitCount, profileBadge);

  moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      moodButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      selectedMood = button.dataset.mood;
    });
  });

  stressInput.addEventListener("input", () => {
    stressValue.textContent = stressInput.value;
  });

  addHabitBtn.addEventListener("click", () => {
    const customHabit = customHabitInput.value.trim();

    if (!customHabit) {
      showMessage(message, "Önce eklemek istediğin alışkanlığı yaz.", "error");
      return;
    }

    const existsInProfile = profileHabits.some((habit) => habit.name.toLowerCase() === customHabit.toLowerCase());

    if (existsInProfile) {
      showMessage(message, "Bu alışkanlık zaten profilinde kayıtlı.", "error");
      return;
    }

    const newHabit = {
      name: customHabit,
      category: "Kişisel",
      icon: "⭐",
      theme: "theme-custom"
    };

    profileHabits = [...profileHabits, newHabit];
    saveProfileHabits(profileHabits);
    customHabitInput.value = "";
    renderCustomHabitCards(customHabitOptions, profileHabits);
    bindHabitCardSelection(selectedHabits, selectedHabitsList, selectedHabitCount, selectedHabitBadge);
    syncSelectedCardStates(selectedHabits);
    renderProfileHabits(profileHabitsList, profileHabits, profileHabitCount, profileBadge);
    showMessage(message, `"${customHabit}" profiline eklendi.`, "success");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedMood) {
      showMessage(message, "Devam etmeden önce bir duygu etiketi seç.", "error");
      return;
    }

    if (selectedHabits.size === 0) {
      showMessage(message, "En az bir alışkanlık seç veya kendi alışkanlığını profilene ekle.", "error");
      return;
    }

    const draft = {
      text: journalInput.value.trim(),
      mood: selectedMood,
      water_liters: Number(waterInput.value),
      sleep_hours: Number(sleepInput.value),
      stress_self: Number(stressInput.value),
      habits: [...selectedHabits.entries()].map(([name, meta]) => ({
        name,
        category: meta.category,
        status: "",
        note: ""
      }))
    };

    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    window.location.href = "habits.html";
  });

  renderSelectedHabits(selectedHabitsList, selectedHabits);
  updateSelectionStats(selectedHabits, selectedHabitCount, selectedHabitBadge);
}

function setupHabitsPage() {
  const summary = document.querySelector("#dailySummary");
  const trackerList = document.querySelector("#habitTrackerList");
  const saveHabitsBtn = document.querySelector("#saveHabitsBtn");
  const habitMessage = document.querySelector("#habitMessage");
  const entriesList = document.querySelector("#entriesList");
  const habitHistoryList = document.querySelector("#habitHistoryList");
  const progressFill = document.querySelector("#progressFill");
  const progressText = document.querySelector("#progressText");

  const draft = readDraft();

  if (!draft) {
    summary.innerHTML = `
      <h2>Önce günlük girişini tamamla</h2>
      <p>Alışkanlık takibi için seçtiğin alışkanlıkları ilk sayfadan göndermen gerekiyor.</p>
    `;
    saveHabitsBtn.disabled = true;
    trackerList.innerHTML = "";
    getEntries(entriesList);
    renderHabitHistory(habitHistoryList);
    updateProgress([], progressFill, progressText);
    return;
  }

  renderSummary(summary, draft);
  renderHabitTrackers(trackerList, draft.habits, progressFill, progressText);
  getEntries(entriesList);
  renderHabitHistory(habitHistoryList);
  updateProgress(draft.habits, progressFill, progressText);

  saveHabitsBtn.addEventListener("click", async () => {
    const incompleteHabit = draft.habits.find((habit) => !habit.status);

    if (incompleteHabit) {
      showMessage(habitMessage, `Önce "${incompleteHabit.name}" için birini seç.`, "error");
      return;
    }

    try {
      await saveEntry(draft);
      saveLocalHistory(draft);
      sessionStorage.removeItem(DRAFT_KEY);
      showMessage(habitMessage, "Günlük ve alışkanlık notların kaydedildi.", "success");
      saveHabitsBtn.disabled = true;
      getEntries(entriesList);
      renderHabitHistory(habitHistoryList);
    } catch (error) {
      saveLocalHistory(draft);
      showMessage(
        habitMessage,
        `Backend kaydı alınamadı ama alışkanlıkların tarayıcıda saklandı: ${error.message}`,
        "error"
      );
      renderHabitHistory(habitHistoryList);
    }
  });
}

function bindHabitCardSelection(selectedHabits, selectedHabitsList, selectedHabitCount, selectedHabitBadge) {
  const allCards = document.querySelectorAll(".habit-card");

  allCards.forEach((card) => {
    card.onclick = () => {
      const habitName = card.dataset.habit;
      const category = card.dataset.category || "Kişisel";

      if (selectedHabits.has(habitName)) {
        selectedHabits.delete(habitName);
        card.classList.remove("active");
      } else {
        selectedHabits.set(habitName, { category });
        card.classList.add("active");
      }

      renderSelectedHabits(selectedHabitsList, selectedHabits);
      updateSelectionStats(selectedHabits, selectedHabitCount, selectedHabitBadge);
      syncSelectedCardStates(selectedHabits);
    };
  });
}

function syncSelectedCardStates(selectedHabits) {
  document.querySelectorAll(".habit-card").forEach((card) => {
    const habitName = card.dataset.habit;
    card.classList.toggle("active", selectedHabits.has(habitName));
  });
}

function renderCustomHabitCards(container, habits) {
  container.innerHTML = "";

  if (habits.length === 0) {
    container.innerHTML = "<div class='empty-custom-habits'>Henüz profiline özel kart yok.</div>";
    return;
  }

  habits.forEach((habit) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `habit-card ${habit.theme || "theme-custom"}`;
    button.dataset.habit = habit.name;
    button.dataset.category = habit.category;
    button.innerHTML = `
      <span class="habit-icon">${escapeHtml(habit.icon || "⭐")}</span>
      <span class="habit-title">${escapeHtml(habit.name)}</span>
      <span class="habit-desc">Bu alışkanlık profilinde kayıtlı ve her gün tekrar seçilebilir.</span>
      <span class="habit-check">✓</span>
    `;
    container.appendChild(button);
  });
}

function renderProfileHabits(listElement, habits, countElement, badgeElement) {
  listElement.innerHTML = "";
  countElement.textContent = String(habits.length);
  badgeElement.textContent = `${habits.length} kayıt`;

  if (habits.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "Henüz profiline özel alışkanlık eklenmedi.";
    listElement.appendChild(emptyItem);
    return;
  }

  habits.forEach((habit) => {
    const item = document.createElement("li");
    item.className = "selected-item";
    item.innerHTML = `
      <span>${escapeHtml(habit.name)}</span>
      <span class="selected-item-tag">${escapeHtml(habit.category)}</span>
    `;
    listElement.appendChild(item);
  });
}

function renderSelectedHabits(listElement, habitsMap) {
  listElement.innerHTML = "";

  if (habitsMap.size === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "Henüz alışkanlık seçilmedi.";
    listElement.appendChild(emptyItem);
    return;
  }

  habitsMap.forEach((meta, habit) => {
    const item = document.createElement("li");
    item.className = "selected-item";
    item.innerHTML = `
      <span>${escapeHtml(habit)}</span>
      <span class="selected-item-tag">${escapeHtml(meta.category)}</span>
    `;
    listElement.appendChild(item);
  });
}

function updateSelectionStats(habitsMap, countElement, badgeElement) {
  const count = habitsMap.size;
  countElement.textContent = String(count);
  badgeElement.textContent = `${count} seçim`;
}

function renderSummary(container, draft) {
  container.innerHTML = `
    <h2>Bugünkü Özet</h2>
    <p>${escapeHtml(draft.text)}</p>
    <div class="summary-grid">
      <div class="summary-chip">
        <strong>Duygu</strong>
        <span>${escapeHtml(draft.mood)}</span>
      </div>
      <div class="summary-chip">
        <strong>Stres</strong>
        <span>${draft.stress_self}/10</span>
      </div>
      <div class="summary-chip">
        <strong>Su</strong>
        <span>${draft.water_liters} litre</span>
      </div>
      <div class="summary-chip">
        <strong>Uyku</strong>
        <span>${draft.sleep_hours} saat</span>
      </div>
      <div class="summary-chip">
        <strong>Alışkanlık sayısı</strong>
        <span>${draft.habits.length}</span>
      </div>
    </div>
  `;
}

function renderHabitTrackers(container, habits, progressFill, progressText) {
  container.innerHTML = "";

  habits.forEach((habit, index) => {
    const card = document.createElement("article");
    card.className = "tracker-card";
    card.innerHTML = `
      <div class="tracker-top">
        <div>
          <h3>${escapeHtml(habit.name)}</h3>
          <p>Bugün bu alışkanlık için tik veya çarpı seç.</p>
        </div>
        <span class="tracker-meta">${escapeHtml(habit.category || "Günlük hedef")}</span>
      </div>
      <div class="status-group">
        <button type="button" class="status-btn done" data-index="${index}" data-status="✓" aria-label="Yapıldı">✓</button>
        <button type="button" class="status-btn not-done" data-index="${index}" data-status="✕" aria-label="Yapılmadı">✕</button>
      </div>
      <label for="note-${index}">Küçük not</label>
      <textarea id="note-${index}" data-index="${index}" placeholder="Kendine kısa bir not bırakabilirsin...">${escapeHtml(habit.note)}</textarea>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll(".status-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const habitIndex = Number(button.dataset.index);
      const status = button.dataset.status;
      habits[habitIndex].status = status;

      const card = button.closest(".tracker-card");
      const buttons = card.querySelectorAll(".status-btn");
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      card.classList.remove("done-selected", "not-done-selected");
      card.classList.add(status === "✓" ? "done-selected" : "not-done-selected");

      updateProgress(habits, progressFill, progressText);
    });
  });

  container.querySelectorAll("textarea[data-index]").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      const habitIndex = Number(textarea.dataset.index);
      habits[habitIndex].note = textarea.value.trim();
    });
  });
}

function updateProgress(habits, fillElement, textElement) {
  const total = habits.length;
  const completed = habits.filter((habit) => habit.status).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  fillElement.style.width = `${percent}%`;

  if (total === 0) {
    textElement.textContent = "Henüz seçim yapılmadı.";
    return;
  }

  textElement.textContent = `${total} alışkanlıktan ${completed} tanesinde seçim yapıldı.`;
}

async function saveEntry(draft) {
  const entryData = {
    text: draft.text,
    water_liters: draft.water_liters,
    sleep_hours: draft.sleep_hours,
    stress_self: draft.stress_self
  };

  const response = await fetch(`${API_URL}/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(entryData)
  });

  if (!response.ok) {
    throw new Error("günlük kaydı gönderilemedi");
  }
}

async function getEntries(entriesList) {
  if (!entriesList) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/entries`);

    if (!response.ok) {
      throw new Error("Kayıtlar alınamadı.");
    }

    const entries = await response.json();
    entriesList.innerHTML = "";

    if (entries.length === 0) {
      entriesList.innerHTML = "<p class='empty-state'>Henüz kayıt yok.</p>";
      return;
    }

    entries.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "entry-card";
      card.innerHTML = `
        <h3>${escapeHtml(entry.text)}</h3>
        <p><strong>Su:</strong> ${entry.water_liters} L</p>
        <p><strong>Uyku:</strong> ${entry.sleep_hours} saat</p>
        <p><strong>Stres:</strong> ${entry.stress_self}/10</p>
      `;
      entriesList.appendChild(card);
    });
  } catch (error) {
    entriesList.innerHTML = "<p class='empty-state'>Kayıtlar yüklenemedi.</p>";
  }
}

function saveLocalHistory(draft) {
  const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  const nextEntry = {
    ...draft,
    saved_at: new Date().toISOString()
  };

  localStorage.setItem(HISTORY_KEY, JSON.stringify([nextEntry, ...existing].slice(0, 10)));
}

function renderHabitHistory(container) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = "<p class='empty-state'>Henüz kaydedilmiş alışkanlık notu yok.</p>";
    return;
  }

  history.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "entry-card";

    const habitItems = entry.habits
      .map((habit) => `<li><strong>${escapeHtml(habit.name)}:</strong> ${escapeHtml(habit.status)}${habit.note ? ` - ${escapeHtml(habit.note)}` : ""}</li>`)
      .join("");

    card.innerHTML = `
      <h3>${escapeHtml(entry.mood)} hissiyle kaydedildi</h3>
      <p>${escapeHtml(entry.text)}</p>
      <ul>${habitItems}</ul>
    `;

    container.appendChild(card);
  });
}

function readDraft() {
  const rawDraft = sessionStorage.getItem(DRAFT_KEY);

  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft);
  } catch (error) {
    sessionStorage.removeItem(DRAFT_KEY);
    return null;
  }
}

function readProfileHabits() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function saveProfileHabits(habits) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(habits));
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.style.color = type === "success" ? "#15803d" : "#dc2626";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
