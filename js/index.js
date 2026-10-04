import { database } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. Listen for Active Track Updates
const activeRef = ref(database, "active_track/");
onValue(activeRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        document.getElementById("current").textContent = data.currentTeam || "N/A";
        document.getElementById("next").textContent = data.nextTeam || "---";
    }
}, (error) => {
    console.error("Unable to load live track data:", error);
});

// Helper: Convert MM:SS to total seconds for sorting
function timeToSeconds(timeStr) {
    const match = /^(\d+):([0-5]\d)$/.exec(String(timeStr));
    if (!match) {
        return Number.POSITIVE_INFINITY;
    }
    return Number(match[1]) * 60 + Number(match[2]);
}

// Helper: Convert total seconds back to MM:SS for display
function secondsToTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

const runsRef = ref(database, "completed_runs/");
onValue(runsRef, (snapshot) => {
    const data = snapshot.val();
    const tbody = document.getElementById("leaderboardBody");
    
    if (!data) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No runs logged yet.</td></tr>';
        return;
    }

    const runsArray = Object.values(data).flatMap((run) => {
        if (!run || typeof run !== "object") {
            return [];
        }

        const rawSeconds = timeToSeconds(run.time);
        const penalties = Number.isInteger(run.penalties) && run.penalties >= 0
            ? run.penalties
            : 0;
        const penaltySeconds = penalties * 5;
        const finalSeconds = rawSeconds + penaltySeconds;

        if (!Number.isFinite(rawSeconds) || typeof run.team !== "string") {
            return [];
        }

        return {
            ...run,
            penalties,
            finalSeconds: finalSeconds,
            finalDisplay: secondsToTime(finalSeconds)
        };
    });

    runsArray.sort((a, b) => a.finalSeconds - b.finalSeconds);

    tbody.innerHTML = "";
    runsArray.forEach((run, index) => {
        const tr = document.createElement("tr");
        const cells = [
            `#${index + 1}`,
            run.team,
            run.time,
            String(run.penalties),
            run.finalDisplay,
        ];
        cells.forEach((value) => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });
        tr.lastElementChild.style.fontWeight = "bold";
        tbody.appendChild(tr);
    });
}, (error) => {
    console.error("Unable to load leaderboard data:", error);
    document.getElementById("leaderboardBody").innerHTML =
        '<tr><td colspan="5" style="text-align:center;">Unable to load leaderboard.</td></tr>';
});