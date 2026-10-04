import { app } from "./firebase-config.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const database = getDatabase(app);
const PENALTY_SECONDS = 5;

const $ = (id) => document.getElementById(id);
const currentEl = $("current");
const nextEl = $("next");
const tbody = $("leaderboardBody");
const searchInput = $("teamSearch");
const searchClear = $("searchClear");
const searchCount = $("searchCount");

let rankedRuns = []; // full sorted leaderboard (with global rank)
let loaded = false;
let loadError = false;
let currentTeam = "";

// ---------- helpers ----------
const normalize = (s) => String(s).trim().toLowerCase();

function timeToSeconds(str) {
  const m = /^(\d+):([0-5]\d)$/.exec(String(str));
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.NaN;
}

function secondsToTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function messageRow(text) {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = 5;
  td.className = "empty";
  td.textContent = text;
  tr.appendChild(td);
  return tr;
}

// ---------- live track ----------
onValue(
  ref(database, "active_track/"),
  (snap) => {
    const data = snap.val();
    if (!data) return;
    currentTeam = data.currentTeam || "";
    currentEl.textContent = data.currentTeam || "N/A";
    nextEl.textContent = data.nextTeam || "---";
    render();
  },
  (err) => console.error("Unable to load live track data:", err),
);

// ---------- leaderboard ----------
onValue(
  ref(database, "completed_runs/"),
  (snap) => {
    const data = snap.val() || {};
    const runs = Object.values(data).flatMap((run) => {
      if (!run || typeof run !== "object" || typeof run.team !== "string") return [];
      const raw = timeToSeconds(run.time);
      if (!Number.isFinite(raw)) return [];
      const penalties = Number.isInteger(run.penalties) && run.penalties >= 0 ? run.penalties : 0;
      const final = raw + penalties * PENALTY_SECONDS;
      return [{ team: run.team, time: run.time, penalties, final }];
    });

    runs.sort((a, b) => a.final - b.final);

    // Equal final times share a rank (competition ranking: 1, 2, 2, 4)
    rankedRuns = runs.map((run, i) => ({
      ...run,
      rank: i > 0 && run.final === runs[i - 1].final ? null : i + 1,
    }));
    rankedRuns.forEach((run, i) => {
      if (run.rank === null) run.rank = rankedRuns[i - 1].rank;
    });

    loaded = true;
    loadError = false;
    render();
  },
  (err) => {
    console.error("Unable to load leaderboard data:", err);
    loadError = true;
    render();
  },
);

// ---------- render + search ----------
function render() {
  const query = normalize(searchInput.value);
  searchClear.hidden = !query;
  tbody.replaceChildren();
  searchCount.textContent = "";

  if (loadError) {
    tbody.appendChild(messageRow("Unable to load leaderboard."));
    return;
  }
  if (!loaded) {
    tbody.appendChild(messageRow("Loading..."));
    return;
  }
  if (rankedRuns.length === 0) {
    tbody.appendChild(messageRow("No runs logged yet."));
    return;
  }

  const rows = query
    ? rankedRuns.filter((run) => normalize(run.team).includes(query))
    : rankedRuns;

  if (query) {
    searchCount.textContent = `${rows.length} of ${rankedRuns.length} teams match "${searchInput.value.trim()}"`;
  }
  if (rows.length === 0) {
    tbody.appendChild(messageRow("No matching team found."));
    return;
  }

  const frag = document.createDocumentFragment();
  rows.forEach((run) => {
    const tr = document.createElement("tr");
    if (run.rank <= 3) tr.classList.add(`rank-${run.rank}`);
    if (currentTeam && normalize(run.team) === normalize(currentTeam)) tr.classList.add("on-track");

    [`#${run.rank}`, run.team, run.time, String(run.penalties), secondsToTime(run.final)].forEach((v) => {
      const td = document.createElement("td");
      td.textContent = v;
      tr.appendChild(td);
    });
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
}

searchInput.addEventListener("input", render);
searchClear.addEventListener("click", () => {
  searchInput.value = "";
  render();
  searchInput.focus();
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") searchClear.click();
});
