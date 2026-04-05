// main.js - Core Logic for Meditation Dopamine Challenge

const AURA_COLORS = [
    'Black', 'Dark Brown', 'Brown', 'Muddy Red', 'Red', 'Red-Orange', 
    'Orange', 'Yellow-Orange', 'Yellow', 'Yellow-Green', 'Green', 
    'Emerald Green', 'Blue-Green', 'Light Blue', 'Blue', 'Indigo', 
    'Violet', 'Lavender', 'White', 'Gold', 'Silver'
];

// 21 Milestones scaling up to exactly 108 minutes (6480 seconds) in a curved sequence
const LEVEL_THRESHOLDS = [
    0, 30, 60, 120, 180, 240, 330, 450, 600, 780, 990,
    1230, 1530, 1890, 2310, 2790, 3330, 3990, 4710, 5550, 6480
];

let gameState = {
    currentLevel: 0,
    totalElapsedSeconds: 0,
    unmovedSeconds: 0,
    strikes: 0,
    piePoints: 0,
    isRunning: false,
    blurRoom: false,
    isDemo: false,
    isPaused: false,
    usingAudio: false,
    lastLogin: null,
    mode: 'normal'
};

let gameLoopInterval = null;

const BACKGROUNDS = {
    normal: '',
    mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1280&auto=format&fit=crop',
    river: 'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?q=80&w=1280&auto=format&fit=crop',
    hut: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1280&auto=format&fit=crop',
    tree: 'https://images.unsplash.com/photo-1448375240586-882707db885b?q=80&w=1280&auto=format&fit=crop',
    peak: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=1280&auto=format&fit=crop'
};

document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    checkDecay();
    updateUI();
});

// Calculate required seconds for a given level (30s * level scaling)
function getLevelDuration(level) {
    if (level === 1) return 30;
    return level * 30; 
}

function getAuraColor(level) {
    const idx = Math.min(level, AURA_COLORS.length - 1);
    return AURA_COLORS[idx];
}

function loadProgress() {
    const saved = localStorage.getItem('meditation_state');
    if (saved) {
        const parsed = JSON.parse(saved);
        gameState.currentLevel = parsed.currentLevel || 1;
        gameState.totalPoints = parsed.totalPoints || 0.0;
        gameState.piePoints = parsed.piePoints || 0;
        gameState.lastLogin = parsed.lastLogin || Date.now();
    } else {
        gameState.lastLogin = Date.now();
        saveProgress();
    }
}

function saveProgress() {
    gameState.lastLogin = Date.now();
    localStorage.setItem('meditation_state', JSON.stringify({
        currentLevel: gameState.currentLevel,
        totalPoints: gameState.totalPoints,
        piePoints: gameState.piePoints,
        lastLogin: gameState.lastLogin
    }));
}

function checkDecay() {
    const now = Date.now();
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    if (now - gameState.lastLogin > tenDaysMs) {
        gameState.currentLevel = Math.max(1, gameState.currentLevel - 1);
        saveProgress();
    }
}

let currentUser = null;

function switchLoginTab(tab) {
    if (tab === 'signin') {
        document.getElementById('form_signin').style.display = 'block';
        document.getElementById('form_signup').style.display = 'none';
        document.getElementById('btn_tab_signin').style.borderColor = 'var(--accent-gold)';
        document.getElementById('btn_tab_signup').style.borderColor = 'transparent';
    } else {
        document.getElementById('form_signin').style.display = 'none';
        document.getElementById('form_signup').style.display = 'block';
        document.getElementById('btn_tab_signup').style.borderColor = 'var(--accent-gold)';
        document.getElementById('btn_tab_signin').style.borderColor = 'transparent';
    }
}

function signUp() {
    const name = document.getElementById('signup_name').value;
    const age = document.getElementById('signup_age').value;
    const email = document.getElementById('signup_email').value;
    const pass = document.getElementById('signup_pass').value;
    
    if (!name || !email || !pass) return alert("Please fill all required fields.");
    
    let users = JSON.parse(localStorage.getItem('meditation_users') || "{}");
    if (users[email]) return alert("Email already registered!");
    
    users[email] = { name, age, password: pass };
    localStorage.setItem('meditation_users', JSON.stringify(users));
    
    alert("Mock Confirmation Email has been dispatched! You can now log in.");
    switchLoginTab('signin');
    document.getElementById('signin_email').value = email;
}

function signIn() {
    const email = document.getElementById('signin_email').value;
    const pass = document.getElementById('signin_pass').value;
    
    let users = JSON.parse(localStorage.getItem('meditation_users') || "{}");
    
    if (users[email] && users[email].password === pass) {
        currentUser = users[email];
        document.getElementById('user_name').value = currentUser.name;
        document.getElementById('user_age').value = currentUser.age || '';
        
        document.getElementById('login_screen').classList.add('hidden');
        document.getElementById('home_screen').classList.remove('hidden');
        document.getElementById('btn_leaderboard_home').style.display = 'block';
    } else if (email === 'admin' && pass === 'admin') {
        // Fallback for easy testing
        currentUser = { name: "Admin", age: 99 };
        document.getElementById('user_name').value = "Admin";
        document.getElementById('login_screen').classList.add('hidden');
        document.getElementById('home_screen').classList.remove('hidden');
        document.getElementById('btn_leaderboard_home').style.display = 'block';
    } else {
        alert("Invalid email or password.");
    }
}

function getModeRadios() {
    const modeRadios = document.getElementsByName('yoga_mode');
    for (let i = 0; i < modeRadios.length; i++) {
        if (modeRadios[i].checked) {
            return modeRadios[i].value;
        }
    }
    return 'normal';
}

function toggleLeaderboard() {
    const p = document.getElementById('leaderboard_panel');
    const ul = document.getElementById('leaderboard_list');
    const title = document.getElementById('leaderboard_title');
    
    if (p.classList.contains('hidden')) {
        const mode = getModeRadios();
        let listHTML = "";
        
        if (mode === 'normal') {
            title.innerText = "NORMAL MASTERS";
            listHTML = `<li><strong style="color:var(--accent-success)">1.</strong> Siddhartha (Lvl 216)</li>
                <li><strong style="color:var(--accent-success)">2.</strong> Patanjali (Lvl 190)</li>
                <li><strong style="color:var(--accent-success)">3.</strong> Rumi (Lvl 150)</li>`;
        } else if (mode === 'dharana') {
            title.innerText = "DHARANA (FOCUS)";
            listHTML = `<li><strong style="color:var(--accent-success)">1.</strong> Focus Monk (Lvl 10)</li>
                <li><strong style="color:var(--accent-success)">2.</strong> MindfulEye (Lvl 8)</li>`;
        } else if (mode === 'dhyana') {
            title.innerText = "DHYANA (CONTEMPLATION)";
            listHTML = `<li><strong style="color:var(--accent-success)">1.</strong> Zen Master (Lvl 14)</li>
                <li><strong style="color:var(--accent-success)">2.</strong> Still Water (Lvl 9)</li>`;
        } else if (mode === 'samadhi') {
            title.innerText = "SAMADHI MASTERS";
            listHTML = `<li><strong style="color:var(--accent-success)">1.</strong> Buddha (Lvl 216)</li>
                <li><strong style="color:var(--accent-success)">2.</strong> Ascended (Lvl 100)</li>`;
        }
        
        if (currentUser && gameState.currentLevel > 1) {
            listHTML += `<li><strong style="color:var(--accent-gold)">-</strong> ${currentUser.name} (Lvl ${gameState.currentLevel})</li>`;
        }
        
        ul.innerHTML = listHTML;
        p.classList.remove('hidden');
    }
}

function closeLeaderboard() {
    document.getElementById('leaderboard_panel').classList.add('hidden');
}

// === HOME SCREEN LOGIC === //

function checkTarget() {
    const val = parseInt(document.getElementById('target_mins').value);
    if (val > 108) {
        alert("You are already at Buddha level! Can you please sit for at least 108 mins?");
    }
}

function goToMeditation() {
    const name = document.getElementById('user_name').value || 'Wanderer';
    document.getElementById('user_profile_title').innerText = `${name.toUpperCase()}'S JOURNEY`;

    // Only blur real room, no virtual backgrounds
    gameState.blurRoom = document.getElementById('bg_blur').checked;
    
    const modeRadios = document.getElementsByName('yoga_mode');
    for (let i = 0; i < modeRadios.length; i++) {
        if (modeRadios[i].checked) {
            gameState.mode = modeRadios[i].value;
            break;
        }
    }

    document.getElementById('meditation_screen').style.backgroundImage = "none";

    // Hide EVERYTHING else
    document.getElementById('login_screen').classList.add('hidden');
    document.getElementById('home_screen').classList.add('hidden');
    document.getElementById('btn_leaderboard_home').style.display = 'none';
    document.getElementById('leaderboard_panel').classList.add('hidden');
    
    document.getElementById('meditation_screen').classList.remove('hidden');
    document.getElementById('btn_toggle_panel').classList.remove('hidden');
    
    if (!document.getElementById('preview_panel').classList.contains('force-show')) {
        document.getElementById('preview_panel').classList.add('hidden');
    }

    // Load camera right away so user can optionally customize
    document.getElementById('loading_overlay').classList.remove('hidden');
    initVision().then(() => {
        document.getElementById('loading_overlay').classList.add('hidden');
    });

    updateUI();
}

function goHome() {
    clearInterval(gameLoopInterval);
    
    document.getElementById('meditation_screen').classList.add('hidden');
    
    if (gameState.isDemo) {
        document.getElementById('login_screen').classList.remove('hidden');
    } else {
        document.getElementById('home_screen').classList.remove('hidden');
        document.getElementById('btn_leaderboard_home').style.display = 'block';
    }
    
    // Reset state
    gameState = { currentLevel: 0, totalElapsedSeconds: 0, unmovedSeconds: 0, strikes: 0, piePoints: 0, isRunning: false, blurRoom: false, isDemo: false, usingAudio: false, mode: 'normal' };
    
    document.getElementById('level_display').innerText = "1";
    document.getElementById('preview_panel').classList.remove('hidden');
}

function togglePreview() {
    const panel = document.getElementById('preview_panel');
    const btn = document.getElementById('btn_preview');
    if (panel.classList.contains('force-show') || !panel.classList.contains('hidden')) {
        panel.classList.remove('force-show');
        panel.classList.add('hidden');
        btn.innerText = "Show Preview Panel (Always ON)";
    } else {
        panel.classList.add('force-show');
        panel.classList.remove('hidden');
        btn.innerText = "Hide Preview Panel";
    }
}

// === MEDITATION LOGIC === //

function startCustomTracking() {
    if (gameState.isRunning) {
        alert("Please Pause or Hard Reset before setting custom targets.");
        return;
    }
    isCustomizingTargets = true;
    customTrackingPoints = []; // reset
    document.getElementById('status_text').innerText = "CLICK CANVAS TO SELECT TARGET NODES";
    document.getElementById('status_text').classList.add('status-pulse');
    document.getElementById('btn_start').classList.add('hidden');
    document.getElementById('btn_custom').classList.add('hidden');
    document.getElementById('btn_save_custom').classList.remove('hidden');
}

function saveCustomTracking() {
    isCustomizingTargets = false;
    document.getElementById('status_text').innerText = "AURA READY";
    document.getElementById('status_text').classList.remove('status-pulse');
    document.getElementById('btn_start').classList.remove('hidden');
    document.getElementById('btn_custom').classList.remove('hidden');
    document.getElementById('btn_save_custom').classList.add('hidden');
    
    // Auto start meditation if targets saved!
    if (!gameState.isRunning) {
        startGame();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('meditation_sidebar');
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
    } else {
        sidebar.classList.add('collapsed');
    }
}

function startGame() {
    if (gameState.isRunning) return;
    
    document.getElementById('loading_overlay').classList.remove('hidden');
    
    initVision().then(() => {
        document.getElementById('loading_overlay').classList.add('hidden');
        document.getElementById('status_text').innerText = "MEDITATING...";
        document.getElementById('status_text').classList.remove('status-pulse');
        
        startCalibration(); // Kick off baseline frame capture

        document.body.classList.add('is-meditating');
        document.getElementById('btn_start').classList.add('hidden');
        document.getElementById('btn_pause').classList.remove('hidden');

        // Reset runtime vars
        gameState.isRunning = true;
        gameState.isPaused = false;
        gameState.strikes = 0;
        gameState.totalElapsedSeconds = 0;
        gameState.unmovedSeconds = 0;
        updateStrikesUI();
        
        if (gameState.usingAudio && ytPlayer && typeof ytPlayer.playVideo === 'function') {
            ytPlayer.playVideo();
        }

        gameLoopInterval = setInterval(gameLoop, 1000);
    }).catch(err => {
        alert("Camera required to play.");
        document.getElementById('loading_overlay').classList.add('hidden');
    });
}

function togglePause() {
    if (!gameState.isRunning) return;

    gameState.isPaused = !gameState.isPaused;
    const btn = document.getElementById('btn_pause');
    const statusText = document.getElementById('status_text');

    if (gameState.isPaused) {
        btn.innerText = "RESUME";
        statusText.innerText = "PAUSED";
        statusText.classList.add('status-pulse');
        if (typeof pauseAuraParticles === 'function') pauseAuraParticles();
        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
    } else {
        btn.innerText = "PAUSE";
        statusText.innerText = "MEDITATING...";
        statusText.classList.remove('status-pulse');
        if (typeof resumeAuraParticles === 'function') resumeAuraParticles();
    }
}

function gameLoop() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    gameState.totalElapsedSeconds++;
    gameState.unmovedSeconds++;
    
    // Core Score logic
    const pointIncrement = 1 / 3.1413;
    gameState.totalPoints = (gameState.totalPoints || 0) + pointIncrement;
    
    if (gameState.isDemo) {
        // Fast-Forward: Cycle all 21 colours over 60 seconds (1 level specifically every 3s)
        gameState.currentLevel = Math.min(20, Math.floor((gameState.totalElapsedSeconds / 60) * 20));
        
        if (gameState.totalElapsedSeconds >= 60) {
            alert("Demo Journey Complete! You rapidly witnessed the full Aura Evolution up to Silver. Now try a real session!");
            goHome();
            resetProgress();
            return;
        }
    } else {
        // Eye tracking violation check!
        if (gameState.eyesOpen) {
            if (gameState.totalElapsedSeconds >= 30) {
                gameState.eyesViolationTimer = (gameState.eyesViolationTimer || 0) + 1;
                if (gameState.eyesViolationTimer >= 3) {
                    gameOver("Meditation Failed: Your eyes stayed open too long! They must remain closed.");
                    return;
                }
            }
        } else {
            gameState.eyesViolationTimer = 0;
        }

        // Streaks for Pie Points
        if (gameState.unmovedSeconds === 180) { // 3 min
            awardPiePoints(7);
            showBonusAlert("3 MINUTE STREAK! +7 Pie Points");
        } else if (gameState.unmovedSeconds === 1260) { // 21 min
            awardPiePoints(7);
            showBonusAlert("21 MINUTE STREAK! +7 Pie Points (DEEP ZEN)");
        }
        
        // Use logic for calculating Aura Evolution purely visually via totalElapsedSeconds (ignoring pie points offset)
        let effectiveSeconds = gameState.totalElapsedSeconds;

        let newLevel = calculateNewLevel(effectiveSeconds);
        
        if (newLevel > gameState.currentLevel) {
            const newColorName = getAuraColor(newLevel);
            const newColorHex = getAuraHexColor(newColorName);
            if (typeof burstAuraParticles === 'function') burstAuraParticles(newColorHex);
        }
        gameState.currentLevel = newLevel;
    }
    
    updateUI();
}

function calculateNewLevel(effectiveSeconds) {
    let newLevel = 0;
    if (gameState.mode === 'dharana') {
        newLevel = Math.min(20, Math.floor(effectiveSeconds / 21));
    } else if (gameState.mode === 'dhyana') {
        newLevel = Math.min(20, Math.floor(effectiveSeconds / 48));
    } else if (gameState.mode === 'samadhi') {
        newLevel = Math.min(20, Math.floor(effectiveSeconds / 108));
    } else {
        for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (effectiveSeconds >= LEVEL_THRESHOLDS[i]) {
                newLevel = i;
            }
        }
    }
    return newLevel;
}

function awardPiePoints(pts) {
    gameState.piePoints += pts;
    saveProgress();
    updateUI();
}

function showBonusAlert(msg) {
    const el = document.getElementById('status_text');
    el.innerText = msg;
    el.style.color = 'var(--accent-gold)';
    setTimeout(() => {
        el.innerText = "MEDITATING...";
        el.style.color = '';
    }, 4000);
}

function registerStrike() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    if (window.lastStrike && (Date.now() - window.lastStrike < 2000)) return;
    window.lastStrike = Date.now();
    
    gameState.strikes++;
    
    const oldColorName = getAuraColor(gameState.currentLevel);
    const oldColorHex = getAuraHexColor(oldColorName);
    
    if (typeof burstAuraParticles === 'function') burstAuraParticles(oldColorHex);

    if (gameState.strikes === 1) {
        gameState.totalElapsedSeconds = Math.max(0, gameState.totalElapsedSeconds - 300);
        showBonusAlert(`Strike 1! Lost 5 mins! Aura disintegrating!`);
    } else if (gameState.strikes === 2) {
        gameState.totalElapsedSeconds = Math.max(0, gameState.totalElapsedSeconds - 600);
        showBonusAlert(`Strike 2! Lost 10 mins! Aura heavily disintegrating!`);
    } else if (gameState.strikes >= 3) {
        if (gameState.isDemo) {
            const retry = confirm("Demo Failed: You have been moving! You must remain completely unmoved.\n\nClick OK to Restart the 1-Min Demo, or Cancel to go back to Home.");
            if (retry) { resetProgress(); runOneMinDemo(); } else { goHome(); }
            return;
        }
        gameOver("Aura Broken: You moved 3 times! Please minimize body movement.");
        return;
    }
    
    // Immediately Recalculate Level to instantly downgrade color
    let effectiveSeconds = gameState.totalElapsedSeconds + (gameState.piePoints * 60);
    gameState.currentLevel = calculateNewLevel(effectiveSeconds);

    updateUI();
    updateStrikesUI();
}

function gameOver(msg = "Aura Broken: Please remain incredibly still.") {
    gameState.isRunning = false;
    gameState.isPaused = false;
    clearInterval(gameLoopInterval);

    setTimeout(() => alert(msg), 200);

    document.body.classList.remove('is-meditating');
    document.getElementById('btn_start').classList.remove('hidden');
    document.getElementById('btn_start').innerText = "RETRY";
    document.getElementById('btn_pause').classList.add('hidden');
    document.getElementById('btn_pause').innerText = "PAUSE";

    document.getElementById('status_text').innerText = "AURA BROKEN (3 Strikes)";
    document.getElementById('status_text').classList.add('status-pulse');
    
    if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
    
    gameState.totalElapsedSeconds = 0; // Lost level progress
    saveProgress();
}

function updateUI() {
    document.getElementById('level_display').innerText = gameState.currentLevel;
    document.getElementById('points_display').innerText = gameState.totalPoints.toFixed(2);
    document.getElementById('pie_display').innerText = gameState.piePoints;
    
    const auraColorName = getAuraColor(gameState.currentLevel);
    document.getElementById('aura_display').innerText = auraColorName;
    
    const hexColor = getAuraHexColor(auraColorName);
    document.documentElement.style.setProperty('--aura-color', hexColor);
    
    // Submerge animation effect for Normal background if normal mode
    if (gameState.mode === 'normal') {
        // Just make sure the color transitions smoothly
    }
    
    const mins = Math.floor(gameState.totalElapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (gameState.totalElapsedSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timer_text').innerText = `${mins}:${secs}`;
}

// Helper for UI Time
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function runOneMinDemo() {
    gameState.isDemo = true;
    document.getElementById('user_name').value = "Demo Meditator";
    document.getElementById('target_mins').value = 1;
    
    // Hide customization UI logic for demo specifically
    document.getElementById('btn_custom').classList.add('hidden');
    document.getElementById('status_text').innerText = "CALIBRATING DEMO MODULE...";
    
    goToMeditation();
    
    // Auto-initiate Demo
    setTimeout(() => {
        if (!gameState.isRunning && visionInitialized) startGame();
    }, 2000);
}

function getAuraHexColor(name) {
    const map = {
        'Black': '#000000', 'Dark Brown': '#3e2723', 'Brown': '#5d4037', 
        'Muddy Red': '#bf360c', 'Red': '#f44336', 'Red-Orange': '#ff5722', 
        'Orange': '#ff9800', 'Yellow-Orange': '#ffb300', 'Yellow': '#ffeb3b', 
        'Yellow-Green': '#cddc39', 'Green': '#4caf50', 'Emerald Green': '#00e676', 
        'Blue-Green': '#00bfa5', 'Light Blue': '#03a9f4', 'Blue': '#2196f3', 
        'Indigo': '#3f51b5', 'Violet': '#9c27b0', 'Lavender': '#e1bee7', 
        'White': '#ffffff', 'Gold': '#ffd700', 'Silver': '#c0c0c0'
    };
    return map[name] || '#000000';
}

function updateStrikesUI() {
    for (let i = 1; i <= 3; i++) {
        const str = document.getElementById(`strike_${i}`);
        if (i <= gameState.strikes) {
            str.classList.add('active');
        } else {
            str.classList.remove('active');
        }
    }
}

function resetProgress() {
    if (confirm("Are you sure you want to hard reset all progress?")) {
        gameState.currentLevel = 0;
        gameState.totalElapsedSeconds = 0;
        gameState.piePoints = 0;
        gameState.unmovedSeconds = 0;
        saveProgress();
        updateUI();
    }
}

