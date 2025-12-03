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

// 🌟 V29.0 升級：粒子速度可變
let particleSpeedMultiplier = 1;
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [], mouse = { x: -1000, y: -1000 };
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; createParticles(); }
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    function createParticles() {
        particles = [];
        const count = window.innerWidth < 768 ? 50 : 100;
        for(let i=0; i<count; i++) {
            particles.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5, size: Math.random()*2+1, color: Math.random()>0.5?'#00f3ff':'#bc13fe' });
        }
    }
    function animate() {
        if(document.body.classList.contains('simple-mode')) return; 
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            // 🌟 粒子速度隨捲動位置變化
            p.x += p.vx * particleSpeedMultiplier;
            p.y += p.vy * particleSpeedMultiplier;
            if(p.x<0||p.x>width) p.vx*=-1; if(p.y<0||p.y>height) p.vy*=-1;
            const dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.sqrt(dx*dx + dy*dy), forceRadius = 150;
            if (dist < forceRadius) { const angle = Math.atan2(dy, dx), force = (forceRadius - dist) / forceRadius, pushX = Math.cos(angle)*force*5, pushY = Math.sin(angle)*force*5; p.x-=pushX; p.y-=pushY; }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fillStyle=p.color; ctx.globalAlpha=0.6; ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    resize(); animate();
}

function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('.ranking-table tbody tr');
        rows.forEach(row => {
            const nameCell = row.querySelector('.name');
            const name = nameCell ? nameCell.dataset.value.toLowerCase() : '';
            if (name.includes(term)) { row.style.display = ''; row.style.opacity = '1'; if(term.length>0) row.style.background='rgba(0, 243, 255, 0.2)'; else row.style.background=''; } 
            else { row.style.display = 'none'; row.style.opacity = '0'; }
        });
    });
}

function createClickRipple(e) {
    if(document.body.classList.contains('simple-mode')) return;
    const ripple = document.createElement('div'); ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`; ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple); setTimeout(() => ripple.remove(), 500);
}
window.addEventListener('mousedown', createClickRipple);

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

// 🌟 V29.0 戰術導航與滾動特效
function initScrollEffects() {
    const progressBar = document.getElementById('progressBar');
    const titles = document.querySelectorAll('.team-title');
    const sections = document.querySelectorAll('.team-section');
    
    // 標題解碼
    const titleObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { hackEffect(entry.target); titleObserver.unobserve(entry.target); } }); }, { threshold: 0.5 });
    titles.forEach(title => titleObserver.observe(title));

    // 區塊進場
    const sectionObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('reveal-active'); sectionObserver.unobserve(entry.target); } }); }, { threshold: 0.1 });
    sections.forEach(section => sectionObserver.observe(section));

    // 導航點擊事件
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const section = document.getElementById(targetId);
            if(section) {
                // 平滑捲動
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // 閃光特效
                section.classList.add('flash-active');
                setTimeout(() => section.classList.remove('flash-active'), 800);
            }
        });
    });

    // 滾動監聽
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if(progressBar) progressBar.style.width = (winScroll / height) * 100 + "%";
        
        // 粒子加速：接近頂部時加速
        if (winScroll < 500) particleSpeedMultiplier = 3;
        else particleSpeedMultiplier = 1;
    });
}

function updateSysMonitor() {
    const monitor = document.getElementById('sysMonitor'); if (!monitor) return;
    const now = new Date();
    monitor.innerHTML = `SYS_TIME: ${now.toLocaleTimeString('en-US', { hour12: false })}<br>FPS: 60<br>PING: ${Math.floor(Math.random()*10+5)}ms<br>STATUS: STABLE`;
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
            const line = document.createElement('div'); line.textContent = `> ${logs[lineIndex]}`;
            textElement.appendChild(line); lineIndex++; setTimeout(typeLine, Math.random() * 100 + 50);
        } else {
            setTimeout(() => { bootScreen.style.transition = "opacity 0.8s ease"; bootScreen.style.opacity = "0"; setTimeout(() => { bootScreen.style.display = "none"; }, 800); }, 500);
        }
    }
    typeLine();
}
function initCursor() {
    if (window.innerWidth < 768) return;
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    if(!cursorDot || !cursorOutline) return;
    cursorDot.style.opacity = 0; cursorOutline.style.opacity = 0;
    window.addEventListener("mousemove", function (e) {
        if(cursorDot) { cursorDot.style.opacity = 1; cursorDot.style.left = `${e.clientX}px`; cursorDot.style.top = `${e.clientY}px`; }
        if(cursorOutline) { cursorOutline.style.opacity = 1; cursorOutline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 100, fill: "forwards" }); }
    });
}

window.toggleSimpleMode = function() {
    document.body.classList.toggle('simple-mode');
    const btn = document.querySelector('.mode-switch');
    if(document.body.classList.contains('simple-mode')) {
        btn.innerText = "[NORMAL MODE]";
    } else {
        btn.innerText = "[SIMPLE MODE]";
        initParticles(); 
    }
};

// 🌟 V29.0 核心：瀑布式掃描與渲染
let globalRowIndex = 0; // 全局索引，用於計算延遲

function renderRow(container, player, rank) {
    const tr = document.createElement('tr'); 
    
    // 🌟 設定延遲動畫：每行延遲 0.03s，產生掃描效果
    tr.style.animation = `fadeIn 0.5s ease forwards`;
    tr.style.animationDelay = `${globalRowIndex * 0.03}s`;
    globalRowIndex++;

    let displayRank = `#${rank}`, displayScoreText = `PR: ${player.score}`;
    let rawScore = parseInt(player.score); if (isNaN(rawScore)) rawScore = 60000; 
    let percent = 5, barClass = 'bar-normal';
    if (rawScore < 500) { percent = 98 + Math.random() * 2; barClass = 'bar-god'; } 
    else if (rawScore < 2000) { percent = 85 + (1 - rawScore/2000) * 10; barClass = 'bar-legend'; } 
    else if (rawScore < 8000) { percent = 65 + (1 - rawScore/8000) * 15; barClass = 'bar-master'; } 
    else if (rawScore < 20000) { percent = 40 + (1 - rawScore/20000) * 20; barClass = 'bar-diamond'; } 
    else { percent = Math.max(5, (1 - rawScore/60000) * 40); if (percent < 15) barClass = 'bar-weak'; }
    
    let icon = '⚾'; 
    if (player.isLeader) { tr.classList.add('row-leader'); displayRank = '#1'; displayScoreText = '👑 大陰團長'; icon = '🏆'; percent = 100; barClass = 'bar-god'; } 
    else if (player.isNPC) { tr.classList.add('row-npc'); displayScoreText = '⚡ 強力NPC'; icon = '🤖'; percent = 95; barClass = 'bar-legend'; } 
    else {
        let tagsHtml = '';
        if (player.isDemoted) { tr.classList.add('row-demoted'); tagsHtml += `<span class="demoted-tag">自願降團</span>`; icon = '📉'; }
        if (player.isNew) { tagsHtml += `<span class="new-tag">新血</span>`; icon = '🌱'; }
        displayScoreText += tagsHtml;
    }
    tr.innerHTML = `<td class="rank">${displayRank}</td><td class="hacker-text name" data-value="${player.name}"><span class="baseball-icon">${icon}</span>${player.name}</td><td class="score"><div class="power-bar-wrapper"><div style="margin-bottom:2px;">${displayScoreText}</div><div class="power-bar-container"><div class="power-bar-fill ${barClass}" style="width: ${percent}%;"></div></div></div></td>`;
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
            const name = columns[1].trim(), score = columns[2].trim(), note = columns[3] ? columns[3].trim() : ""; 
            const playerData = { name: name, score: score, isLeader: false, isNPC: false, isDemoted: false, isNew: false };
            if (name === '陰帝') { leaderData = playerData; leaderData.isLeader = true; } 
            else {
                if (note.includes('自願降團')) playerData.isDemoted = true;
                if (note.includes('新血')) playerData.isNew = true;
                if (playerData.isDemoted) { demotedList.push(playerData); } else { waitingList.push(playerData); }
            }
        });
        
        let globalRankCounter = 1; // 重置排名
        globalRowIndex = 0; // 重置動畫延遲

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
        // 初始化所有特效
        initCursor(); updateSysMonitor(); initParticles(); initSearch();
        setTimeout(() => { initScrollEffects(); initMagnetic(); }, 100);
        const today = new Date(); const dateEl = document.getElementById('update-date');
        if(dateEl) dateEl.textContent = `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    } catch (error) { console.error('讀取數據失敗:', error); if(document.getElementById('boot-screen')) document.getElementById('boot-screen').style.display = 'none'; }
}

loadRankings();