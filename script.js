// 設定檔案路徑
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
// 網站視覺特效
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
    if (!textElement || !bootScreen) return;

    const logs = [
        "INITIALIZING SYSTEM...", "LOADING KERNEL MODULES...", 
        "CONNECTING TO MLB DATABASE...", "VERIFYING CLUB CREDENTIALS [大陰帝國]...", 
        "ACCESS GRANTED.", "SYSTEM ONLINE."
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
        if(cursorOutline) { 
            cursorOutline.style.opacity = 1; 
            cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 100, fill: "forwards" }); 
        }
        if(crossX && crossY) { crossX.style.top = `${posY}px`; crossY.style.left = `${posX}px`; }
    });
}

// ==========================================
// 排名資料渲染
// ==========================================
function renderRow(container, player, rank) {
    const tr = document.createElement('tr');
    tr.style.animation = `fadeIn 0.5s ease forwards`;

    let displayRank = `#${rank}`;
    let displayScore = `(PR: ${player.score})`;
    
    if (player.isLeader) {
        tr.classList.add('row-leader');
        displayRank = '#1'; displayScore = '👑 大陰團長';
    } else if (player.isNPC) {
        tr.classList.add('row-npc');
        displayScore = '⚡ 強力NPC'; 
    } else if (player.isDemoted) {
        tr.classList.add('row-demoted');
        displayScore = `(PR: ${player.score}) <span class="demoted-tag">自願降團</span>`;
    }

    tr.innerHTML = `
        <td class="rank">${displayRank}</td>
        <td class="hacker-text name" data-value="${player.name}">${player.name}</td>
        <td class="score">${displayScore}</td>
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
            npcs.forEach(npcName => {
                if (teamNum === 5 || currentTeamCount < MAX_PER_TEAM) {
                    renderRow(tableBody, { name: npcName, score: "強力NPC", isLeader: false, isNPC: true }, globalRankCounter);
                    currentTeamCount++; globalRankCounter++;
                }
            });
            if (teamNum === 5) {
                while (demotedList.length > 0) { renderRow(tableBody, demotedList.shift(), globalRankCounter); currentTeamCount++; globalRankCounter++; }
            }
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

// ==========================================
// 🎮 遊戲引擎 V10.0 (戰爭模式)
// ==========================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-game-btn');
const stopBtn = document.getElementById('stop-game-btn');
const modalStartBtn = document.getElementById('modal-start-btn');
const scoreHud = document.getElementById('game-hud');
const hpBar = document.getElementById('hp-bar');
const shopUI = document.getElementById('shop-ui');
const integrityUI = document.getElementById('integrity-ui');
const gameModal = document.getElementById('game-start-modal');
const body = document.body;

let gameRunning = false;
let score = 0;
let maxHp = 100;
let currentHp = 100;
let clickDamage = 1; // 初始傷害
let enemies = [];
let particles = [];
let turrets = [];
let bullets = [];
let powerups = [];
let bossSpawned = false;
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

// --- 類別定義 ---

class Enemy {
    constructor(type = 'normal') {
        this.type = type;
        
        if (type === 'boss') {
            this.size = 80; this.hp = 150; this.maxHp = 150; this.speed = 0.5; this.color = '#ffd700'; this.scoreValue = 1000;
        } else if (type === 'tank') {
            this.size = 40; this.hp = 10; this.maxHp = 10; this.speed = 1; this.color = '#bc13fe'; this.scoreValue = 50;
        } else {
            this.size = 25; this.hp = 1; this.maxHp = 1; this.speed = isMobile ? 1.5 : 2.5; this.color = '#ff2a2a'; this.scoreValue = 10;
        }

        if (Math.random() > 0.5) {
            this.x = Math.random() > 0.5 ? -this.size : canvas.width + this.size;
            this.y = Math.random() * canvas.height;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() > 0.5 ? -this.size : canvas.height + this.size;
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(centerY - this.y, centerX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update() {
        this.x += this.vx; this.y += this.vy;
        const distToCenter = Math.hypot(this.x - canvas.width/2, this.y - canvas.height/2);
        if (distToCenter < 50) {
            this.hp = 0; takeDamage(this.type === 'boss' ? 50 : 10);
        }
    }

    draw() {
        ctx.strokeStyle = this.color; ctx.lineWidth = this.type === 'boss' ? 4 : 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.fillStyle = this.color; ctx.globalAlpha = 0.2;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.globalAlpha = 1.0;
        if (this.maxHp > 1) {
            const hpPercent = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = 'red'; ctx.fillRect(this.x - this.size/2, this.y - this.size/2 - 10, this.size, 4);
            ctx.fillStyle = '#00ff00'; ctx.fillRect(this.x - this.size/2, this.y - this.size/2 - 10, this.size * hpPercent, 4);
        }
    }
}

class Turret {
    constructor(angleOffset) {
        this.angle = angleOffset; this.distance = 80; this.color = '#00f3ff'; this.cooldown = 0; this.fireRate = 30;
    }
    update() {
        this.angle += 0.02; 
        this.x = canvas.width / 2 + Math.cos(this.angle) * this.distance;
        this.y = canvas.height / 2 + Math.sin(this.angle) * this.distance;
        if (this.cooldown <= 0) {
            let target = null, minDist = 9999;
            enemies.forEach(e => {
                const dist = Math.hypot(e.x - this.x, e.y - this.y);
                if (dist < 400 && dist < minDist) { minDist = dist; target = e; }
            });
            if (target) { bullets.push(new Bullet(this.x, this.y, target)); this.cooldown = this.fireRate; }
        } else { this.cooldown--; }
    }
    draw() {
        ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)'; ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, this.distance, 0, Math.PI*2); ctx.stroke();
    }
}

class Bullet {
    constructor(x, y, target) {
        this.x = x; this.y = y; this.speed = 10; this.target = target; this.active = true;
        const angle = Math.atan2(target.y - y, target.x - x);
        this.vx = Math.cos(angle) * this.speed; this.vy = Math.sin(angle) * this.speed;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (Math.hypot(this.x - this.target.x, this.y - this.target.y) < this.target.size) {
            this.target.hp -= 2; this.active = false; createParticles(this.x, this.y, '#00f3ff', 3);
        }
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.active = false;
    }
    draw() { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI*2); ctx.fill(); }
}

function createParticles(x, y, color, count = 10) {
    for(let i=0; i<count; i++) {
        particles.push({
            x: x, y: y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
            life: 1.0, color: color, size: Math.random() * 3 + 1
        });
    }
}

function takeDamage(amount) {
    currentHp -= amount;
    hpBar.style.width = `${Math.max(0, (currentHp / maxHp) * 100)}%`;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; ctx.fillRect(0, 0, canvas.width, canvas.height); // 受傷紅閃
    if (currentHp <= 0) gameOver();
}

function gameOver() {
    stopGame();
    alert(`系統崩潰！你的最終得分: ${score}\n請重新修復系統。`);
}

// ⚠️ 調整過的生成邏輯 (高強度)
function spawnLogic() {
    if (!gameRunning) return;
    
    // 基礎生成率：50% + 分數加成
    let spawnChance = 0.5 + (score / 5000);
    
    if (Math.random() < spawnChance) {
        // 分數越高，一次可能生多隻
        let count = 1;
        if(score > 1000) count = 2;
        if(score > 3000) count = 3;
        
        for(let i=0; i<count; i++) {
            enemies.push(new Enemy(Math.random() > 0.8 ? 'tank' : 'normal'));
        }
        
        // 生成提示特效 (畫面邊緣紅光)
        canvas.style.boxShadow = "inset 0 0 20px rgba(255,0,0,0.5)";
        setTimeout(() => canvas.style.boxShadow = "none", 200);
    }

    // BOSS 生成
    if (score > 500 && score % 2000 < 100 && !bossSpawned && enemies.length < 10) {
        enemies.push(new Enemy('boss')); bossSpawned = true;
        showGameMsg("⚠️ WARNING: BOSS DETECTED", canvas.width/2, canvas.height/2, '#ff0000');
    }
    if (score % 2000 > 200) bossSpawned = false;
}

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 核心
    ctx.strokeStyle = '#00f3ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, 20, 0, Math.PI*2); ctx.stroke();
    ctx.font = "10px Arial"; ctx.fillStyle = "#00f3ff"; ctx.fillText("CORE", canvas.width/2 - 15, canvas.height/2 + 4);

    turrets.forEach(t => { t.update(); t.draw(); });
    bullets.forEach((b, i) => { b.update(); b.draw(); if (!b.active) bullets.splice(i, 1); });
    enemies.forEach((e, i) => {
        e.update(); e.draw();
        if (e.hp <= 0) {
            score += e.scoreValue; scoreHud.innerText = `SCORE: ${score}`;
            createParticles(e.x, e.y, e.color, 15); enemies.splice(i, 1);
        }
    });
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        if (p.life <= 0) particles.splice(i, 1);
        else { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); ctx.globalAlpha = 1.0; }
    });
    animationFrameId = requestAnimationFrame(gameLoop);
}

function handleInput(x, y) {
    if (!gameRunning) return;
    createParticles(x, y, '#ffffff', 5);
    // 增大判定範圍
    const hitRadius = isMobile ? 120 : 60;
    
    enemies.forEach(e => {
        const dist = Math.hypot(e.x - x, e.y - y);
        if (dist < hitRadius + e.size) {
            e.hp -= clickDamage;
            // 擊退效果
            e.x -= e.vx * 10;
            e.y -= e.vy * 10;
            
            // 擊中特效
            createParticles(e.x, e.y, '#fff', 2);
        }
    });
}

// 商店函式
window.buyItem = function(type) {
    if (!gameRunning) return;
    let cost = 0;
    if (type === 'damage') cost = 500;
    if (type === 'turret') cost = 2000;
    if (type === 'repair') cost = 1000;

    if (score >= cost) {
        score -= cost; scoreHud.innerText = `SCORE: ${score}`;
        if (type === 'damage') { clickDamage += 2; showGameMsg("火力升級! DMG UP", canvas.width/2, canvas.height/2, '#00f3ff'); }
        else if (type === 'turret') { turrets.push(new Turret(turrets.length * (Math.PI * 2 / 5))); showGameMsg("砲塔部屬! TURRET", canvas.width/2, canvas.height/2, '#00f3ff'); }
        else if (type === 'repair') { currentHp = Math.min(currentHp + 30, maxHp); hpBar.style.width = `${(currentHp / maxHp) * 100}%`; showGameMsg("系統修復! REPAIR", canvas.width/2, canvas.height/2, '#00ff00'); }
    } else { showGameMsg("積分不足!", canvas.width/2, canvas.height/2, '#ff0000'); }
};

function showGameMsg(text, x, y, color) {
    const msg = document.createElement('div');
    msg.className = 'game-msg';
    msg.innerText = text; msg.style.left = x + 'px'; msg.style.top = y + 'px'; msg.style.color = color;
    document.body.appendChild(msg); setTimeout(() => msg.remove(), 1000);
}

canvas.addEventListener('mousedown', (e) => handleInput(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) { handleInput(e.touches[i].clientX, e.touches[i].clientY); }
}, {passive: false});

function initGame() { gameModal.style.display = 'flex'; body.classList.add('game-active'); }
function startGame() {
    gameModal.style.display = 'none'; canvas.style.display = 'block'; shopUI.style.display = 'flex';
    integrityUI.style.display = 'block'; startBtn.style.display = 'none'; stopBtn.style.display = 'block'; scoreHud.style.display = 'block';
    
    // 初始化遊戲數據
    gameRunning = true; score = 0; scoreHud.innerText = "SCORE: 0"; currentHp = 100; hpBar.style.width = '100%';
    clickDamage = 5; enemies = []; turrets = []; bullets = []; particles = [];
    
    // 開局送怪
    for(let i=0; i<5; i++) enemies.push(new Enemy());
    
    // 加快生成頻率 (600ms)
    spawnInterval = setInterval(spawnLogic, 600);
    gameLoop();
}
function stopGame() {
    gameRunning = false; cancelAnimationFrame(animationFrameId); clearInterval(spawnInterval);
    canvas.style.display = 'none'; shopUI.style.display = 'none'; integrityUI.style.display = 'none'; gameModal.style.display = 'none';
    startBtn.style.display = 'block'; stopBtn.style.display = 'none'; scoreHud.style.display = 'none';
    body.classList.remove('game-active');
}

if(startBtn) startBtn.addEventListener('click', initGame);
if(modalStartBtn) modalStartBtn.addEventListener('click', startGame);
if(stopBtn) stopBtn.addEventListener('click', stopGame);

loadRankings();