// ==========================================
// 1. 設定與變數定義
// ==========================================
const CSV_FILE_PATH = 'rankings.csv';

// NPC 設定
const NPC_LIST = { 
    1: [], 
    2: [], 
    3: ['未入團強力路人1', '未入團強力路人2'], 
    4: ['未入團強力路人5'], 
    5: [] 
};

// 團別設定
const TEAM_CONFIG = {
    1: { name: '大陰帝國', id: 'team1-body', theme: 'tier-1-theme' },
    2: { name: '大陰帝國-稽查菊', id: 'team2-body', theme: 'tier-2-theme' },
    3: { name: '大陰帝國-手入與支出', id: 'team3-body', theme: 'tier-3-theme' },
    4: { name: '大陰帝國-抽查桃稅', id: 'team4-body', theme: 'tier-4-theme' },
    5: { name: '大陰帝國-天龍特攻隊', id: 'team5-body', theme: 'tier-5-theme' }
};

// ==========================================
// 2. 網站視覺特效 (保留帥氣度，移除遊戲)
// ==========================================
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

function hackEffect(element) {
    let iterations = 0;
    const originalText = element.dataset.value || element.innerText; 
    if(!element.dataset.value) element.dataset.value = originalText;

    const interval = setInterval(() => {
        element.innerText = originalText.split("")
            .map((letter, index) => {
                if(index < iterations) return originalText[index];
                return letters[Math.floor(Math.random() * 43)];
            })
            .join("");
        
        if(iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 2; 
    }, 30);
}

function initMagnetic() {
    if (window.innerWidth < 768) return; 
    const magnets = document.querySelectorAll('.team-title');
    magnets.forEach(magnet => {
        magnet.classList.add('magnetic-target'); 
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            magnet.style.transform = `translate(${x * 0.05}px, ${y * 0.1}px)`;
        });
        magnet.addEventListener('mouseleave', () => { magnet.style.transform = 'translate(0px, 0px)'; });
    });
}

function initScrollEffects() {
    const progressBar = document.getElementById('progressBar');
    const titles = document.querySelectorAll('.team-title');
    const sections = document.querySelectorAll('.team-section');
    
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                hackEffect(entry.target); 
                titleObserver.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.5 });
    titles.forEach(title => titleObserver.observe(title));

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    sections.forEach(section => sectionObserver.observe(section));

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if(progressBar) progressBar.style.width = (winScroll / height) * 100 + "%";
    });
}

function updateSysMonitor() {
    const monitor = document.getElementById('sysMonitor');
    if (!monitor) return;
    const now = new Date();
    // 這裡保留裝飾性的 FPS 數據，讓介面看起來很厲害
    monitor.innerHTML = `
        SYS_TIME: ${now.toLocaleTimeString('en-US', { hour12: false })}<br>
        FPS: 60<br>
        PING: ${Math.floor(Math.random()*10+5)}ms<br>
        STATUS: STABLE
    `;
}
setInterval(updateSysMonitor, 1000);

function runBootSequence() {
    const textElement = document.getElementById('terminal-text');
    const bootScreen = document.getElementById('boot-screen');
    
    // 安全檢查：如果找不到開機畫面元素，就不執行，避免報錯
    if (!textElement || !bootScreen) return;

    const logs = [
        "INITIALIZING SYSTEM...", 
        "LOADING KERNEL MODULES...", 
        "CONNECTING TO MLB DATABASE...", 
        "VERIFYING CLUB CREDENTIALS [大陰帝國]...", 
        "ACCESS GRANTED.", 
        "SYSTEM ONLINE."
    ];
    let lineIndex = 0;
    
    function typeLine() {
        if (lineIndex < logs.length) {
            const line = document.createElement('div');
            line.textContent = `> ${logs[lineIndex]}`;
            textElement.appendChild(line);
            lineIndex++;
            setTimeout(typeLine, Math.random() * 100 + 50);
        } else {
            // 動畫結束，淡出黑幕
            setTimeout(() => {
                bootScreen.style.transition = "opacity 0.8s ease";
                bootScreen.style.opacity = "0";
                setTimeout(() => { 
                    bootScreen.style.display = "none"; 
                }, 800);
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
    
    // 安全檢查
    if(!cursorDot || !cursorOutline) return;

    cursorDot.style.opacity = 0; 
    cursorOutline.style.opacity = 0;

    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;
        
        cursorDot.style.opacity = 1; 
        cursorOutline.style.opacity = 1;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        
        cursorOutline.animate({ 
            left: `${posX}px`, 
            top: `${posY}px` 
        }, { duration: 100, fill: "forwards" });

        if(crossX && crossY) { 
            crossX.style.top = `${posY}px`; 
            crossY.style.left = `${posX}px`; 
        }
    });
}

// ==========================================
// 3. 核心功能：渲染與排名邏輯 (含 V22 能量條)
// ==========================================
function renderRow(container, player, rank) {
    const tr = document.createElement('tr'); 
    tr.style.animation = `fadeIn 0.5s ease forwards`;
    
    let displayRank = `#${rank}`;
    let displayScoreText = `PR: ${player.score}`;
    
    // --- 1. 計算能量條長度 (逆轉邏輯) ---
    // 假設最爛的分數大約是 60000
    const MAX_REFERENCE_SCORE = 60000; 
    let rawScore = parseInt(player.score);
    if (isNaN(rawScore)) rawScore = MAX_REFERENCE_SCORE; 

    // 公式：分數越低，百分比越高。限制最少顯示 5%
    let percent = Math.max(5, (1 - (rawScore / MAX_REFERENCE_SCORE)) * 100);
    
    // --- 2. 動態顏色判定 ---
    let barColor = 'linear-gradient(90deg, #0066ff, #00f3ff)'; // 預設青色
    if (percent > 80) barColor = 'linear-gradient(90deg, #ffaa00, #ffd700)'; // 金色
    else if (percent < 30) barColor = 'linear-gradient(90deg, #880000, #ff2a2a)'; // 紅色

    // --- 3. 處理特殊身份與圖示 ---
    let icon = '⚾'; // 預設棒球
    
    if (player.isLeader) { 
        tr.classList.add('row-leader'); 
        displayRank = '#1'; 
        displayScoreText = '👑 大陰團長'; 
        icon = '🏆'; 
        percent = 100;
        barColor = 'linear-gradient(90deg, #ffaa00, #ffd700)';
    } 
    else if (player.isNPC) { 
        tr.classList.add('row-npc'); 
        displayScoreText = '⚡ 強力NPC'; 
        icon = '🤖'; 
        percent = 95; 
    } 
    else {
        let tagsHtml = '';
        if (player.isDemoted) { 
            tr.classList.add('row-demoted'); 
            tagsHtml += `<span class="demoted-tag">自願降團</span>`;
            icon = '📉';
        }
        if (player.isNew) {
            tagsHtml += `<span class="new-tag">新血</span>`;
            icon = '🌱';
        }
        displayScoreText += tagsHtml;
    }

    // --- 4. 生成 HTML ---
    tr.innerHTML = `
        <td class="rank">${displayRank}</td>
        <td class="hacker-text name" data-value="${player.name}">
            <span class="baseball-icon" style="margin-right:8px; font-size:0.9em; filter: drop-shadow(0 0 2px var(--neon-cyan));">${icon}</span>${player.name}
        </td>
        <td class="score">
            <div class="power-bar-wrapper" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
                <div style="margin-bottom:2px;">${displayScoreText}</div>
                <div class="power-bar-container" style="width: 120px; height: 6px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); position: relative; overflow: hidden; clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%);">
                    <div class="power-bar-fill" style="width: ${percent}%; background: ${barColor}; height: 100%; box-shadow: 0 0 8px var(--neon-cyan);"></div>
                </div>
            </div>
        </td>
    `;
    
    const nameCell = tr.querySelector('.hacker-text');
    if(nameCell) nameCell.addEventListener('mouseover', () => hackEffect(nameCell));
    container.appendChild(tr);
}

async function loadRankings() {
    runBootSequence(); 

    try {
        const response = await fetch(CSV_FILE_PATH);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n').slice(1);

        let waitingList = [], demotedList = [], leaderData = null;     

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length < 3) return;
            const name = columns[1].trim();
            const score = columns[2].trim();
            const note = columns[3] ? columns[3].trim() : ""; 
            
            const playerData = { 
                name: name, score: score, 
                isLeader: false, isNPC: false, isDemoted: false, isNew: false 
            };

            if (name === '陰帝') { 
                leaderData = playerData; leaderData.isLeader = true; 
            } 
            else {
                if (note.includes('自願降團')) playerData.isDemoted = true;
                if (note.includes('新血')) playerData.isNew = true;

                if (playerData.isDemoted) { demotedList.push(playerData); } 
                else { waitingList.push(playerData); }
            }
        });
        
        let globalRankCounter = 1; 
        for (let teamNum = 1; teamNum <= 5; teamNum++) {
            const config = TEAM_CONFIG[teamNum];
            const tableBody = document.getElementById(config.id);
            if (!tableBody) continue;
            
            const section = tableBody.closest('.team-section');
            if (section) section.classList.add(config.theme);

            tableBody.innerHTML = ''; 

            let currentTeamCount = 0; 
            const MAX_PER_TEAM = 20;  

            // A. 團長
            if (teamNum === 1 && leaderData) {
                renderRow(tableBody, leaderData, globalRankCounter);
                currentTeamCount++; globalRankCounter++;
            }
            // B. NPC
            const npcs = NPC_LIST[teamNum] || [];
            npcs.forEach(npcName => {
                if (teamNum === 5 || currentTeamCount < MAX_PER_TEAM) {
                    renderRow(tableBody, { name: npcName, score: "強力NPC", isLeader: false, isNPC: true }, globalRankCounter);
                    currentTeamCount++; globalRankCounter++;
                }
            });
            // C. 自願降團
            if (teamNum === 5) {
                while (demotedList.length > 0) {
                    renderRow(tableBody, demotedList.shift(), globalRankCounter);
                    currentTeamCount++; globalRankCounter++;
                }
            }
            // D. 排隊名單
            while (waitingList.length > 0 && (teamNum === 5 || currentTeamCount < MAX_PER_TEAM)) {
                renderRow(tableBody, waitingList.shift(), globalRankCounter);
                currentTeamCount++; globalRankCounter++;
            }
        }

        initCursor();
        updateSysMonitor();
        setTimeout(() => { initScrollEffects(); initMagnetic(); }, 100);

        const today = new Date();
        const dateEl = document.getElementById('update-date');
        if(dateEl) dateEl.textContent = `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    } catch (error) {
        console.error('讀取數據失敗:', error);
        const bootScreen = document.getElementById('boot-screen');
        if(bootScreen) bootScreen.style.display = 'none';
    }
}

// 啟動主程式
loadRankings();