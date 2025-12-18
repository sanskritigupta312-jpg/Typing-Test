document.addEventListener("DOMContentLoaded", () => {
    
    // --- Theme Logic (Shared) ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme") || "dark";
    
    function applyTheme(theme) {
        if (theme === "light") {
            document.body.classList.add("light");
            if(themeToggleBtn) themeToggleBtn.textContent = "Dark Mode";
        } else {
            document.body.classList.remove("light");
            if(themeToggleBtn) themeToggleBtn.textContent = "Light Mode";
        }
        localStorage.setItem("theme", theme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.body.classList.contains("light") ? "light" : "dark";
            applyTheme(currentTheme === "light" ? "dark" : "light");
        });
    }
    applyTheme(savedTheme);


    // --- Data Loading Logic ---
    const tbody = document.getElementById("progress-body");
    const totalTestsEl = document.getElementById("total-tests");
    const highestWpmEl = document.getElementById("highest-wpm");
    const avgWpmEl = document.getElementById("avg-wpm");

    const status = localStorage.getItem('sessionStatus');
    const userName = localStorage.getItem('userName');

    if (status !== 'authenticated' || !userName) {
        window.location.href = "login.html"; // Redirect if not logged in
        return;
    }

    const storageKey = `proType_history_${userName}`;
    const history = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem;">No tests taken yet. Go type!</td></tr>';
        return;
    }

    // Calculations
    let maxWpm = 0;
    let totalWpm = 0;

    history.forEach(entry => {
        // Stats
        if (entry.wpm > maxWpm) maxWpm = entry.wpm;
        totalWpm += entry.wpm;

        // Table Row
        const row = document.createElement("tr");
        
        // Date Formatting
        const d = new Date(entry.date);
        const dateStr = d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Handle legacy data (before we added duration)
        const durationDisplay = entry.duration ? `${entry.duration}s` : "60s";

        row.innerHTML = `
            <td>${dateStr}</td>
            <td style="color: var(--text-muted);">${durationDisplay}</td>
            <td style="color: var(--accent-pink); font-weight:bold;">${entry.wpm}</td>
            <td>${entry.acc}</td>
        `;
        tbody.appendChild(row);
    });

    // Update Summary Cards
    totalTestsEl.innerText = history.length;
    highestWpmEl.innerText = maxWpm;
    avgWpmEl.innerText = Math.round(totalWpm / history.length);
});