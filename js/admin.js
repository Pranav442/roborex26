import { database, auth } from "./firebase-config.js";
import {
    ref,
    set,
    push,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const loginSection = document.getElementById("loginForm");
const dashboardSection = document.getElementById("dashboardSection");
const loginButton = document.getElementById("loginBtn");

// 1. Hide/Show screens based on login status
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = "none";
        dashboardSection.style.display = "block";
    } else {
        loginSection.style.display = "block";
        dashboardSection.style.display = "none";
    }
});

// 2. Process Login
document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter an email and password.");
        return;
    }

    loginButton.disabled = true;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Login successful!");
            // The screen will automatically change to the dashboard
        })
        .catch((error) => {
            const messages = {
                "auth/invalid-credential":
                    "The email or password is incorrect. Check that this user exists in Firebase Authentication for project roborex-2026.",
                "auth/invalid-email": "Enter a valid email address.",
                "auth/user-disabled":
                    "This Firebase Authentication user has been disabled.",
                "auth/too-many-requests":
                    "Too many failed attempts. Try again later.",
            };
            alert("Login failed: " + (messages[error.code] || error.message));
        })
        .finally(() => {
            loginButton.disabled = false;
        });
});

// 3. Process Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth)
        .then(() => alert("Logged out successfully!"))
        .catch((error) => alert("Error: " + error.message));
});

// 4. Send Live Data
document.getElementById("updateLiveBtn").addEventListener("click", () => {
    const payload = {
        currentTeam: document.getElementById("currentTeam").value.trim() || "N/A",
        nextTeam: document.getElementById("nextTeam").value.trim() || "---",
    };

    set(ref(database, "active_track/"), payload)
        .then(() => alert("Live screen updated!"))
        .catch((err) => alert("Error: " + err.message));
});

// 5. Submit Completed Run
document.getElementById("submitRunBtn").addEventListener("click", () => {
    const team = document.getElementById("logTeam").value.trim();
    const time = document.getElementById("logTime").value.trim();
    const penalties = Number.parseInt(
        document.getElementById("logPenalties").value || "0",
        10,
    );

    if (!team || !/^\d+:[0-5]\d$/.test(time) ||
        !Number.isInteger(penalties) || penalties < 0) {
        alert("Please enter a valid team name and time in MM:SS format.");
        return;
    }

    const payload = { team, time, penalties };

    push(ref(database, "completed_runs/"), payload)
        .then(() => {
            alert(`${team} added to leaderboard!`);
            document.getElementById("logTeam").value = "";
            document.getElementById("logTime").value = "";
            document.getElementById("logPenalties").value = "";
        })
        .catch((err) => alert("Error: " + err.message));
});
