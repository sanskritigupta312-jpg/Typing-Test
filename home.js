// Config
let TEST_DURATION = 60;
const wordsList = [
    "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "i", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change", "help", "line"
];

// State
let timeLeft = TEST_DURATION;
let timer = null;
let isRunning = false;
let currentWordIndex = 0;
let currentCharIndex = 0; 
let correctChars = 0;
let incorrectChars = 0;
let generatedWords = [];

// DOM Elements
const quoteDisplay = document.getElementById("quote-display");
const hiddenInput = document.getElementById("hidden-input");
const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const focusError = document.getElementById("focus-error");
const resultsModal = document.getElementById("results-modal");
const resultsContent = document.getElementById("results-content");
const themeToggleBtn = document.getElementById("theme-toggle");
const logoutBtn = document.getElementById("logout-btn"); 
const sessionGreeting = document.getElementById("session-greeting");
// Progress Button Element
const progressBtn = document.getElementById("progress-btn");

const clickSoundBase = new Audio("click.mp3"); 
clickSoundBase.volume = 0.5; 


// Initialize
function init() {
    console.log('init: starting');
    
    // 1. Update UI based on session status
    updateSessionUI();

    // 2. Setup initial game state
    setupWords();
    updateDurationLabel(TEST_DURATION);
    
    // --- BUTTON LOGIC ---
    const allButtons = document.querySelectorAll("button");
    allButtons.forEach(btn => {
        btn.addEventListener("click", playClickSound);
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    const restartBtn = document.getElementById("restart-btn");
    if(restartBtn) {
        restartBtn.addEventListener("mousedown", (e) => {
            e.preventDefault(); 
            resetGame();
        });
    }

    // --- DURATION SELECTION LOGIC ---
    const durationOptions = document.querySelectorAll(".duration-option");
    durationOptions.forEach(option => {
        option.addEventListener("click", () => {
            const newDuration = parseInt(option.dataset.duration);
            if (newDuration !== TEST_DURATION) {
                TEST_DURATION = newDuration;
                resetGame(); 
            }
            durationOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateDurationLabel(newDuration);
        });
    });

    // --- FOCUS MANAGEMENT ---
    document.addEventListener("keydown", (ev) => {
        if (ev.key === "Tab") return;
        if (ev.key === "Enter" && document.activeElement.tagName === "BUTTON") return;
        if(document.activeElement !== hiddenInput) {
            focusInput();
        }
    });
    
    hiddenInput.addEventListener("input", (e) => {
        handleInput(e);
    });
    
    hiddenInput.addEventListener("blur", () => {
        if (isRunning) {
            focusError.classList.remove("hidden");
        }
    });

    hiddenInput.addEventListener("focus", () => {
        focusError.classList.add("hidden");
        if (quoteDisplay) quoteDisplay.classList.add('focused');
    });

    hiddenInput.addEventListener('blur', () => {
        if (quoteDisplay) quoteDisplay.classList.remove('focused');
    });
}

// --- SESSION & UI HELPER FUNCTIONS ---

function updateSessionUI() {
    const status = localStorage.getItem('sessionStatus');
    const userName = localStorage.getItem('userName');
    
    if (sessionGreeting && logoutBtn) {
        if (status === 'authenticated') {
            sessionGreeting.textContent = `👋 Welcome, ${userName || 'User'}!`;
            logoutBtn.textContent = "Logout";
            sessionGreeting.classList.add('authenticated-status');
            sessionGreeting.classList.remove('guest-status');
            
            // Show Progress Button
            if(progressBtn) progressBtn.classList.remove('hidden');
        } else {
            sessionGreeting.textContent = "👤 Guest Session";
            logoutBtn.textContent = "End Session";
            sessionGreeting.classList.add('guest-status');
            sessionGreeting.classList.remove('authenticated-status');
            
            // Hide Progress Button
            if(progressBtn) progressBtn.classList.add('hidden');
        }
    }
}

function logout() {
    localStorage.removeItem('sessionStatus');
    localStorage.removeItem('userName'); 
    window.location.href = 'index.html'; 
}

function updateDurationLabel(duration) {
    const navLabel = document.querySelector(".nav-label");
    if (navLabel) {
        navLabel.textContent = `Basic ${duration}s Test`;
    }
}

// --- HISTORY LOGIC (Updated to include Duration) ---

function saveToHistory(wpm, acc, duration) {
    const status = localStorage.getItem('sessionStatus');
    const userName = localStorage.getItem('userName');

    // Only save if user is logged in
    if (status !== 'authenticated' || !userName) return;

    const storageKey = `proType_history_${userName}`;
    
    const newEntry = {
        date: new Date().toISOString(),
        wpm: parseInt(wpm),
        acc: acc,
        duration: duration // New field
    };

    let history = JSON.parse(localStorage.getItem(storageKey)) || [];
    history.unshift(newEntry);

    // Keep last 100 entries
    if (history.length > 100) {
        history = history.slice(0, 100);
    }

    localStorage.setItem(storageKey, JSON.stringify(history));
}

// --- GAME LOGIC ---

function playClickSound() {
    const sound = clickSoundBase.cloneNode();
    sound.volume = 0.5;
    sound.play().catch(() => {}); 
}

function setupWords() {
    generatedWords = [];
    for(let i = 0; i < 200; i++) {
        const randomIndex = Math.floor(Math.random() * wordsList.length);
        generatedWords.push(wordsList[randomIndex]);
    }
    renderWords();
}

function renderWords() {
    quoteDisplay.innerHTML = "";
    generatedWords.forEach((word) => {
        const wordSpan = document.createElement("div");
        wordSpan.className = "word"; 
        
        word.split("").forEach((char) => {
            const charSpan = document.createElement("span");
            charSpan.innerText = char;
            charSpan.className = "char";
            wordSpan.appendChild(charSpan);
        });

        quoteDisplay.appendChild(wordSpan);
    });
    
    updateCursor(0, 0);
}

function updateCursor(wordIdx, charIdx) {
    const oldCursor = document.querySelector(".char.current, .char.current-right");
    if (oldCursor) {
        oldCursor.classList.remove("current", "current-right");
    }

    const wordNodes = quoteDisplay.querySelectorAll(".word");
    if (wordIdx >= wordNodes.length) return;
    
    const currentWordNode = wordNodes[wordIdx];
    const charNodes = currentWordNode.querySelectorAll(".char");

    if (charIdx < charNodes.length) {
        charNodes[charIdx].classList.add("current");
        
        const charTop = charNodes[charIdx].offsetTop;
        const relativeTop = charTop - quoteDisplay.scrollTop;
        
        if (relativeTop > 70) {
            quoteDisplay.scrollTop += 40; 
        }
    } else {
        if (charNodes.length > 0) {
            charNodes[charNodes.length - 1].classList.add("current-right");
        }
    }
}

function handleInput(e) {
    playClickSound(); 

    if (!isRunning && timeLeft > 0) {
        startTimer();
    }

    const inputVal = hiddenInput.value;
    const inputChar = inputVal.slice(-1); 
    const inputType = e.inputType;

    const wordNodes = quoteDisplay.querySelectorAll(".word");
    const currentWordStr = generatedWords[currentWordIndex];
    const currentWordNode = wordNodes[currentWordIndex];
    
    if (!currentWordNode) return;
    
    const charNodes = currentWordNode.querySelectorAll(".char");

    if (inputType === "deleteContentBackward") {
        if (currentCharIndex > 0) {
            currentCharIndex--;
            if (currentCharIndex < charNodes.length) {
                charNodes[currentCharIndex].classList.remove("correct", "incorrect");
            }
        }
        updateCursor(currentWordIndex, currentCharIndex);
        return;
    }

    if (inputChar === " ") {
        currentWordIndex++;
        currentCharIndex = 0;
        hiddenInput.value = ""; 
        updateCursor(currentWordIndex, currentCharIndex);
        return;
    }

    if (currentCharIndex < currentWordStr.length) {
        const targetChar = currentWordStr[currentCharIndex];
        
        if (inputChar === targetChar) {
            charNodes[currentCharIndex].classList.add("correct");
            correctChars++;
        } else {
            charNodes[currentCharIndex].classList.add("incorrect");
            incorrectChars++;
        }
        currentCharIndex++;
    }

    updateCursor(currentWordIndex, currentCharIndex);
    updateStats();
}

function startTimer() {
    isRunning = true;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.innerText = timeLeft;
        updateStats();

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function updateStats() {
    const timeElapsed = TEST_DURATION - timeLeft;
    const timeInMinutes = timeElapsed / 60;
    
    let wpm = 0;
    if (timeElapsed > 0) {
        wpm = Math.round((correctChars / 5) / timeInMinutes);
    }
    
    const totalTyped = correctChars + incorrectChars;
    let acc = 100;
    if (totalTyped > 0) {
        acc = Math.round((correctChars / totalTyped) * 100);
    }

    wpmElement.innerText = isFinite(wpm) ? wpm : 0;
    accuracyElement.innerText = acc + "%";
}

function endGame() {
    clearInterval(timer);
    isRunning = false;
    hiddenInput.blur();
    
    const wpmResult = wpmElement.innerText;
    const accResult = accuracyElement.innerText;

    document.getElementById("result-wpm").innerText = wpmResult;
    document.getElementById("result-acc").innerText = accResult;
    document.getElementById("result-correct").innerText = correctChars;
    document.getElementById("result-wrong").innerText = incorrectChars;

    // --- SAVE RESULT WITH DURATION ---
    saveToHistory(wpmResult, accResult, TEST_DURATION);

    resultsModal.classList.remove("hidden");
    setTimeout(() => {
        resultsModal.classList.remove("opacity-0");
        resultsContent.classList.remove("scale-95", "opacity-0");
        resultsContent.classList.add("scale-100", "opacity-100");
    }, 10);
}

function resetGame() {
    resultsModal.classList.add("opacity-0");
    resultsContent.classList.remove("scale-100");
    resultsContent.classList.add("scale-95");
    
    setTimeout(() => {
        resultsModal.classList.add("hidden");
    }, 300);

    clearInterval(timer);
    
    timeLeft = TEST_DURATION; 
    isRunning = false;
    currentWordIndex = 0;
    currentCharIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    
    timerElement.innerText = TEST_DURATION;
    wpmElement.innerText = "0";
    accuracyElement.innerText = "100%";
    hiddenInput.value = "";
    quoteDisplay.scrollTop = 0; 
    
    setupWords();
    focusInput();
}


function focusInput() {
    hiddenInput.focus();
    focusError.classList.add("hidden");
    
    // Mobile fix: Ensure the active line is visible when keyboard pops up
    // We wait a brief moment for the keyboard to slide up
    setTimeout(() => {
        const cursor = document.querySelector(".char.current");
        if (cursor) {
            cursor.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, 300);
}

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

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

init();
