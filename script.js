// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// NPC 設定區
const NPC_LIST = {
    1: [], 
    2: [],
    3: ['未入團強力路人1', '未入團強力路人2', ], 
    4: ['未入團強力路人3'], 
    5: []
};

const TEAM_CONFIG = {
    1: { name: '大陰帝國', id: 'team1-body' },
    2: { name: '大陰帝國-稽查菊', id: 'team2-body' },
    3: { name: '大陰帝國-手入與支出', id: 'team3-body' },
    4: { name: '大陰帝國-抽查桃稅', id: 'team4-body' },
    5: { name: '大陰帝國-天龍特攻隊', id: 'team5-body' }
};

// ==========================================
// 🚀 特效邏輯整合
// ==========================================

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

// 1. 駭客文字解碼 (Hacker Decode)
function hackEffect(element) {
    let iterations = 0;
    const originalText = element.dataset.value || element.innerText; 
    // 保存原始文字到 dataset 以便重複使用
    if(!element.dataset.value) element.dataset.value = originalText;

    const interval = setInterval(() => {
        element.innerText = originalText.split("")
            .map((letter, index) => {
                if(index < iterations) return originalText[index];
                return letters[Math.floor(Math.random() * 43)];
            })
            .join("");
        
        if(iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 2; // 調整速度
    }, 30);
}

// 2. 磁吸按鈕效果 (Magnetic Effect) - 應用於標題
function initMagnetic() {
    if (window.innerWidth < 768) return; // 手機關閉
    const magnets = document.querySelectorAll('.team-title');

    magnets.forEach(magnet => {
        magnet.classList.add('magnetic-target'); // 確保 CSS transition 生效
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            // 磁力強度
            magnet.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });
        magnet.addEventListener('mouseleave', () => {
            magnet.style.transform = 'translate(0px, 0px)';
        });
    });
}

// 3. 滾動偵測：進度條 & 標題解碼
function initScrollEffects() {
    const progressBar = document.getElementById('progressBar');
    const titles = document.querySelectorAll('.team-title');
    
    // 預先設定好 Observer 來觸發標題解碼
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                hackEffect(entry.target); // 進入畫面時解碼
                observer.unobserve(entry.target); // 只觸發一次
            }
        });
    }, { threshold: 0.5 });

    titles.forEach(title => observer.observe(title));

    // 滾動監聽
    window.addEventListener('scroll', () => {
        // 進度條
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });
}

// 4. 游標與聚光燈追蹤
function initCursor() {
    if (window.innerWidth < 768) return;
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const body = document.body;

    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;
        
        // 更新游標位置
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 400, fill: "forwards" });

        // 更新聚光燈變數
        body.style.setProperty('--x', `${posX}px`);
        body.style.setProperty('--y', `${posY}px`);
    });
}

// 5. 系統啟動畫面
function runBootSequence() {
    const textElement = document.getElementById('terminal-text');
    const bootScreen = document.getElementById('boot-screen');
    const logs = [
        "INITIALIZING SYSTEM...", "LOADING KERNEL...", "CONNECTING TO MLB DB...",
        "VERIFYING CREDENTIALS...", "ACCESS GRANTED.", "SYSTEM ONLINE."
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

// ==========================================
// 主程式
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

        for (let teamNum = 1; teamNum <= 5; teamNum++) {
            const tableBody = document.getElementById(TEAM_CONFIG[teamNum].id);
            if (!tableBody) continue;
            let currentTeamCount = 0; 
            const MAX_PER_TEAM = 20;  

            if (teamNum === 1 && leaderData) {
                renderRow(tableBody, leaderData, globalRankCounter);
                currentTeamCount++; globalRankCounter++;
            }
            const npcs = NPC_LIST[teamNum] || [];
            npcs.forEach(npcName => {
                if (teamNum === 5 || currentTeamCount < MAX_PER_TEAM) {
                    renderRow(tableBody, { name: npcName, score: "強力NPC", isLeader: false, isNPC: true }, globalRankCounter);
                    currentTeamCount++; globalRankCounter++;
                }
            });
            if (teamNum === 5) {
                while (demotedList.length > 0) {
                    renderRow(tableBody, demotedList.shift(), globalRankCounter);
                    currentTeamCount++; globalRankCounter++;
                }
            }
            while (waitingList.length > 0 && (teamNum === 5 || currentTeamCount < MAX_PER_TEAM)) {
                renderRow(tableBody, waitingList.shift(), globalRankCounter);
                currentTeamCount++; globalRankCounter++;
            }
        }

        // 初始化所有特效
        initCursor();
        initScrollEffects(); // 包含進度條與標題解碼
        setTimeout(initMagnetic, 1000); // 延遲一下再啟動磁吸

        const today = new Date();
        document.getElementById('update-date').textContent = 
            `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

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
    let rankColor = '#00FFFF'; 
    let nameStyle = '';
    let scoreStyle = 'color:#aaa; font-size:0.9em;';

    if (player.isLeader) {
        displayRank = '#1'; displayScore = '👑 大陰團長'; rankColor = '#FFD700'; 
        nameStyle = 'color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: bold; font-size: 1.1em;';
        scoreStyle = 'color: #FFD700; font-weight: bold; letter-spacing: 1px;';
        tr.style.background = 'linear-gradient(90deg, rgba(255, 215, 0, 0.15), transparent)';
        tr.style.borderLeft = '4px solid #FFD700';
    } else if (player.isNPC) {
        displayScore = '⚡ 強力NPC'; nameStyle = 'color: #00FF7F; font-weight: bold;'; 
        scoreStyle = 'color: #00FF7F; font-weight: bold; letter-spacing: 1px;';
        tr.style.borderLeft = '3px solid #00FF7F'; 
    } else if (player.isDemoted) {
        displayScore = `(PR: ${player.score}) <span style="display:inline-block; border:1px solid #ff4757; color:#ff4757; padding:1px 6px; border-radius:4px; font-size:0.75em; margin-left:8px; vertical-align:middle;">自願降團</span>`;
        tr.style.borderLeft = '3px solid #ff4757';
    }

    tr.innerHTML = `
        <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
        <td class="hacker-text" style="${nameStyle}" data-value="${player.name}">${player.name}</td>
        <td style="${scoreStyle}">${displayScore}</td>
    `;
    const nameCell = tr.querySelector('.hacker-text');
    nameCell.addEventListener('mouseover', () => hackEffect(nameCell));
    container.appendChild(tr);
}

loadRankings();