// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';
const NPC_LIST = { 1: [], 2: [], 3: ['未入團強力路人1', '未入團強力路人2'], 4: ['未入團強力路人5'], 5: [] };
const TEAM_CONFIG = {
    1: { name: '大陰帝國', id: 'team1-body', theme: 'tier-1-theme' },
    2: { name: '大陰帝國-稽查菊', id: 'team2-body', theme: 'tier-2-theme' },
    3: { name: '大陰帝國-手入與支出', id: 'team3-body', theme: 'tier-3-theme' },
    4: { name: '大陰帝國-抽查桃稅', id: 'team4-body', theme: 'tier-4-theme' },
    5: { name: '大陰帝國-天龍特攻隊', id: 'team5-body', theme: 'tier-5-theme' }
};

// ==========================================
// 1. 網站視覺特效
// ==========================================
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
function hackEffect(element) {
    let iterations = 0; const originalText = element.dataset.value || element.innerText; 
    if(!element.dataset.value) element.dataset.value = originalText;
    const interval = setInterval(() => {
        element.innerText = originalText.split("").map((letter, index) => {
            if(index < iterations) return originalText[index];
            return letters[Math.floor(Math.random() * 43)];
        }).join("");
        if(iterations >= originalText.length) clearInterval(interval); iterations += 1 / 2; 
    }, 30);
}

function initMagnetic() {
    if (window.innerWidth < 768) return; 
    const magnets = document.querySelectorAll('.team-title');
    magnets.forEach(magnet => {
        magnet.classList.add('magnetic-target'); 
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            magnet.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.05}px, ${(e.clientY - rect.top - rect.height / 2) * 0.1}px)`;
        });
        magnet.addEventListener('mouseleave', () => { magnet.style.transform = 'translate(0px, 0px)'; });
    });
}

function initScrollEffects() {
    const progressBar = document.getElementById('progressBar');
    const titles = document.querySelectorAll('.team-title');
    const sections = document.querySelectorAll('.team-section');
    const titleObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { hackEffect(entry.target); titleObserver.unobserve(entry.target); } }); }, { threshold: 0.5 });
    titles.forEach(title => titleObserver.observe(title));
    const sectionObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('reveal-active'); sectionObserver.unobserve(entry.target); } }); }, { threshold: 0.1 });
    sections.forEach(section => sectionObserver.observe(section));
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if(progressBar) progressBar.style.width = (winScroll / height) * 100 + "%";
    });
}

function updateSysMonitor() {
    const monitor = document.getElementById('sysMonitor'); if (!monitor) return;
    const now = new Date();
    monitor.innerHTML = `SYS_TIME: ${now.toLocaleTimeString('en-US', { hour12: false })}<br>FPS: ${Math.floor(Math.random()*5+55)}<br>PING: ${Math.floor(Math.random()*10+10)}ms<br>STATUS: ONLINE`;
}
setInterval(updateSysMonitor, 1000);

function runBootSequence() {
    const textElement = document.getElementById('terminal-text');
    const bootScreen = document.getElementById('boot-screen');
    if (!textElement || !bootScreen) return;
    const logs = ["INITIALIZING SYSTEM...", "LOADING KERNEL MODULES...", "CONNECTING TO MLB DATABASE...", "VERIFYING CLUB CREDENTIALS [大陰帝國]...", "ACCESS GRANTED.", "SYSTEM ONLINE."];
    let lineIndex = 0;
    function typeLine() {
        if (lineIndex < logs.length) {
            const line = document.createElement('div');
            line.textContent = `> ${logs[lineIndex]}`;
            textElement.appendChild(line);
            lineIndex++;
            setTimeout(typeLine, Math.random() * 100 + 50);
        } else {
            setTimeout(() => {
                bootScreen.style.transition = "opacity 0.8s ease";
                bootScreen.style.opacity = "0";
                setTimeout(() => { bootScreen.style.display = "none"; }, 800);
            }, 500);
        }
    }
    typeLine();
}

function initCursor() {
    if (window.innerWidth < 768) return;
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const crossX = document.querySelector('.crosshair-x');
    const crossY = document.querySelector('.crosshair-y');
    if(cursorDot) cursorDot.style.opacity = 0; if(cursorOutline) cursorOutline.style.opacity = 0;
    window.addEventListener("mousemove", function (e) {
        if(cursorDot) { cursorDot.style.opacity = 1; cursorDot.style.left = `${e.clientX}px`; cursorDot.style.top = `${e.clientY}px`; }
        if(cursorOutline) { cursorOutline.style.opacity = 1; cursorOutline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 100, fill: "forwards" }); }
        if(crossX && crossY) { crossX.style.top = `${e.clientY}px`; crossY.style.left = `${e.clientX}px`; }
    });
}

// ==========================================
// 2. 排名資料渲染
// ==========================================
function renderRow(container, player, rank) {
    const tr = document.createElement('tr'); 
    tr.style.animation = `fadeIn 0.5s ease forwards`;
    let displayRank = `#${rank}`;
    let displayScore = `(PR: ${player.score})`;
    
    if (player.isLeader) { 
        tr.classList.add('row-leader'); 
        displayRank = '#1'; displayScore = '👑 大陰團長'; 
    } 
    else if (player.isNPC) { 
        tr.classList.add('row-npc'); 
        displayScore = '⚡ 強力NPC'; 
    } 
    else {
        let tagsHtml = '';
        if (player.isDemoted) { 
            tr.classList.add('row-demoted'); 
            tagsHtml += `<span class="demoted-tag">自願降團</span>`;
        }
        if (player.isNew) {
            tagsHtml += `<span class="new-tag">新血</span>`;
        }
        displayScore += tagsHtml;
    }

    tr.innerHTML = `<td class="rank">${displayRank}</td><td class="hacker-text name" data-value="${player.name}">${player.name}</td><td class="score">${displayScore}</td>`;
    const nameCell = tr.querySelector('.hacker-text');
    if(nameCell) nameCell.addEventListener('mouseover', () => hackEffect(nameCell));
    container.appendChild(tr);
}

async function loadRankings() {
    runBootSequence(); 
    try {
        const response = await fetch(CSV_FILE_PATH); const csvText = await response.text(); const rows = csvText.trim().split('\n').slice(1);
        let waitingList = [], demotedList = [], leaderData = null;     
        rows.forEach(row => {
            const columns = row.split(','); if (columns.length < 3) return;
            const name = columns[1].trim(), score = columns[2].trim();
            const note = columns[3] ? columns[3].trim() : ""; 
            
            const playerData = { 
                name: name, score: score, 
                isLeader: false, isNPC: false, isDemoted: false, isNew: false 
            };

            if (name === '陰帝') { leaderData = playerData; leaderData.isLeader = true; } 
            else {
                if (note.includes('自願降團')) playerData.isDemoted = true;
                if (note.includes('新血')) playerData.isNew = true;

                if (playerData.isDemoted) { demotedList.push(playerData); } 
                else { waitingList.push(playerData); }
            }
        });
        
        let globalRankCounter = 1; 
        for (let teamNum = 1; teamNum <= 5; teamNum++) {
            const config = TEAM_CONFIG[teamNum]; const tableBody = document.getElementById(config.id); if (!tableBody) continue;
            const section = tableBody.closest('.team-section'); if (section) section.classList.add(config.theme); tableBody.innerHTML = ''; 
            let currentTeamCount = 0; const MAX_PER_TEAM = 20;  
            
            if (teamNum === 1 && leaderData) { renderRow(tableBody, leaderData, globalRankCounter); currentTeamCount++; globalRankCounter++; }
            
            const npcs = NPC_LIST[teamNum] || [];
            npcs.forEach(npcName => { if (teamNum === 5 || currentTeamCount < MAX_PER_TEAM) { renderRow(tableBody, { name: npcName, score: "強力NPC", isLeader: false, isNPC: true }, globalRankCounter); currentTeamCount++; globalRankCounter++; }});
            
            if (teamNum === 5) { while (demotedList.length > 0) { renderRow(tableBody, demotedList.shift(), globalRankCounter); currentTeamCount++; globalRankCounter++; } }
            
            while (waitingList.length > 0 && (teamNum === 5 || currentTeamCount < MAX_PER_TEAM)) { renderRow(tableBody, waitingList.shift(), globalRankCounter); currentTeamCount++; globalRankCounter++; }
        }
        initCursor(); updateSysMonitor(); setTimeout(() => { initScrollEffects(); initMagnetic(); }, 100);
        const today = new Date(); const dateEl = document.getElementById('update-date');
        if(dateEl) dateEl.textContent = `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    } catch (error) { console.error('讀取數據失敗:', error); if(document.getElementById('boot-screen')) document.getElementById('boot-screen').style.display = 'none'; }
}
// 🌟 V22.0 更新：戰力條逆轉算法 + 棒球圖示
function renderRow(container, player, rank) {
    const tr = document.createElement('tr'); 
    tr.style.animation = `fadeIn 0.5s ease forwards`;
    
    let displayRank = `#${rank}`;
    let displayScoreText = `PR: ${player.score}`;
    
    // --- 1. 計算能量條長度 (逆轉邏輯) ---
    // 假設最爛的分數大約是 60000，我們以此為基準
    const MAX_REFERENCE_SCORE = 60000; 
    let rawScore = parseInt(player.score);
    if (isNaN(rawScore)) rawScore = MAX_REFERENCE_SCORE; // 防止非數字出錯

    // 公式：分數越低，百分比越高。限制最少顯示 5% 以免完全看不到
    let percent = Math.max(5, (1 - (rawScore / MAX_REFERENCE_SCORE)) * 100);
    
    // --- 2. 動態顏色判定 ---
    // 強者(>80%)用金色，中等用青色，弱者用紅色
    let barColor = 'linear-gradient(90deg, #0066ff, #00f3ff)'; // 預設青色
    if (percent > 80) barColor = 'linear-gradient(90deg, #ffaa00, #ffd700)'; // 金色
    else if (percent < 30) barColor = 'linear-gradient(90deg, #880000, #ff2a2a)'; // 紅色

    // --- 3. 處理特殊身份與圖示 ---
    let icon = '⚾'; // 預設棒球
    
    if (player.isLeader) { 
        tr.classList.add('row-leader'); 
        displayRank = '#1'; 
        displayScoreText = '👑 大陰團長'; // 團長不顯示 PR，顯示頭銜
        icon = '🏆'; // 團長是獎盃
        percent = 100; // 團長永遠滿條
        barColor = 'linear-gradient(90deg, #ffaa00, #ffd700)';
    } 
    else if (player.isNPC) { 
        tr.classList.add('row-npc'); 
        displayScoreText = '⚡ 強力NPC'; 
        icon = '🤖'; // NPC 是機器人
        percent = 95; // NPC 也很強
    } 
    else {
        // 一般玩家特殊標籤
        let tagsHtml = '';
        if (player.isDemoted) { 
            tr.classList.add('row-demoted'); 
            tagsHtml += `<span class="demoted-tag">自願降團</span>`;
            icon = '📉'; // 降團圖示
        }
        if (player.isNew) {
            tagsHtml += `<span class="new-tag">新血</span>`;
            icon = '🌱'; // 新血圖示
        }
        displayScoreText += tagsHtml;
    }

    // --- 4. 生成 HTML ---
    tr.innerHTML = `
        <td class="rank">${displayRank}</td>
        <td class="hacker-text name" data-value="${player.name}">
            <span class="baseball-icon">${icon}</span>${player.name}
        </td>
        <td class="score">
            <div class="power-bar-wrapper">
                <div style="margin-bottom:2px;">${displayScoreText}</div>
                <div class="power-bar-container">
                    <div class="power-bar-fill" style="width: ${percent}%; background: ${barColor};"></div>
                </div>
            </div>
        </td>
    `;
    
    const nameCell = tr.querySelector('.hacker-text');
    if(nameCell) nameCell.addEventListener('mouseover', () => hackEffect(nameCell));
    container.appendChild(tr);
}
// ... 在 renderRow 函式中 ...

let icon = '⚾'; // 預設圖示
if (player.isLeader) icon = '🏆'; // 團長是獎盃
else if (player.isNPC) icon = '🤖'; // NPC 是機器人
else if (rank <= 3) icon = '🔥'; // 前三名是火焰

// 更新 HTML
tr.innerHTML = `
    <td class="rank">${displayRank}</td>
    <td class="hacker-text name" data-value="${player.name}">
        <span style="margin-right:8px; font-size:0.8em;">${icon}</span>${player.name}
    </td>
    <td class="score">
        </td>
`;
loadRankings();