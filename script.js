// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// 🟢【NPC 設定區】🟢
const NPC_LIST = {
    1: [], 
    2: [],
    3: ['未入團強力路人1', '未入團強力路人2', '未入團強力路人3', '未入團強力路人4'], // 這裡會佔據 #41~#44
    4: ['未入團強力路人5'], // 這裡會佔據 #61
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

        // --- 步驟 1：準備所有「真實玩家」的排隊隊伍 ---
        let waitingList = []; // 等待分發的真實玩家清單
        let leaderData = null; // 團長保留席

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length < 3) return;
            
            const name = columns[1].trim();
            const score = columns[2].trim();
            const playerData = { name: name, score: score, isLeader: false, isNPC: false };

            if (name === '陰帝') {
                leaderData = playerData;
                leaderData.isLeader = true;
            } else {
                waitingList.push(playerData);
            }
        });

        // --- 步驟 2：開始分發 (流水席邏輯) ---
        let globalRankCounter = 1; // 全局排名計數器 (#1, #2, ...)

        // 依序處理 1~5 團
        for (let teamNum = 1; teamNum <= 5; teamNum++) {
            const tableBody = document.getElementById(TEAM_CONFIG[teamNum].id);
            if (!tableBody) continue;

            let currentTeamCount = 0; // 該團目前人數
            const MAX_PER_TEAM = 20;  // 每團上限 20 人 (第五團如果爆滿會自動延伸)

            // --- A. 團長優先入座 (只在一團) ---
            if (teamNum === 1 && leaderData) {
                renderRow(tableBody, leaderData, globalRankCounter);
                currentTeamCount++;
                // 注意：團長雖然顯示 #1，但我們計數器還是要跑，讓後面的人變成 #2
                // 不過依照您的需求，團長佔位後，下一位應該是 #2，所以這裡不需特殊跳號
            }

            // --- B. NPC 優先入座 ---
            const npcs = NPC_LIST[teamNum] || [];
            npcs.forEach(npcName => {
                // 只有當該團還沒滿 20 人時才塞入 (雖然 NPC 通常是預設好的，不太會超過)
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

            // --- C. 真實玩家從隊伍中補位 ---
            // 只要 1. 隊伍還有人 AND (2. 該團還沒滿 20 人 OR 是第五團無上限)
            while (waitingList.length > 0 && (teamNum === 5 || currentTeamCount < MAX_PER_TEAM)) {
                // 從隊伍最前面抓一個人出來
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

    // 特殊身分樣式
    if (player.isLeader) {
        displayRank = '#1'; // 強制顯示 #1
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

    tr.innerHTML = `
        <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
        <td style="${nameStyle}">${player.name}</td>
        <td style="${scoreStyle}">${displayScore}</td>
    `;
    
    container.appendChild(tr);
}

loadRankings();