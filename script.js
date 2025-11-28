// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// 🟢【請在這裡設定各團要插入的 NPC 名單】🟢
// 格式： 團數: ['名字1', '名字2'],
// 🟢【請在這裡設定各團要插入的 NPC 名單】🟢
const NPC_LIST = {
    1: [], // 一團沒有 NPC
    2: [], // 二團沒有 NPC
    
    // 三團插入 4 個 NPC (請修改引號內的文字)
    3: [
        '未入團強力路人1', 
        '未入團強力路人2', 
        '未入團強力路人3', 
        '未入團強力路人4'
    ], 
    
    // 四團插入 1 個 NPC
    4: [
        '未入團強力路人1'
    ], 
    
    5: []  // 五團沒有 NPC
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

        // 步驟 1：建立各團的暫存清單 (Bucket)
        // 我們先不生成 HTML，而是先把資料分堆
        const teamBuckets = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        let leaderData = null; // 暫存團長資料

        // 步驟 2：解析 CSV 並分類
        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length < 3) return;

            const originalRank = parseInt(columns[0].trim()); // 原始戰力排名
            const name = columns[1].trim();
            const score = columns[2].trim();

            const playerData = { name: name, score: score, isLeader: false, isNPC: false };

            // 抓出團長
            if (name === '陰帝') {
                leaderData = playerData;
                leaderData.isLeader = true;
            } else {
                // 依照「原始戰力排名」分配到對應的團
                let targetTeam = 5;
                if (originalRank <= 19) targetTeam = 1;
                else if (originalRank <= 39) targetTeam = 2;
                else if (originalRank <= 59) targetTeam = 3;
                else if (originalRank <= 79) targetTeam = 4;
                
                teamBuckets[targetTeam].push(playerData);
            }
        });

        // 步驟 3：開始生成表格 (統一發放排名)
        let globalRankCounter = 1; // 🌎 全局排名計數器 (從 #1 開始)

        // 依序處理 1~5 團
        for (let teamNum = 1; teamNum <= 5; teamNum++) {
            const tableBody = document.getElementById(TEAM_CONFIG[teamNum].id);
            if (!tableBody) continue;

            // 準備該團的最終名單
            let finalTeamList = [];

            // A. 如果是一團，先放入團長 (霸王位)
            if (teamNum === 1 && leaderData) {
                finalTeamList.push(leaderData);
            }

            // B. 插入該團的「強力 NPC」
            // 讀取我們上方設定的 NPC_LIST
            const npcs = NPC_LIST[teamNum] || [];
            npcs.forEach(npcName => {
                finalTeamList.push({
                    name: npcName,
                    score: "強力NPC", // 分數欄位顯示文字
                    isLeader: false,
                    isNPC: true
                });
            });

            // C. 放入該團的普通團員 (來自 CSV)
            finalTeamList = finalTeamList.concat(teamBuckets[teamNum]);

            // 步驟 4：渲染該團的所有人
            finalTeamList.forEach(player => {
                const tr = document.createElement('tr');
                tr.style.animation = `fadeIn 0.5s ease forwards`;

                // --- 樣式邏輯 ---
                let displayRank = `#${globalRankCounter}`; // 使用全局計數器
                let displayScore = `(PR: ${player.score})`;
                let rankColor = '#00FFFF'; // 預設螢光藍
                let nameStyle = '';
                let scoreStyle = 'color:#aaa; font-size:0.9em;';

                // 特殊身分樣式設定
                if (player.isLeader) {
                    displayRank = '#1'; // 團長強制顯示 #1 (雖然計數器也會是1)
                    displayScore = '👑 大陰團長';
                    rankColor = '#FFD700'; // 金色
                    nameStyle = 'color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: bold; font-size: 1.1em;';
                    scoreStyle = 'color: #FFD700; font-weight: bold; letter-spacing: 1px;';
                    
                    tr.style.background = 'linear-gradient(90deg, rgba(255, 215, 0, 0.15), transparent)';
                    tr.style.borderLeft = '4px solid #FFD700';
                } 
                else if (player.isNPC) {
                    displayScore = '⚡ 強力NPC';
                    nameStyle = 'color: #00FF7F; font-weight: bold;'; // NPC 名字給個螢光綠
                    scoreStyle = 'color: #00FF7F; font-weight: bold; letter-spacing: 1px;';
                    // NPC 給個特殊的左側邊框顏色 (例如綠色)
                    tr.style.borderLeft = '3px solid #00FF7F'; 
                }

                // 填入 HTML
                tr.innerHTML = `
                    <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
                    <td style="${nameStyle}">${player.name}</td>
                    <td style="${scoreStyle}">${displayScore}</td>
                `;

                tableBody.appendChild(tr);

                // 發完號碼牌，計數器 +1
                globalRankCounter++;
            });
        }

        // 更新日期
        const today = new Date();
        document.getElementById('update-date').textContent = 
            `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    } catch (error) {
        console.error('讀取數據失敗:', error);
    }
}

loadRankings();