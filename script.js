// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// 🟢【NPC 設定區】🟢 
// (請確認這裡的名字是否為您想要的名字，若已修改過請保留您的版本)
const NPC_LIST = {
    1: [], 
    2: [],
    3: ['未入團強力路人1', '未入團強力路人2'], // 佔據 #41~#42
    4: ['未入團強力路人3'], // 佔據 #61
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

async function loadRankings() {
    try {
        const response = await fetch(CSV_FILE_PATH);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n').slice(1);

        // --- 步驟 1：準備隊伍 ---
        let waitingList = [];      
        let demotedList = [];      // 📉 自願降團名單
        let leaderData = null;     

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length < 3) return;
            
            const name = columns[1].trim();
            const score = columns[2].trim();
            // 讀取備註欄位
            const note = columns[3] ? columns[3].trim() : ""; 

            // 初始化玩家資料物件
            const playerData = { 
                name: name, 
                score: score, 
                isLeader: false, 
                isNPC: false,
                isDemoted: false // ✨ 新增狀態：是否自願降團
            };

            if (name === '陰帝') {
                leaderData = playerData;
                leaderData.isLeader = true;
            } else if (note.includes('自願降團')) {
                // 📉 標記為自願降團，並放入優先名單
                playerData.isDemoted = true; 
                demotedList.push(playerData);
            } else {
                waitingList.push(playerData);
            }
        });

        // --- 步驟 2：開始分發 (流水席邏輯) ---
        let globalRankCounter = 1; 

        // 依序處理 1~5 團
        for (let teamNum = 1; teamNum <= 5; teamNum++) {
            const tableBody = document.getElementById(TEAM_CONFIG[teamNum].id);
            if (!tableBody) continue;

            let currentTeamCount = 0; 
            const MAX_PER_TEAM = 20;  

            // --- A. 團長優先入座 ---
            if (teamNum === 1 && leaderData) {
                renderRow(tableBody, leaderData, globalRankCounter);
                currentTeamCount++;
                globalRankCounter++;
            }

            // --- B. NPC 優先入座 ---
            const npcs = NPC_LIST[teamNum] || [];
            npcs.forEach(npcName => {
                if (teamNum === 5 || currentTeamCount < MAX_PER_TEAM) {
                    renderRow(tableBody, { 
                        name: npcName, 
                        score: "強力NPC", 
                        isLeader: false, 
                        isNPC: true 
                    }, globalRankCounter);
                    
                    currentTeamCount++;
                    globalRankCounter++;
                }
            });

            // --- C. 自願降團者入座 (只在第五團優先插入) ---
            if (teamNum === 5) {
                while (demotedList.length > 0) {
                    const demotedPlayer = demotedList.shift();
                    renderRow(tableBody, demotedPlayer, globalRankCounter);
                    currentTeamCount++;
                    globalRankCounter++;
                }
            }

            // --- D. 真實玩家從隊伍中補位 ---
            while (waitingList.length > 0 && (teamNum === 5 || currentTeamCount < MAX_PER_TEAM)) {
                const player = waitingList.shift(); 
                renderRow(tableBody, player, globalRankCounter);
                currentTeamCount++;
                globalRankCounter++;
            }
        }

        // 更新日期
        const today = new Date();
        document.getElementById('update-date').textContent = 
            `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    } catch (error) {
        console.error('讀取數據失敗:', error);
    }
}

// 輔助函數：生成表格行 HTML
function renderRow(container, player, rank) {
    const tr = document.createElement('tr');
    tr.style.animation = `fadeIn 0.5s ease forwards`;

    // 預設樣式
    let displayRank = `#${rank}`;
    let displayScore = `(PR: ${player.score})`;
    let rankColor = '#00FFFF'; 
    let nameStyle = '';
    let scoreStyle = 'color:#aaa; font-size:0.9em;';

    // --- 特殊身分樣式判斷 ---
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
    // ✨【新增】自願降團樣式
    else if (player.isDemoted) {
        // 在分數後面加上紅色的標籤
        displayScore = `(PR: ${player.score}) <span style="display:inline-block; border:1px solid #ff4757; color:#ff4757; padding:1px 6px; border-radius:4px; font-size:0.75em; margin-left:8px; vertical-align:middle; box-shadow: 0 0 8px rgba(255, 71, 87, 0.3);">自願降團</span>`;
        
        // 該行左側加紅色邊框
        tr.style.borderLeft = '3px solid #ff4757';
    }

    tr.innerHTML = `
        <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
        <td style="${nameStyle}">${player.name}</td>
        <td style="${scoreStyle}">${displayScore}</td>
    `;
    
    container.appendChild(tr);
}

// ✨ 科技感游標控制邏輯
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

if (cursorDot && cursorOutline) {
    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'TR' || e.target.tagName === 'H3') {
            cursorOutline.style.width = '60px';
            cursorOutline.style.height = '60px';
            cursorOutline.style.backgroundColor = 'rgba(0, 243, 255, 0.1)';
        }
    });

    document.addEventListener('mouseout', () => {
        cursorOutline.style.width = '40px';
        cursorOutline.style.height = '40px';
        cursorOutline.style.backgroundColor = 'transparent';
    });
}

loadRankings();