// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// NPC 設定區
const NPC_LIST = {
    1: [], 
    2: [],
    3: ['未入團強力路人1', '未入團強力路人2'], 
    4: ['未入團強力路人5'], 
    5: []
};

// 團別與容器設定 (這裡不再需要寫死顏色，顏色交給 CSS)
const TEAM_CONFIG = {
    1: { name: '大陰帝國', id: 'team1-body', theme: 'tier-1-theme' },
    2: { name: '大陰帝國-稽查菊', id: 'team2-body', theme: 'tier-2-theme' },
    3: { name: '大陰帝國-手入與支出', id: 'team3-body', theme: 'tier-3-theme' },
    4: { name: '大陰帝國-抽查桃稅', id: 'team4-body', theme: 'tier-4-theme' },
    5: { name: '大陰帝國-天龍特攻隊', id: 'team5-body', theme: 'tier-5-theme' }
};

// ==========================================
// 🚀 特效與工具函式
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
        if(cursorOutline) { 
            cursorOutline.style.opacity = 1; 
            cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 100, fill: "forwards" }); 
        }
        if(crossX && crossY) { crossX.style.top = `${posY}px`; crossY.style.left = `${posX}px`; }
    });
}

// ==========================================
// 主程式：渲染邏輯 (已重構為 Class-Based)
// ==========================================
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

            if (name === '陰帝') {
                leaderData = playerData; leaderData.isLeader = true;
            } else if (note.includes('自願降團')) {
                playerData.isDemoted = true; demotedList.push(playerData);
            } else {
                waitingList.push(playerData);
            }
        });

        let globalRankCounter = 1; 

        // 套用各團的主題色 Class
        for (let teamNum = 1; teamNum <= 5; teamNum++) {
            const config = TEAM_CONFIG[teamNum];
            const tableBody = document.getElementById(config.id);
            if (!tableBody) continue;
            
            // 🌟 將該團的容器 (section) 加上主題色 class
            const section = tableBody.closest('.team-section');
            if (section) section.classList.add(config.theme);

            tableBody.innerHTML = ''; // 清空

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
        document.getElementById('boot-screen').style.display = 'none';
    }
}

// 🌟 核心：根據身份加 Class，而非寫死 Style
function renderRow(container, player, rank) {
    const tr = document.createElement('tr');
    tr.style.animation = `fadeIn 0.5s ease forwards`;

    let displayRank = `#${rank}`;
    let displayScore = `(PR: ${player.score})`;
    
    // 依據身份添加 Class
    if (player.isLeader) {
        tr.classList.add('row-leader');
        displayRank = '#1'; 
        displayScore = '👑 大陰團長';
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

loadRankings();
// ==========================================
// 🎮 系統防禦小遊戲 (System Defense Mode)
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
let animationFrameId;
let spawnInterval;

// 設定畫布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- 類別定義 ---

// 1. 敵人 (數據病毒)
class Enemy {
    constructor() {
        this.size = Math.random() * 20 + 20; // 大小 20-40
        this.x = Math.random() * (canvas.width - this.size);
        this.y = Math.random() * (canvas.height - this.size);
        
        // 隨機移動速度
        this.vx = (Math.random() - 0.5) * 2; 
        this.vy = (Math.random() - 0.5) * 2;
        
        // 顏色：紅色的數據錯誤方塊
        this.color = '#ff2a2a'; 
        this.glitchTimer = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // 碰到邊界反彈
        if (this.x < 0 || this.x > canvas.width - this.size) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height - this.size) this.vy *= -1;

        // 偶爾閃爍故障效果
        this.glitchTimer++;
        if (this.glitchTimer > Math.random() * 50 + 20) {
            this.x += (Math.random() - 0.5) * 10;
            this.glitchTimer = 0;
        }
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        
        // 內部畫一些隨機線條，像壞掉的像素
        ctx.fillStyle = `rgba(255, 42, 42, 0.3)`;
        ctx.fillRect(this.x + 5, this.y + 5, this.size - 10, this.size - 10);
        
        ctx.font = "10px Consolas";
        ctx.fillStyle = this.color;
        ctx.fillText("ERR", this.x, this.y - 5);
    }
}

// 2. 爆炸粒子
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0; // 生命值 100%
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05; // 慢慢消失
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

// --- 遊戲邏輯 ---

function spawnEnemy() {
    if (!gameRunning) return;
    if (enemies.length < 15) { // 畫面最多 15 隻
        enemies.push(new Enemy());
    }
}

function gameLoop() {
    if (!gameRunning) return;

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新與繪製敵人
    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();
    });

    // 更新與繪製粒子
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
    gameRunning = true;
    score = 0;
    enemies = [];
    particles = [];
    scoreHud.innerText = "SCORE: 0";
    
    // UI 切換
    canvas.style.display = 'block';
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    scoreHud.style.display = 'block';
    body.classList.add('game-active'); // 讓背景變暗

    // 生成敵人
    for(let i=0; i<5; i++) enemies.push(new Enemy());
    spawnInterval = setInterval(spawnEnemy, 1000);

    gameLoop();
}

function stopGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(spawnInterval);

    // UI 切換
    canvas.style.display = 'none';
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    scoreHud.style.display = 'none';
    body.classList.remove('game-active');
}

// 射擊判定 (點擊事件)
canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    let hit = false;

    // 倒著檢查，優先射擊上層的敵人
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (
            clickX >= enemy.x && 
            clickX <= enemy.x + enemy.size &&
            clickY >= enemy.y && 
            clickY <= enemy.y + enemy.size
        ) {
            // 擊中！
            score += 100;
            scoreHud.innerText = `SCORE: ${score}`;
            
            // 產生爆炸
            for(let j=0; j<10; j++) {
                particles.push(new Particle(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.color));
            }

            // 移除敵人
            enemies.splice(i, 1);
            hit = true;
            break; // 一次只打一隻
        }
    }

    // 射擊特效：在滑鼠位置畫一個短暫的圈
    if(!hit) {
        // 如果沒打中，也可以加個空槍特效 (可選)
    }
});

// 按鈕監聽
startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);