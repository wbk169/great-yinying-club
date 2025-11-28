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
// 🚀 特效與渲染邏輯 (保持不變，略過以節省篇幅，請保留原有的 loadRankings 等代碼)
// ==========================================
// ... (這裡請貼上 V6.0 關於 loadRankings, renderRow, hackEffect 等所有程式碼) ...
// ⚠️ 為了確保完整性，我下面會直接提供包含遊戲邏輯的完整代碼

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
function hackEffect(element) {
    let iterations = 0;
    const originalText = element.dataset.value || element.innerText; 
    if(!element.dataset.value) element.dataset.value = originalText;
    const interval = setInterval(() => {
        element.innerText = originalText.split("").map((letter, index) => {
            if(index < iterations) return originalText[index];
            return letters[Math.floor(Math.random() * 43)];
        }).join("");
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
            if (entry.isIntersecting) { hackEffect(entry.target); titleObserver.unobserve(entry.target); }
        });
    }, { threshold: 0.5 });
    titles.forEach(title => titleObserver.observe(title));
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('reveal-active'); sectionObserver.unobserve(entry.target); }
        });
    }, { threshold: 0.1 });
    sections.forEach(section => sectionObserver.observe(section));
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if(progressBar) progressBar.style.width = scrolled + "%";
    });
}

function updateSysMonitor() {
    const monitor = document.getElementById('sysMonitor');
    if (!monitor) return;
    const fps = Math.floor(Math.random() * (60 - 55 + 1)) + 55; 
    const ping = Math.floor(Math.random() * (30 - 10 + 1)) + 10; 
    const mem = Math.floor(Math.random() * (45 - 30 + 1)) + 30; 
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    monitor.innerHTML = `SYS_TIME: ${timeStr}<br>FPS: ${fps}<br>PING: ${ping}ms<br>MEM: ${mem}%<br>STATUS: ONLINE`;
}
setInterval(updateSysMonitor, 1000);

function runBootSequence() {
    const textElement = document.getElementById('terminal-text');
    const bootScreen = document.getElementById('boot-screen');
    const logs = ["INITIALIZING SYSTEM...", "LOADING KERNEL MODULES...", "CONNECTING TO MLB DATABASE...", "VERIFYING CLUB CREDENTIALS [大陰帝國]...", "ACCESS GRANTED.", "SYSTEM ONLINE."];
    let lineIndex = 0;
    function typeLine() {
        if (lineIndex < logs.length) {
            const line = document.createElement('div');
            line.textContent = `> ${logs[lineIndex]}`;
            textElement.appendChild(line);
            lineIndex++;
            setTimeout(typeLine, Math.random() * 150 + 50);
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
    if(cursorDot) cursorDot.style.opacity = 0; 
    if(cursorOutline) cursorOutline.style.opacity = 0;
    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;
        if(cursorDot) { cursorDot.style.opacity = 1; cursorDot.style.left = `${posX}px`; cursorDot.style.top = `${posY}px`; }
        if(cursorOutline) { cursorOutline.style.opacity = 1; cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 100, fill: "forwards" }); }
        if(crossX && crossY) { crossX.style.top = `${posY}px`; crossY.style.left = `${posX}px`; }
    });
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
            const playerData = { name: name, score: score, isLeader: false, isNPC: false, isDemoted: false };
            if (name === '陰帝') { leaderData = playerData; leaderData.isLeader = true; } 
            else if (note.includes('自願降團')) { playerData.isDemoted = true; demotedList.push(playerData); } 
            else { waitingList.push(playerData); }
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
            if (teamNum === 1 && leaderData) { renderRow(tableBody, leaderData, globalRankCounter); currentTeamCount++; globalRankCounter++; }
            const npcs = NPC_LIST[teamNum] || [];
            npcs.forEach(npcName => { if (teamNum === 5 || currentTeamCount < MAX_PER_TEAM) { renderRow(tableBody, { name: npcName, score: "強力NPC", isLeader: false, isNPC: true }, globalRankCounter); currentTeamCount++; globalRankCounter++; }});
            if (teamNum === 5) { while (demotedList.length > 0) { renderRow(tableBody, demotedList.shift(), globalRankCounter); currentTeamCount++; globalRankCounter++; } }
            while (waitingList.length > 0 && (teamNum === 5 || currentTeamCount < MAX_PER_TEAM)) { renderRow(tableBody, waitingList.shift(), globalRankCounter); currentTeamCount++; globalRankCounter++; }
        }
        initCursor();
        updateSysMonitor();
        setTimeout(() => { initScrollEffects(); initMagnetic(); }, 100);
        const today = new Date();
        const dateEl = document.getElementById('update-date');
        if(dateEl) dateEl.textContent = `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    } catch (error) {
        console.error('讀取數據失敗:', error);
        document.getElementById('boot-screen').style.display = 'none';
    }
}

function renderRow(container, player, rank) {
    const tr = document.createElement('tr');
    tr.style.animation = `fadeIn 0.5s ease forwards`;
    let displayRank = `#${rank}`;
    let displayScore = `(PR: ${player.score})`;
    if (player.isLeader) { tr.classList.add('row-leader'); displayRank = '#1'; displayScore = '👑 大陰團長'; } 
    else if (player.isNPC) { tr.classList.add('row-npc'); displayScore = '⚡ 強力NPC'; } 
    else if (player.isDemoted) { tr.classList.add('row-demoted'); displayScore = `(PR: ${player.score}) <span class="demoted-tag">自願降團</span>`; }
    tr.innerHTML = `<td class="rank">${displayRank}</td><td class="hacker-text name" data-value="${player.name}">${player.name}</td><td class="score">${displayScore}</td>`;
    const nameCell = tr.querySelector('.hacker-text');
    if(nameCell) nameCell.addEventListener('mouseover', () => hackEffect(nameCell));
    container.appendChild(tr);
}

loadRankings();

// ==========================================
// 🎮 系統防禦小遊戲 (升級版 V2)
// ==========================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-game-btn');
const stopBtn = document.getElementById('stop-game-btn');
const scoreHud = document.getElementById('game-hud');
const body = document.body;

let gameRunning = false;
let score = 0;
let enemies = [];
let particles = [];
let powerups = [];
let weaponLevel = 1; // 1: 單發, 2: 雙發, 3: 散射
let animationFrameId;
let spawnInterval;
let isMobile = window.innerWidth < 768;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    isMobile = window.innerWidth < 768;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 1. 敵人
class Enemy {
    constructor() {
        this.size = Math.random() * 20 + 20; 
        this.x = Math.random() * (canvas.width - this.size);
        this.y = Math.random() * (canvas.height - this.size);
        this.vx = (Math.random() - 0.5) * (isMobile ? 1.5 : 3); // 手機版慢一點
        this.vy = (Math.random() - 0.5) * (isMobile ? 1.5 : 3);
        this.color = '#ff2a2a'; 
        this.glitchTimer = 0;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width - this.size) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height - this.size) this.vy *= -1;
        this.glitchTimer++;
        if (this.glitchTimer > 60) { this.x += (Math.random() - 0.5) * 10; this.glitchTimer = 0; }
    }
    draw() {
        ctx.strokeStyle = this.color; ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = `rgba(255, 42, 42, 0.3)`; ctx.fillRect(this.x + 5, this.y + 5, this.size - 10, this.size - 10);
    }
}

// 2. 道具 (PowerUp)
class PowerUp {
    constructor() {
        this.size = 25;
        this.x = Math.random() * (canvas.width - this.size);
        this.y = Math.random() * (canvas.height - this.size);
        this.type = Math.random() > 0.5 ? 'weapon' : 'bomb'; // 隨機類型
        this.color = this.type === 'weapon' ? '#00f3ff' : '#00ff7f';
        this.life = 300; // 5秒後消失
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.font = "12px Arial"; ctx.textAlign = "center";
        ctx.fillText(this.type === 'weapon' ? "UP" : "BOMB", this.x + this.size/2, this.y + 17);
    }
}

// 3. 粒子
class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.size = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= 0.05; }
    draw() { ctx.globalAlpha = this.life; ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, this.size, this.size); ctx.globalAlpha = 1.0; }
}

// 浮動文字
function showGameMsg(text, x, y, color) {
    const msg = document.createElement('div');
    msg.className = 'game-msg';
    msg.innerText = text;
    msg.style.left = x + 'px';
    msg.style.top = y + 'px';
    msg.style.color = color;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 1000);
}

function spawnEnemy() {
    if (!gameRunning) return;
    if (enemies.length < (isMobile ? 10 : 20)) enemies.push(new Enemy());
    // 隨機生成道具 (5% 機率)
    if (Math.random() < 0.05 && powerups.length < 2) powerups.push(new PowerUp());
}

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    enemies.forEach((e) => { e.update(); e.draw(); });
    
    powerups.forEach((p, i) => {
        p.life--;
        p.draw();
        if(p.life <= 0) powerups.splice(i, 1);
    });

    particles.forEach((p, i) => { p.update(); p.draw(); if (p.life <= 0) particles.splice(i, 1); });

    animationFrameId = requestAnimationFrame(gameLoop);
}

function handleInput(x, y) {
    if (!gameRunning) return;
    
    // 手機版：範圍爆炸 (半徑 100)
    // 電腦版：精準射擊 (半徑 30，升級後變大)
    const hitRadius = isMobile ? 100 : (30 * weaponLevel);
    
    // 檢查道具
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        const dist = Math.hypot(p.x - x, p.y - y);
        if (dist < hitRadius + 20) {
            if (p.type === 'weapon') {
                weaponLevel = Math.min(weaponLevel + 1, 3);
                showGameMsg("WEAPON UPGRADED!", x, y, '#00f3ff');
            } else {
                // Bomb: 清除所有敵人
                score += enemies.length * 100;
                enemies = [];
                showGameMsg("EMP ACTIVATED!", x, y, '#00ff7f');
                // 全屏閃光
                ctx.fillStyle = 'white'; ctx.fillRect(0,0,canvas.width, canvas.height);
            }
            powerups.splice(i, 1);
            return; // 吃到道具就不算射擊
        }
    }

    // 檢查敵人
    let hitCount = 0;
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        // 簡單的圓形碰撞
        const dist = Math.hypot(enemy.x + enemy.size/2 - x, enemy.y + enemy.size/2 - y);
        
        if (dist < hitRadius) {
            score += 100;
            scoreHud.innerText = `SCORE: ${score}`;
            for(let j=0; j<10; j++) particles.push(new Particle(enemy.x, enemy.y, enemy.color));
            enemies.splice(i, 1);
            hitCount++;
            if (!isMobile && weaponLevel === 1) break; // 1等武器只能打一隻
        }
    }

    // 點擊特效
    ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, hitRadius, 0, Math.PI*2); ctx.stroke();
    
    if (hitCount > 1) showGameMsg(`COMBO x${hitCount}!`, x, y, '#ffd700');
}

// 事件監聽
canvas.addEventListener('mousedown', (e) => handleInput(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 防止滑動
    for (let i = 0; i < e.touches.length; i++) {
        handleInput(e.touches[i].clientX, e.touches[i].clientY);
    }
}, {passive: false});

function startGame() {
    gameRunning = true; score = 0; weaponLevel = 1;
    enemies = []; particles = []; powerups = [];
    scoreHud.innerText = "SCORE: 0";
    canvas.style.display = 'block';
    startBtn.style.display = 'none'; stopBtn.style.display = 'block'; scoreHud.style.display = 'block';
    body.classList.add('game-active');
    spawnInterval = setInterval(spawnEnemy, 800);
    gameLoop();
}

function stopGame() {
    gameRunning = false; cancelAnimationFrame(animationFrameId); clearInterval(spawnInterval);
    canvas.style.display = 'none';
    startBtn.style.display = 'block'; stopBtn.style.display = 'none'; scoreHud.style.display = 'none';
    body.classList.remove('game-active');
}

startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);