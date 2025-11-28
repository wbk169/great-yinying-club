// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// 🟢【NPC 設定區】🟢
const NPC_LIST = {
    1: [], 
    2: [],
    3: ['未入團強力路人1', '未入團強力路人2', '未入團強力路人3', '未入團強力路人4'], 
    4: ['未入團強力路人5'], 
    5: []
};

// 團別與容器設定
const TEAM_CONFIG = {
    1: { name: '大陰帝國', id: 'team1-body' },
    2: { name: '大陰帝國-稽查菊', id: 'team2-body' },
    3: { name: '大陰帝國-手入與支出', id: 'team3-body' },
    4: { name: '大陰帝國-抽查桃稅', id: 'team4-body' },
    5: { name: '大陰帝國-天龍特攻隊', id: 'team5-body' }
};

// ==========================================
// 🚀 特效 1：駭客文字解碼 (Hacker Decode)
// ==========================================
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

function hackEffect(element) {
    let iterations = 0;
    const originalText = element.dataset.value; // 從 data-value 讀取原始名字
    
    // 如果沒有原始文字，就不執行
    if(!originalText) return;

    const interval = setInterval(() => {
        element.innerText = originalText.split("")
            .map((letter, index) => {
                if(index < iterations) {
                    return originalText[index];
                }
                return letters[Math.floor(Math.random() * 43)];
            })
            .join("");
        
        if(iterations >= originalText.length) { 
            clearInterval(interval);
        }
        
        iterations += 1 / 3; // 調整解碼速度
    }, 30);
}

// ==========================================
// 🚀 特效 2：3D 全息卡片 (3D Tilt) - 桌面版限定
// ==========================================
function initTiltEffect() {
    // 偵測是否為手機 (螢幕寬度小於 768px)，手機版不執行 Tilt
    if (window.innerWidth < 768) return;

    const cards = document.querySelectorAll('.team-section');

    cards.forEach(card => {
        // 加入光澤層
        if (!card.querySelector('.hologram-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'hologram-overlay';
            card.appendChild(overlay);
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 計算中心點偏移量
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // 計算旋轉角度 (除以數值越大，旋轉幅度越小)
            const rotateX = ((y - centerY) / 20) * -1; // 上下翻轉
            const rotateY = (x - centerX) / 20;        // 左右翻轉

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // 移動光澤層
            const overlay = card.querySelector('.hologram-overlay');
            overlay.style.opacity = '1';
            overlay.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent)`;
        });

        // 滑鼠離開時復原
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            const overlay = card.querySelector('.hologram-overlay');
            overlay.style.opacity = '0';
        });
    });
}

// ==========================================
// 🚀 特效 3：系統啟動畫面 (Boot Sequence)
// ==========================================
function runBootSequence() {
    const textElement = document.getElementById('terminal-text');
    const bootScreen = document.getElementById('boot-screen');
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
            // 隨機延遲，模擬真實讀取
            setTimeout(typeLine, Math.random() * 300 + 100); 
        } else {
            // 跑完了，淡出啟動畫面
            setTimeout(() => {
                bootScreen.style.transition = "opacity 0.8s ease";
                bootScreen.style.opacity = "0";
                setTimeout(() => {
                    bootScreen.style.display = "none";
                }, 800);
            }, 800);
        }
    }
    
    // 開始執行啟動動畫
    typeLine();
}

// ==========================================
// 主程式：讀取 CSV 並渲染
// ==========================================
async function loadRankings() {
    // 1. 先執行啟動畫面
    runBootSequence();

    try {
        const response = await fetch(CSV_FILE_PATH);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n').slice(1);

        let waitingList = [];      
        let demotedList = [];      
        let leaderData = null;     

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length < 3) return;
            
            const name = columns[1].trim();
            const score = columns[2].trim();
            const note = columns[3] ? columns[3].trim() : ""; 

            const playerData = { 
                name: name, score: score, isLeader: false, isNPC: false, isDemoted: false 
            };

            if (name === '陰帝') {
                leaderData = playerData;
                leaderData.isLeader = true;
            } else if (note.includes('自願降團')) {
                playerData.isDemoted = true; 
                demotedList.push(playerData);
            } else {
                waitingList.push(playerData);
            }
        });

        let globalRankCounter = 1; 

        for (let teamNum = 1; teamNum <= 5; teamNum++) {
            const tableBody = document.getElementById(TEAM_CONFIG[teamNum].id);
            if (!tableBody) continue;

            let currentTeamCount = 0; 
            const MAX_PER_TEAM = 20;  

            if (teamNum === 1 && leaderData) {
                renderRow(tableBody, leaderData, globalRankCounter);
                currentTeamCount++;
                globalRankCounter++;
            }

            const npcs = NPC_LIST[teamNum] || [];
            npcs.forEach(npcName => {
                if (teamNum === 5 || currentTeamCount < MAX_PER_TEAM) {
                    renderRow(tableBody, { 
                        name: npcName, score: "強力NPC", isLeader: false, isNPC: true 
                    }, globalRankCounter);
                    currentTeamCount++;
                    globalRankCounter++;
                }
            });

            if (teamNum === 5) {
                while (demotedList.length > 0) {
                    renderRow(tableBody, demotedList.shift(), globalRankCounter);
                    currentTeamCount++;
                    globalRankCounter++;
                }
            }

            while (waitingList.length > 0 && (teamNum === 5 || currentTeamCount < MAX_PER_TEAM)) {
                renderRow(tableBody, waitingList.shift(), globalRankCounter);
                currentTeamCount++;
                globalRankCounter++;
            }
        }

        // 資料載入完成後，初始化 3D 傾斜特效
        setTimeout(initTiltEffect, 500);

        // 更新日期
        const today = new Date();
        document.getElementById('update-date').textContent = 
            `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    } catch (error) {
        console.error('讀取數據失敗:', error);
        // 如果出錯，至少要把啟動畫面關掉，不然使用者會卡死
        document.getElementById('boot-screen').style.display = 'none';
    }
}

function renderRow(container, player, rank) {
    const tr = document.createElement('tr');
    tr.style.animation = `fadeIn 0.5s ease forwards`;

    let displayRank = `#${rank}`;
    let displayScore = `(PR: ${player.score})`;
    let rankColor = '#00FFFF'; 
    let nameStyle = '';
    let scoreStyle = 'color:#aaa; font-size:0.9em;';

    if (player.isLeader) {
        displayRank = '#1'; 
        displayScore = '👑 大陰團長';
        rankColor = '#FFD700'; 
        nameStyle = 'color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: bold; font-size: 1.1em;';
        scoreStyle = 'color: #FFD700; font-weight: bold; letter-spacing: 1px;';
        tr.style.background = 'linear-gradient(90deg, rgba(255, 215, 0, 0.15), transparent)';
        tr.style.borderLeft = '4px solid #FFD700';
    } 
    else if (player.isNPC) {
        displayScore = '⚡ 強力NPC';
        nameStyle = 'color: #00FF7F; font-weight: bold;'; 
        scoreStyle = 'color: #00FF7F; font-weight: bold; letter-spacing: 1px;';
        tr.style.borderLeft = '3px solid #00FF7F'; 
    }
    else if (player.isDemoted) {
        displayScore = `(PR: ${player.score}) <span style="display:inline-block; border:1px solid #ff4757; color:#ff4757; padding:1px 6px; border-radius:4px; font-size:0.75em; margin-left:8px; vertical-align:middle;">自願降團</span>`;
        tr.style.borderLeft = '3px solid #ff4757';
    }

    // ✨ 這裡加入 Hacker Text 的 class 和 data-value
    // 注意：只對「名字」欄位做特效
    tr.innerHTML = `
        <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
        <td class="hacker-text" style="${nameStyle}" data-value="${player.name}">${player.name}</td>
        <td style="${scoreStyle}">${displayScore}</td>
    `;
    
    // 綁定滑鼠懸停事件，觸發 Hacker Effect
    const nameCell = tr.querySelector('.hacker-text');
    nameCell.addEventListener('mouseover', () => hackEffect(nameCell));
    
    container.appendChild(tr);
}

// 游標邏輯
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

if (cursorDot && cursorOutline && window.innerWidth > 768) {
    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });
}

loadRankings();