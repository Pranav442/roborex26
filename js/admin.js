import { database } from './firebase-config.js';
import { ref, set, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.getElementById("updateLiveBtn").addEventListener("click", () => {
    const payload = {
        currentTeam: document.getElementById("currentTeam").value || "N/A",
        nextTeam: document.getElementById("nextTeam").value || "N/A"
    };
    
    set(ref(database, "active_track/"), payload)
        .then(() => alert("Live screen updated!"))
        .catch(err => alert("Error: " + err.message));
});

document.getElementById("submitRunBtn").addEventListener("click", () => {
    const team = document.getElementById("logTeam").value;
    const time = document.getElementById("logTime").value;
    const penalties = parseInt(document.getElementById("logPenalties").value || 0);

    if (!team || !time.includes(":")) {
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
        .catch(err => alert("Error: " + err.message));
});