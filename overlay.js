const TEAMS = ['10T', 'ATB', 'ATW', 'ARX', 'B5', 'RAT', 'BP', 'CM', 'DOUG', 'DSS', 'ECO', 'FF', 'FROG', 'GE', 'GG', 'GT', 'GOON', 'UNC', 'HSC', 'JBNN', 'LGKS', 'LUL', 'LFT', 'MSF', 'MBD', 'NG', 'NM1', 'NMD', 'NOT', 'ODD', 'PXE', 'DUSK', 'SK', 'SHOE', 'SG', 'SR', 'ATLA', 'SNPY', 'FEAR', 'FLAW', 'TOP', 'TVE', 'ZEN', 'TBA', 'CITY', 'DSA', 'SF'];

let intervalId = null;

// ─── Agent role mapping ───
const AGENT_ROLES = {
    jett: 'DUELIST', reyna: 'DUELIST', raze: 'DUELIST', phoenix: 'DUELIST',
    yoru: 'DUELIST', neon: 'DUELIST', iso: 'DUELIST', waylay: 'DUELIST',
    sova: 'INITIATOR', breach: 'INITIATOR', skye: 'INITIATOR', kayo: 'INITIATOR',
    fade: 'INITIATOR', gekko: 'INITIATOR', tejo: 'INITIATOR',
    brimstone: 'CONTROLLER', viper: 'CONTROLLER', omen: 'CONTROLLER',
    astra: 'CONTROLLER', harbor: 'CONTROLLER', clove: 'CONTROLLER',
    sage: 'SENTINEL', cypher: 'SENTINEL', killjoy: 'SENTINEL',
    chamber: 'SENTINEL', deadlock: 'SENTINEL', vyse: 'SENTINEL', veto: 'SENTINEL'
};

// ─── Populate dropdowns ───
function setupDropdowns() {
    const selA = document.getElementById('teamA-select');
    const selB = document.getElementById('teamB-select');
    TEAMS.forEach(t => {
        selA.options.add(new Option(t, t));
        selB.options.add(new Option(t, t));
    });
}

// ─── Load JSON ───
async function loadTeamData(teamName) {
    try {
        const response = await fetch(`./data/overlay_${teamName}.json`);
        if (!response.ok) return null;
        return await response.json();
    } catch (e) { return null; }
}

// ─── Render Team View ───
function renderTeam(data, color, isTeamA) {
    if (!data) return;
    const content = document.getElementById('view-content');

    // Build player cards
    let playersHtml = '';
    Object.entries(data.players).forEach(([handle, info]) => {
        const agentRaw = info["Most Played Agent"];
        const agentLower = (agentRaw || 'default').toLowerCase();
        const role = AGENT_ROLES[agentLower] || 'AGENT';
        const acs = Math.round(info["Average ACS"]);
        const kd = info["Average K/D"] != null ? info["Average K/D"].toFixed(2) : '—';
        const adr = info["Average ADR"] != null ? Math.round(info["Average ADR"]) : '—';
        const kast = info["Average KAST"] != null ? Math.round(info["Average KAST"]) : '—';
        const hs = info["Average HS%"] != null ? Math.round(info["Average HS%"]) : '—';

        const imgSrc = agentLower === 'default' ? '' : `./agents/${agentLower}.jfif`;
        const imgStyle = agentLower === 'default' ? 'style="opacity:0"' : '';

        playersHtml += `
            <div class="player-card" style="--accent-color: ${color}">
                <div class="card-image-area">
                    <img src="${imgSrc}" ${imgStyle}
                         onerror="this.onerror=null; this.style.opacity='0';"
                         alt="${agentRaw}">
                    <div class="role-badge">${role}</div>
                </div>
                <div class="card-info">
                    <div class="player-name">${handle.replace('@', '')}</div>
                    <div class="player-rank">🏆 ${info.Rank}</div>
                    <div class="stats-grid">
                        <div class="stat-row">
                            <span class="stat-label">ACS</span>
                            <span class="stat-value">${acs}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">ADR</span>
                            <span class="stat-value">${adr}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">KAST</span>
                            <span class="stat-value">${kast}%</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">HS%</span>
                            <span class="stat-value">${hs}%</span>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    const sideLabel = isTeamA ? 'TEAM A' : 'TEAM B';

    content.innerHTML = `
        <div class="team-view" style="--accent-color: ${color}">
            <div class="team-header" style="--accent-color: ${color}">
                <div class="team-icon">${data.team_tag || data.team}</div>
                <div class="team-name">${data.team}</div>
                <div class="team-side">${sideLabel}</div>
            </div>
            <div class="players-container">${playersHtml}</div>
        </div>`;
}

// ─── Render Comparison View ───
function renderComparison(dataB, dataA) { // Note: original code might have had teamA/B order, let's keep consistency
    const content = document.getElementById('view-content');
    const colorA = 'var(--team-a-color)';
    const colorB = 'var(--team-b-color)';

    // Union of all maps played by either team
    const allMaps = [...new Set([
        ...Object.keys(dataA.map_win_rates),
        ...Object.keys(dataB.map_win_rates)
    ])];

    // Map rows
    const mapsHtml = allMaps.map(map => {
        const rateA = dataA.map_win_rates[map] || '—';
        const rateB = dataB.map_win_rates[map] || '—';
        return `
            <div class="map-row">
                <span class="map-val left" style="color:${colorA}">${rateA}</span>
                <span class="map-name">${map.toUpperCase()}</span>
                <span class="map-val right" style="color:${colorB}">${rateB}</span>
            </div>`;
    }).join('');

    // Comparison Metrics
    const metrics = [
        { label: 'AVERAGE ADR', key: 'avg_adr', format: (v) => v.toFixed(1), max: 200 },
        { label: 'ENTRY SUCCESS', key: 'avg_fk_success', format: (v) => v.toFixed(1) + '%', max: 100 },
        { label: 'AVG KAST', key: 'avg_kast', format: (v) => v.toFixed(1) + '%', max: 100 }
    ];

    let metricsHtml = '';
    metrics.forEach(m => {
        const valA = dataA.team_averages[m.key] || 0;
        const valB = dataB.team_averages[m.key] || 0;

        metricsHtml += `
            <div class="comp-stat-pair">
                <div class="comp-stat-box">
                    <div class="comp-stat-label">${m.label}</div>
                    <div class="comp-stat-value" style="color:${colorA}">${m.format(valA)}</div>
                    <div class="comp-stat-bar">
                        <div class="comp-stat-bar-fill" style="width:${(valA / m.max * 100)}%; background:${colorA}"></div>
                    </div>
                </div>
                <div class="comp-stat-box">
                    <div class="comp-stat-label">${m.label}</div>
                    <div class="comp-stat-value" style="color:${colorB}">${m.format(valB)}</div>
                    <div class="comp-stat-bar">
                        <div class="comp-stat-bar-fill" style="width:${(valB / m.max * 100)}%; background:${colorB}"></div>
                    </div>
                </div>
            </div>`;
    });

    content.innerHTML = `
        <div class="comparison-layout">
            <!-- Header -->
            <div class="comp-header">
                <div class="comp-team-block">
                    <div class="comp-team-name" style="color:${colorA}; --glow-color: var(--team-a-glow)">${dataA.team}</div>
                    <span class="comp-team-side" style="color:${colorA}; border-color:${colorA}">TEAM A</span>
                </div>
                <div class="vs-circle">VS</div>
                <div class="comp-team-block">
                    <div class="comp-team-name" style="color:${colorB}; --glow-color: var(--team-b-glow)">${dataB.team}</div>
                    <span class="comp-team-side" style="color:${colorB}; border-color:${colorB}">TEAM B</span>
                </div>
            </div>

            <!-- Stat boxes -->
            <div class="comp-stats-row">
                ${metricsHtml}
            </div>

            <!-- Map win rates -->
            <div class="maps-section">
                <div class="maps-section-header">MAP WIN RATES</div>
                ${mapsHtml}
            </div>
        </div>`;
}

// ─── Animation Cycle ───
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
        if (state === 0) renderTeam(dataA, '#00e5ff', true);
        else if (state === 1) renderTeam(dataB, '#ff4655', false);
        else renderComparison(dataA, dataB);
        state = (state + 1) % 3;
    };

    cycle();
    intervalId = setInterval(cycle, 10000);
}

// ─── Controls ───
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

// ─── Init ───
window.onload = () => {
    setupDropdowns();

    const params = new URLSearchParams(window.location.search);
    let a = params.get('a');
    let b = params.get('b');

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