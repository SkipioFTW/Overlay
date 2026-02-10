const TEAMS = ['10T', 'ATB', 'ATW', 'ARX', 'B5', 'RAT', 'BP', 'CM', 'DOUG', 'DSS', 'ECO', 'FF', 'FROG', 'GE', 'GG', 'GT', 'GOON', 'UNC', 'HSC', 'JBNN', 'LGKS', 'LUL', 'LFT', 'MSF', 'MBD', 'NG', 'NM1', 'NMD', 'NOT', 'ODD', 'PXE', 'DUSK', 'SK', 'SHOE', 'SG', 'SR', 'ATLA', 'SNPY', 'FEAR', 'FLAW', 'TOP', 'TVE', 'ZEN', 'TBA', 'CITY', 'DSA', 'SF'];

let intervalId = null;

// Populate dropdowns
function setupDropdowns() {
    const selA = document.getElementById('teamA-select');
    const selB = document.getElementById('teamB-select');
    
    TEAMS.forEach(t => {
        selA.options.add(new Option(t, t));
        selB.options.add(new Option(t, t));
    });
}

async function loadTeamData(teamName) {
    try {
        const response = await fetch(`./data/overlay_${teamName}.json`);
        if (!response.ok) return null;
        return await response.json();
    } catch (e) { return null; }
}

function renderTeam(data, color) {
    if (!data) return;
    const content = document.getElementById('view-content');
    let playersHtml = '';

    Object.entries(data.players).forEach(([handle, info]) => {
        const agent = info["Most Played Agent"].toLowerCase();
        playersHtml += `
            <div class="player-card" style="--accent-color: ${color}">
                <div class="agent-label">MOST PLAYED</div>
                <img src="./agents/${agent}.jfif" class="agent-icon" onerror="this.src='agents/default.jfif'">
                <div class="player-name">${handle}</div>
                <div class="player-rank">${info.Rank}</div>
                <div class="stat-box">ACS: ${Math.round(info["Average ACS"])}</div>
            </div>`;
    });

    content.innerHTML = `<h1 class="team-title" style="color:${color}">TEAM ${data.team}</h1><div class="players-container">${playersHtml}</div>`;
}

function renderComparison(dataA, dataB) {
    const content = document.getElementById('view-content');
    const allMaps = [...new Set([...Object.keys(dataA.map_win_rates), ...Object.keys(dataB.map_win_rates)])];
    
    let mapsHtml = allMaps.map(map => `
        <div class="map-row">
            <span style="color:var(--team-a-color)">${dataA.map_win_rates[map] || '0%'}</span>
            <span class="map-name">${map.toUpperCase()}</span>
            <span style="color:var(--team-b-color)">${dataB.map_win_rates[map] || '0%'}</span>
        </div>`).join('');

    content.innerHTML = `
        <div class="comparison-layout">
            <div class="comp-header">
                <div class="team-info-box" style="color:var(--team-a-color)">
                    <div>${dataA.team}</div>
                    <div class="acs-val">${dataA.team_averages.avg_acs}</div>
                </div>
                <div class="vs-text">VS</div>
                <div class="team-info-box" style="color:var(--team-b-color)">
                    <div>${dataB.team}</div>
                    <div class="acs-val">${dataB.team_averages.avg_acs}</div>
                </div>
            </div>
            <div class="maps-section">${mapsHtml}</div>
        </div>`;
}

async function startAnimation(teamA, teamB) {
    if (intervalId) clearInterval(intervalId);
    
    const dataA = await loadTeamData(teamA);
    const dataB = await loadTeamData(teamB);

    if (!dataA || !dataB) {
        alert("Error loading team files. Check /data/ folder.");
        return;
    }

    let state = 0;
    const cycle = () => {
        if (state === 0) renderTeam(dataA, '#add8e6');
        else if (state === 1) renderTeam(dataB, '#ff4b4b');
        else renderComparison(dataA, dataB);
        state = (state + 1) % 3;
    };
    
    cycle();
    intervalId = setInterval(cycle, 10000);
}

// Save to storage and start
function applySettings() {
    const a = document.getElementById('teamA-select').value;
    const b = document.getElementById('teamB-select').value;
    localStorage.setItem('overlay_teamA', a);
    localStorage.setItem('overlay_teamB', b);
    toggleControls();
    startAnimation(a, b);
}

function toggleControls() {
    const panel = document.getElementById('control-panel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'h') toggleControls(); });

// Initialization logic
window.onload = () => {
    setupDropdowns();
    
    // 1. Check URL (e.g., ?a=10T&b=ARX)
    const params = new URLSearchParams(window.location.search);
    let a = params.get('a');
    let b = params.get('b');

    // 2. Check LocalStorage
    if (!a) a = localStorage.getItem('overlay_teamA');
    if (!b) b = localStorage.getItem('overlay_teamB');

    if (a && b && TEAMS.includes(a) && TEAMS.includes(b)) {
        document.getElementById('teamA-select').value = a;
        document.getElementById('teamB-select').value = b;
        document.getElementById('control-panel').style.display = 'none';
        startAnimation(a, b);
    } else {
        document.getElementById('control-panel').style.display = 'flex';
    }
};