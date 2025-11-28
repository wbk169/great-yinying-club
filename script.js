// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// NPC 設定區
const NPC_LIST = { 1: [], 2: [], 3: ['未入團強力路人1', '未入團強力路人2'], 4: ['未入團強力路人5'], 5: [] };
const TEAM_CONFIG = {
    1: { name: '大陰帝國', id: 'team1-body', theme: 'tier-1-theme' },
    2: { name: '大陰帝國-稽查菊', id: 'team2-body', theme: 'tier-2-theme' },
    3: { name: '大陰帝國-手入與支出', id: 'team3-body', theme: 'tier-3-theme' },
    4: { name: '大陰帝國-抽查桃稅', id: 'team4-body', theme: 'tier-4-theme' },
    5: { name: '大陰帝國-天龍特攻隊', id: 'team5-body', theme: 'tier-5-theme' }
};

// ... (這裡保留原本的 loadRankings, hackEffect, renderRow 等網站核心代碼，為了篇幅我省略，請務必保留 V6.0 的那部分) ...
// ⚠️ 貼上時請確保上方的網站邏輯存在。

// ↓↓↓↓↓ 以下是 V9.0 遊戲引擎完整代碼 ↓↓↓↓↓

// ==========================================
// 🎮 V9.0 系統防禦戰：重裝上陣 (Tower Defense RPG)
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
let clickDamage = 1;
let enemies = [];
let particles = [];
let turrets = [];
let bullets = [];
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

// 1. 敵人 (Virus)
class Enemy {
    constructor(type = 'normal') {
        this.type = type;
        
        if (type === 'boss') {
            this.size = 80;
            this.hp = 100;
            this.maxHp = 100;
            this.speed = 0.5;
            this.color = '#ffd700'; // Gold
            this.scoreValue = 1000;
        } else if (type === 'tank') {
            this.size = 40;
            this.hp = 10;
            this.maxHp = 10;
            this.speed = 1;
            this.color = '#bc13fe'; // Purple
            this.scoreValue = 50;
        } else {
            this.size = 25;
            this.hp = 1; // 一擊必殺
            this.maxHp = 1;
            this.speed = isMobile ? 1.5 : 2;
            this.color = '#ff2a2a'; // Red
            this.scoreValue = 10;
        }

        // 從螢幕邊緣生成
        if (Math.random() > 0.5) {
            this.x = Math.random() > 0.5 ? -this.size : canvas.width + this.size;
            this.y = Math.random() * canvas.height;
        } else {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() > 0.5 ? -this.size : canvas.height + this.size;
        }

        // 計算朝向中心的向量
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(centerY - this.y, centerX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // 檢查是否撞到中心 (這裡簡化為撞到螢幕中間區域)
        const distToCenter = Math.hypot(this.x - canvas.width/2, this.y - canvas.height/2);
        if (distToCenter < 50) {
            this.hp = 0; // 自爆
            takeDamage(this.type === 'boss' ? 50 : 10);
        }
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.type === 'boss' ? 4 : 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // 內部特效
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.globalAlpha = 1.0;

        // 顯示血條 (如果不是一擊必殺怪)
        if (this.maxHp > 1) {
            const hpPercent = this.hp / this.maxHp;
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2 - 10, this.size, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2 - 10, this.size * hpPercent, 4);
        }
    }
}

// 2. 自動砲塔 (Turret) - 繞著中心轉
class Turret {
    constructor(angleOffset) {
        this.angle = angleOffset;
        this.distance = 80;
        this.color = '#00f3ff';
        this.cooldown = 0;
        this.fireRate = 30; // 越小越快
    }

    update() {
        this.angle += 0.02; // 公轉
        this.x = canvas.width / 2 + Math.cos(this.angle) * this.distance;
        this.y = canvas.height / 2 + Math.sin(this.angle) * this.distance;

        // 自動索敵
        if (this.cooldown <= 0) {
            let target = null;
            let minDist = 9999;
            enemies.forEach(e => {
                const dist = Math.hypot(e.x - this.x, e.y - this.y);
                if (dist < 400 && dist < minDist) { // 射程 400
                    minDist = dist;
                    target = e;
                }
            });

            if (target) {
                bullets.push(new Bullet(this.x, this.y, target));
                this.cooldown = this.fireRate;
            }
        } else {
            this.cooldown--;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        // 畫出軌道
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, this.distance, 0, Math.PI*2);
        ctx.stroke();
    }
}

// 3. 子彈 (Bullet)
class Bullet {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.target = target; // 鎖定目標
        this.active = true;
        const angle = Math.atan2(target.y - y, target.x - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // 簡單碰撞
        if (Math.hypot(this.x - this.target.x, this.y - this.target.y) < this.target.size) {
            this.target.hp -= 2; // 砲塔傷害
            this.active = false;
            createParticles(this.x, this.y, '#00f3ff', 3);
        }

        // 超出邊界移除
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.active = false;
    }

    draw() {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI*2);
        ctx.fill();
    }
}

// 4. 粒子特效
function createParticles(x, y, color, count = 10) {
    for(let i=0; i<count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
}

// --- 遊戲邏輯 ---

function takeDamage(amount) {
    currentHp -= amount;
    hpBar.style.width = `${Math.max(0, (currentHp / maxHp) * 100)}%`;
    
    // 畫面紅閃
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentHp <= 0) {
        gameOver();
    }
}

function gameOver() {
    stopGame();
    alert(`系統崩潰！你的最終得分: ${score}\n請重新修復系統。`);
}

function spawnLogic() {
    if (!gameRunning) return;
    
    // 生成普通怪
    if (Math.random() < 0.05 + (score/10000)) { // 分數越高越多怪
        enemies.push(new Enemy(Math.random() > 0.8 ? 'tank' : 'normal'));
    }

    // 生成 BOSS
    if (score > 500 && score % 1000 < 50 && !bossSpawned && enemies.length < 5) {
        enemies.push(new Enemy('boss'));
        bossSpawned = true;
        showGameMsg("WARNING: BOSS DETECTED", canvas.width/2, canvas.height/2, '#ff0000');
    }
    if (score % 1000 > 100) bossSpawned = false; // 重置 BOSS 生成旗標
}

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製中心基地
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, 20, 0, Math.PI*2); ctx.stroke();
    ctx.font = "10px Arial"; ctx.fillStyle = "#00f3ff"; ctx.fillText("CORE", canvas.width/2 - 15, canvas.height/2 + 4);

    // 砲塔
    turrets.forEach(t => { t.update(); t.draw(); });

    // 子彈
    bullets.forEach((b, i) => {
        b.update(); b.draw();
        if (!b.active) bullets.splice(i, 1);
    });

    // 敵人
    enemies.forEach((e, i) => {
        e.update(); e.draw();
        if (e.hp <= 0) {
            score += e.scoreValue;
            scoreHud.innerText = `SCORE: ${score}`;
            createParticles(e.x, e.y, e.color, 15);
            enemies.splice(i, 1);
        }
    });

    // 粒子
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        if (p.life <= 0) particles.splice(i, 1);
        else {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.globalAlpha = 1.0;
        }
    });

    animationFrameId = requestAnimationFrame(gameLoop);
}

// 點擊攻擊邏輯
function handleInput(x, y) {
    if (!gameRunning) return;
    
    // 點擊特效
    createParticles(x, y, '#ffffff', 5);
    
    // 手機範圍攻擊 / 電腦點擊攻擊
    const hitRadius = isMobile ? 120 : 50;

    enemies.forEach(e => {
        const dist = Math.hypot(e.x - x, e.y - y);
        if (dist < hitRadius + e.size) {
            e.hp -= clickDamage;
            // 被打中稍微擊退
            e.x -= e.vx * 5;
            e.y -= e.vy * 5;
        }
    });
}

// --- 商店系統 ---
window.buyItem = function(type) { // 全局函式供 HTML 呼叫
    if (!gameRunning) return;
    
    let cost = 0;
    if (type === 'damage') cost = 500;
    if (type === 'turret') cost = 2000;
    if (type === 'repair') cost = 1000;

    if (score >= cost) {
        score -= cost;
        scoreHud.innerText = `SCORE: ${score}`;
        
        if (type === 'damage') {
            clickDamage += 2;
            showGameMsg("火力升級!", canvas.width/2, canvas.height/2, '#00f3ff');
        } else if (type === 'turret') {
            turrets.push(new Turret(turrets.length * (Math.PI * 2 / 5)));
            showGameMsg("砲塔部屬!", canvas.width/2, canvas.height/2, '#00f3ff');
        } else if (type === 'repair') {
            currentHp = Math.min(currentHp + 30, maxHp);
            hpBar.style.width = `${(currentHp / maxHp) * 100}%`;
            showGameMsg("系統修復!", canvas.width/2, canvas.height/2, '#00ff00');
        }
    } else {
        showGameMsg("積分不足!", canvas.width/2, canvas.height/2, '#ff0000');
    }
};

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

// 事件綁定
canvas.addEventListener('mousedown', (e) => handleInput(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
        handleInput(e.touches[i].clientX, e.touches[i].clientY);
    }
}, {passive: false});

function initGame() {
    // 顯示規則視窗
    gameModal.style.display = 'flex';
    body.classList.add('game-active'); // 模糊背景
}

function startGame() {
    gameModal.style.display = 'none';
    canvas.style.display = 'block';
    
    // UI 顯示
    shopUI.style.display = 'flex';
    integrityUI.style.display = 'block';
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    scoreHud.style.display = 'block';

    // 變數重置
    gameRunning = true;
    score = 0;
    scoreHud.innerText = "SCORE: 0";
    currentHp = 100;
    hpBar.style.width = '100%';
    clickDamage = 5; // 初始傷害
    enemies = [];
    turrets = [];
    bullets = [];
    particles = [];
    
    spawnInterval = setInterval(spawnLogic, 1000);
    gameLoop();
}

function stopGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(spawnInterval);

    // UI 隱藏
    canvas.style.display = 'none';
    shopUI.style.display = 'none';
    integrityUI.style.display = 'none';
    gameModal.style.display = 'none';
    
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    scoreHud.style.display = 'none';
    body.classList.remove('game-active');
}

startBtn.addEventListener('click', initGame);
modalStartBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);

// 為了確保原有的網站邏輯運行，記得呼叫 loadRankings (假設您有保留上面的代碼)
// loadRankings();