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
});

// Helper: Convert MM:SS to total seconds for sorting
function timeToSeconds(timeStr) {
    const parts = timeStr.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
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

    const runsArray = Object.values(data).map(run => {
        const rawSeconds = timeToSeconds(run.time);
        const penaltySeconds = run.penalties * 5; // Assuming +5 seconds per penalty
        const finalSeconds = rawSeconds + penaltySeconds;
        
        return {
            ...run,
            finalSeconds: finalSeconds,
            finalDisplay: secondsToTime(finalSeconds)
        };
    });

    runsArray.sort((a, b) => a.finalSeconds - b.finalSeconds);

    tbody.innerHTML = "";
    runsArray.forEach((run, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td>${run.team}</td>
            <td>${run.time}</td>
            <td>${run.penalties}</td>
            <td style="font-weight:bold;">${run.finalDisplay}</td>
        `;
        tbody.appendChild(tr);
    });
});