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
function renderRow(container, player, rank) {
    const tr = document.createElement('tr'); tr.style.animation = `fadeIn 0.5s ease forwards`;
    let displayRank = `#${rank}`, displayScore = `(PR: ${player.score})`;
    if (player.isLeader) { tr.classList.add('row-leader'); displayRank = '#1'; displayScore = '👑 大陰團長'; } 
    else if (player.isNPC) { tr.classList.add('row-npc'); displayScore = '⚡ 強力NPC'; } 
    else if (player.isDemoted) { tr.classList.add('row-demoted'); displayScore = `(PR: ${player.score}) <span class="demoted-tag">自願降團</span>`; }
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
            const name = columns[1].trim(), score = columns[2].trim(), note = columns[3] ? columns[3].trim() : ""; 
            const playerData = { name: name, score: score, isLeader: false, isNPC: false, isDemoted: false };
            if (name === '陰帝') { leaderData = playerData; leaderData.isLeader = true; } 
            else if (note.includes('自願降團')) { playerData.isDemoted = true; demotedList.push(playerData); } 
            else { waitingList.push(playerData); }
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

// 🎮 V18.1 Game Engine
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-game-btn');
const stopBtn = document.getElementById('stop-game-btn');
const shopBtn = document.getElementById('shop-btn');
const modalStartBtn = document.getElementById('modal-start-btn');
const scoreHud = document.getElementById('game-hud');
const hpBar = document.getElementById('hp-bar');
const shopModal = document.getElementById('shop-modal');
const integrityUI = document.getElementById('integrity-ui');
const gameModal = document.getElementById('game-start-modal');
const body = document.body;

let gameRunning = false, gamePaused = false;
let score = 0, gold = 0;
let maxHp = 100, currentHp = 100;
let enemies = [], particles = [], bullets = [], turrets = [], missiles = [], lasers = [], lightnings = [];
let bossSpawned = false, animationFrameId, spawnInterval, autoWeaponInterval;
let isMobile = window.innerWidth < 768;
let shieldActive = false;
let shopItems = {
    damage: { baseCost: 100, level: 1, name: "火力" },
    blast:  { baseCost: 500, level: 1, name: "擴散" },
    drone:  { baseCost: 1000, level: 0, name: "無人機" },
    laser:  { baseCost: 2500, level: 0, name: "雷射" },
    missile:{ baseCost: 3000, level: 0, name: "導彈" },
    lightning:{ baseCost: 4000, level: 0, name: "閃電" },
    regen:  { baseCost: 3000, level: 0, name: "修復" }
};
let stats = { damage: 20, blastRadius: 50, regenRate: 0 }; // 預設傷害調整

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; isMobile = window.innerWidth < 768; if (isMobile && stats.blastRadius < 100) stats.blastRadius = 100; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const ENEMY_TYPES = [{ color: '#ff2a2a', hp: 10, speed: 2.5, size: 20, score: 10 }, { color: '#ff7f50', hp: 20, speed: 3.0, size: 22, score: 20 }, { color: '#bc13fe', hp: 100, speed: 1.0, size: 35, score: 50 }, { color: '#00ff00', hp: 50, speed: 2.0, size: 25, score: 30 }, { color: '#00f3ff', hp: 80, speed: 1.5, size: 30, score: 40 }, { color: '#ff00ff', hp: 150, speed: 1.2, size: 38, score: 60 }, { color: '#ffffff', hp: 250, speed: 0.8, size: 45, score: 100 }, { color: '#888888', hp: 30, speed: 4.0, size: 15, score: 25 }, { color: '#ffd700', hp: 2000, speed: 0.5, size: 80, score: 1000 }, { color: '#ff4757', hp: 5000, speed: 0.4, size: 100, score: 5000 }];

function updateHud() {
    scoreHud.innerHTML = `SCORE: ${score}<br><span class="gold-text">🪙: ${gold}</span>`;
}

class Enemy {
    constructor(forcedLevel = null) {
        let level;
        if (forcedLevel !== null) {
            level = forcedLevel;
        } else {
            let difficulty = 0;
            if(score > 500) difficulty = 2;
            if(score > 1500) difficulty = 4;
            if(score > 3000) difficulty = 6;
            if(score > 5000) difficulty = 8;
            level = Math.min(Math.floor(Math.random() * (difficulty + 1)), 9);
        }

        let type = ENEMY_TYPES[level];
        this.size = type.size; 
        this.maxHp = type.hp * (1 + (score/5000) * 0.5); 
        this.hp = this.maxHp;
        this.speed = isMobile ? type.speed * 0.7 : type.speed; 
        this.color = type.color; 
        this.scoreValue = type.score;
        
        if (Math.random() > 0.5) { this.x = Math.random() > 0.5 ? -this.size : canvas.width + this.size; this.y = Math.random() * canvas.height; } 
        else { this.x = Math.random() * canvas.width; this.y = Math.random() > 0.5 ? -this.size : canvas.height + this.size; }
        const angle = Math.atan2(canvas.height/2 - this.y, canvas.width/2 - this.x);
        this.vx = Math.cos(angle) * this.speed; this.vy = Math.sin(angle) * this.speed;
    }
    update() { this.x += this.vx; this.y += this.vy; if (Math.hypot(this.x - canvas.width/2, this.y - canvas.height/2) < 50) { this.hp = 0; takeDamage(10); } }
    draw() { ctx.strokeStyle = this.color; ctx.lineWidth = 2; ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size); ctx.fillStyle = this.color; ctx.globalAlpha = 0.2; ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size); ctx.globalAlpha = 1.0; }
}
class Turret {
    constructor(index) { this.index = index; this.distance = 100 + (index * 5); this.angle = 0; this.fireCooldown = 0; }
    update() {
        this.angle += 0.02 + (this.index%2===0?0:-0.01);
        this.x = canvas.width/2 + Math.cos(this.angle)*this.distance; this.y = canvas.height/2 + Math.sin(this.angle)*this.distance;
        if(this.fireCooldown <= 0) { let target = getNearestEnemy(this.x, this.y, 300); if(target) { bullets.push(new Bullet(this.x, this.y, target, 20)); this.fireCooldown = 30; } } else this.fireCooldown--;
    }
    draw() { ctx.fillStyle = '#00f3ff'; ctx.beginPath(); ctx.arc(this.x, this.y, 5, 0, Math.PI*2); ctx.fill(); }
}
class Missile {
    constructor() { this.x = canvas.width/2; this.y = canvas.height/2; this.speed = 4; this.target = getNearestEnemy(this.x, this.y, 2000); this.life = 200; }
    update() {
        if(!this.target || this.target.hp <= 0) this.target = getNearestEnemy(this.x, this.y, 2000);
        if(this.target) {
            let angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.x += Math.cos(angle) * this.speed; this.y += Math.sin(angle) * this.speed;
            if(Math.hypot(this.x - this.target.x, this.y - this.target.y) < 30) { this.life = 0; createParticles(this.x, this.y, '#ffaa00', 10); this.target.hp -= 100; }
        } this.life--;
    }
    draw() { ctx.fillStyle = '#ffaa00'; ctx.beginPath(); ctx.arc(this.x, this.y, 4, 0, Math.PI*2); ctx.fill(); }
}
class Laser {
    constructor() { this.active = false; this.cooldown = 0; this.maxCooldown = 120; }
    update() {
        if(this.cooldown > 0) this.cooldown--; else {
            this.active = true; this.angle = Math.random() * Math.PI * 2; setTimeout(() => this.active = false, 200); this.cooldown = this.maxCooldown;
            enemies.forEach(e => { e.hp -= 50; createParticles(e.x, e.y, '#00ff00', 2); });
        }
    }
    draw() { if(this.active) { ctx.strokeStyle = '#00ff00'; ctx.lineWidth = 5; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(canvas.width/2, canvas.height/2); ctx.lineTo(canvas.width/2 + Math.cos(this.angle)*2000, canvas.height/2 + Math.sin(this.angle)*2000); ctx.stroke(); ctx.globalAlpha = 1; } }
}
class Lightning {
    constructor(startX, startY, targets) {
        this.startX = startX; this.startY = startY; this.targets = targets; this.life = 10;
    }
    update() { this.life--; }
    draw() {
        if (this.targets.length > 0) {
            ctx.strokeStyle = '#bc13fe'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(this.startX, this.startY);
            this.targets.forEach(e => ctx.lineTo(e.x, e.y)); ctx.stroke();
        }
    }
}
class Bullet {
    constructor(x, y, target, damage) { this.x = x; this.y = y; this.target = target; this.damage = damage; this.active = true; let angle = Math.atan2(target.y - y, target.x - x); this.vx = Math.cos(angle)*10; this.vy = Math.sin(angle)*10; }
    update() {
        this.x += this.vx; this.y += this.vy;
        if(Math.hypot(this.x - this.target.x, this.y - this.target.y) < this.target.size) { this.target.hp -= this.damage; this.active = false; }
        if(this.x < 0 || this.x > canvas.width) this.active = false;
    }
    draw() { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI*2); ctx.fill(); }
}
function getNearestEnemy(x, y, range) {
    let nearest = null, min = range;
    enemies.forEach(e => { let d = Math.hypot(e.x - x, e.y - y); if(d < min) { min = d; nearest = e; } });
    return nearest;
}
function createParticles(x, y, color, count) { for(let i=0; i<count; i++) particles.push({ x, y, vx:(Math.random()-0.5)*8, vy:(Math.random()-0.5)*8, life:1, color, size:3 }); }
function takeDamage(amount) {
    if(shieldActive) return;
    currentHp -= amount; hpBar.style.width = `${Math.max(0, currentHp/maxHp*100)}%`;
    if(currentHp <= 0) { stopGame(); alert(`GAME OVER! Score: ${score}`); }
}
function autoWeaponLogic() {
    if(!gameRunning || gamePaused) return;
    if(stats.regenRate > 0 && currentHp < maxHp) { currentHp = Math.min(currentHp + stats.regenRate, maxHp); hpBar.style.width = `${(currentHp / maxHp) * 100}%`; }
    if(shopItems.lightning.level > 0) {
        let targets = enemies.slice(0, shopItems.lightning.level + 2);
        if(targets.length > 0) {
            targets.forEach(e => { e.hp -= 30; createParticles(e.x, e.y, '#bc13fe', 5); });
            lightnings.push(new Lightning(canvas.width/2, canvas.height/2, targets));
        }
    }
    if(shopItems.missile.level > 0) { for(let i=0; i<shopItems.missile.level; i++) missiles.push(new Missile()); }
}

function spawnLogic() {
    if (!gameRunning || gamePaused) return;
    // 🌟 強制生成最弱怪 3 隻 (提供爽快感)
    for(let i=0; i<3; i++) { enemies.push(new Enemy(0)); }

    let spawnChance = 0.3 + (score / 5000);
    if (Math.random() < spawnChance) {
        let count = 1; if (score > 2000) count = 2;
        for(let i=0; i<count; i++) enemies.push(new Enemy());
    }

    if (score > 2000 && score % 2000 < 100 && !bossSpawned) {
        let bossType = score > 10000 ? ENEMY_TYPES[9] : ENEMY_TYPES[8];
        let boss = new Enemy(); 
        boss.type = 'boss'; boss.size = bossType.size; boss.hp = bossType.hp; boss.maxHp = bossType.hp; boss.speed = bossType.speed; boss.color = bossType.color; boss.scoreValue = bossType.score;
        enemies.push(boss); bossSpawned = true;
        showGameMsg("⚠️ WARNING: BOSS DETECTED", canvas.width/2, canvas.height/2, '#ff0000');
    }
    if (score % 2000 > 200) bossSpawned = false;
}

function gameLoop() {
    if (!gameRunning) return;
    if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00f3ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, 20, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle = "#00f3ff"; ctx.fillText("CORE", canvas.width/2 - 15, canvas.height/2 + 4);
        turrets.forEach(t => { t.update(); t.draw(); });
        missiles.forEach((m, i) => { m.update(); m.draw(); if(m.life<=0) missiles.splice(i,1); });
        lasers.forEach(l => { l.update(); l.draw(); });
        lightnings.forEach((l, i) => { l.update(); l.draw(); if(l.life<=0) lightnings.splice(i,1); });
        bullets.forEach((b, i) => { b.update(); b.draw(); if (!b.active) bullets.splice(i, 1); });
        enemies.forEach((e, i) => { e.update(); e.draw(); if (e.hp <= 0) { 
            score += e.scoreValue; gold += e.scoreValue; 
            updateHud(); createParticles(e.x, e.y, e.color, 10); enemies.splice(i, 1); 
        } });
        particles.forEach((p, i) => { p.x += p.vx; p.y += p.vy; p.life -= 0.05; if (p.life <= 0) particles.splice(i, 1); else { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); ctx.globalAlpha = 1.0; } });
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

function handleInput(x, y) {
    if (!gameRunning || gamePaused) return;
    createParticles(x, y, '#ffffff', 5);
    let hitRadius = stats.blastRadius;
    if (!isMobile) hitRadius += 30; if (isMobile) hitRadius += 50;
    enemies.forEach(e => {
        const dist = Math.hypot(e.x - x, e.y - y);
        if (dist < hitRadius + e.size) { 
            let dmg = stats.damage; if (Math.random() < stats.critChance) { dmg *= 2; createParticles(e.x, e.y, '#ffd700', 5); }
            e.hp -= dmg; e.x -= e.vx * 5; e.y -= e.vy * 5; createParticles(e.x, e.y, '#fff', 2); 
        }
    });
}

window.toggleShop = function() {
    if(!gameRunning) return;
    gamePaused = !gamePaused;
    if(gamePaused) {
        shopModal.style.display = 'flex';
        for(let key in shopItems) {
            let item = shopItems[key];
            let costEl = document.getElementById(`cost-${key}`), lvlEl = document.getElementById(`lvl-${key}`);
            if(costEl) costEl.innerText = `$${Math.floor(item.baseCost * Math.pow(1.5, item.level))}`;
            if(lvlEl) lvlEl.innerText = `Lv${item.level}`;
        }
    } else { shopModal.style.display = 'none'; }
};
window.buyItem = function(type) {
    if(type === 'shield') {
        if(gold >= 5000) { gold -= 5000; updateHud(); shieldActive = true; setTimeout(() => shieldActive = false, 10000); toggleShop(); } return;
    }
    let item = shopItems[type], cost = Math.floor(item.baseCost * Math.pow(1.5, item.level));
    if (gold >= cost) { 
        gold -= cost; updateHud(); item.level++;
        if(type === 'damage') stats.damage += 10;
        if(type === 'blast') stats.blastRadius += 15;
        if(type === 'drone') turrets.push(new Turret(turrets.length));
        if(type === 'laser') lasers.push(new Laser());
        if(type === 'lightning') {}
        if(type === 'missile') {} 
        if(type === 'regen') stats.regenRate += 1;
        if(type === 'crit') stats.critChance += 0.05;
        document.getElementById(`cost-${type}`).innerText = `$${Math.floor(item.baseCost * Math.pow(1.5, item.level))}`;
        document.getElementById(`lvl-${type}`).innerText = `Lv${item.level}`;
    }
};
function showGameMsg(text, x, y, color) {
    const msg = document.createElement('div'); msg.className = 'game-msg'; msg.innerText = text; msg.style.left = x + 'px'; msg.style.top = y + 'px'; msg.style.color = color; document.body.appendChild(msg); setTimeout(() => msg.remove(), 1000);
}
canvas.addEventListener('mousedown', (e) => handleInput(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); for (let i = 0; i < e.touches.length; i++) { handleInput(e.touches[i].clientX, e.touches[i].clientY); } }, {passive: false});
function initGame() { gameModal.style.display = 'flex'; body.classList.add('game-active'); }
function startGame() {
    gameModal.style.display = 'none'; canvas.style.display = 'block'; shopBtn.style.display = 'block'; integrityUI.style.display = 'block'; startBtn.style.display = 'none'; stopBtn.style.display = 'block'; scoreHud.style.display = 'block';
    
    gameRunning = true; gamePaused = false; 
    score = 0; 
    gold = isMobile ? 0 : 3000; 
    updateHud();
    
    maxHp = 100; currentHp = 100; hpBar.style.width = '100%';
    // 🌟 修正：初始傷害從 10 改為 20 (確保秒殺小怪)
    stats = { damage: 20, blastRadius: 50, regenRate: 0, critChance: 0 }; 
    if(isMobile) stats.blastRadius = 100;
    
    enemies = []; turrets = []; bullets = []; missiles = []; lasers = []; particles = []; lightnings = [];
    for(let key in shopItems) shopItems[key].level = 0;
    
    spawnInterval = setInterval(spawnLogic, 1000); 
    autoWeaponInterval = setInterval(autoWeaponLogic, 1000);
    gameLoop();
}
function stopGame() {
    gameRunning = false; cancelAnimationFrame(animationFrameId); clearInterval(spawnInterval); clearInterval(autoWeaponInterval);
    canvas.style.display = 'none'; shopModal.style.display = 'none'; shopBtn.style.display = 'none'; integrityUI.style.display = 'none'; gameModal.style.display = 'none';
    startBtn.style.display = 'block'; stopBtn.style.display = 'none'; scoreHud.style.display = 'none';
    body.classList.remove('game-active');
}
if(startBtn) startBtn.addEventListener('click', initGame);
if(modalStartBtn) modalStartBtn.addEventListener('click', startGame);
if(stopBtn) stopBtn.addEventListener('click', stopGame);
loadRankings();