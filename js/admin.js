import { app } from "./firebase-config.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const database = getDatabase(app);
const auth = getAuth(app);

const $ = (id) => document.getElementById(id);
const loginForm = $("loginForm");
const dashboard = $("dashboardSection");
const loginBtn = $("loginBtn");

function setStatus(el, text, ok = true) {
  el.textContent = text;
  el.className = `status ${text ? (ok ? "ok" : "err") : ""}`;
}

// Show login or dashboard based on auth state
onAuthStateChanged(auth, (user) => {
  loginForm.hidden = !!user;
  dashboard.hidden = !user;
  if (user) setStatus($("loginStatus"), "");
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("loginStatus");
  const email = $("email").value.trim();
  const password = $("password").value;
  if (!email || !password) return setStatus(status, "Enter an email and password.", false);

  loginBtn.disabled = true;
  setStatus(status, "Signing in...");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    $("password").value = "";
  } catch (error) {
    const messages = {
      "auth/invalid-credential": "The email or password is incorrect.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/user-disabled": "This user has been disabled.",
      "auth/too-many-requests": "Too many failed attempts. Try again later.",
    };
    setStatus(status, messages[error.code] || error.message, false);
  } finally {
    loginBtn.disabled = false;
  }
});

// Logout
$("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    setStatus($("liveStatus"), "Logout failed: " + error.message, false);
  }
});

// Update live screen
$("updateLiveBtn").addEventListener("click", async () => {
  const btn = $("updateLiveBtn");
  const status = $("liveStatus");
  const payload = {
    currentTeam: $("currentTeam").value.trim() || "N/A",
    nextTeam: $("nextTeam").value.trim() || "---",
  };
  btn.disabled = true;
  try {
    await set(ref(database, "active_track/"), payload);
    setStatus(status, "Live screen updated.");
  } catch (err) {
    setStatus(status, "Error: " + err.message, false);
  } finally {
    btn.disabled = false;
  }
});

// Submit completed run
$("submitRunBtn").addEventListener("click", async () => {
  const btn = $("submitRunBtn");
  const status = $("runStatus");
  const team = $("logTeam").value.trim();
  const time = $("logTime").value.trim();
  const penalties = Number.parseInt($("logPenalties").value || "0", 10);

  if (!team) return setStatus(status, "Enter a team name.", false);
  if (!/^\d+:[0-5]\d$/.test(time)) return setStatus(status, "Time must be in MM:SS format, e.g. 02:30.", false);
  if (!Number.isInteger(penalties) || penalties < 0) return setStatus(status, "Penalties must be 0 or more.", false);

  btn.disabled = true;
  try {
    await push(ref(database, "completed_runs/"), { team, time, penalties });
    setStatus(status, `${team} added to leaderboard.`);
    $("logTeam").value = "";
    $("logTime").value = "";
    $("logPenalties").value = "";
  } catch (err) {
    setStatus(status, "Error: " + err.message, false);
  } finally {
    btn.disabled = false;
  }
});
