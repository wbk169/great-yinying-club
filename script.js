// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// 團別對應設定
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
        
        // 分割每一行，去除標題
        const rows = csvText.trim().split('\n').slice(1);

        rows.forEach(row => {
            // 解析 CSV
            const columns = row.split(',');
            if (columns.length < 3) return;

            const rank = parseInt(columns[0].trim());
            const name = columns[1].trim();
            const score = columns[2].trim();

            // --- 變數初始化 ---
            let teamId = null;
            let displayRank = `#${rank}`; // 預設顯示排名
            let rankColor = '#00FFFF';    // 預設排名顏色 (螢光藍)
            let nameStyle = '';           // 預設名字樣式
            let isLeader = false;         // 標記是否為團長

            // 👑【團長霸王條款】
            if (name === '陰帝') {
                teamId = TEAM_CONFIG[1].id;       // 強制去一團
                displayRank = '👑 大陰團長';      // 強制改頭銜
                rankColor = '#FFD700';            // 金色字體
                nameStyle = 'color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: bold; font-size: 1.1em;';
                isLeader = true;                  // 標記為團長 (重要!)
            } 
            // 🛡️【一般平民分團邏輯】
            else {
                if (rank <= 20) teamId = TEAM_CONFIG[1].id;
                else if (rank <= 40) teamId = TEAM_CONFIG[2].id;
                else if (rank <= 60) teamId = TEAM_CONFIG[3].id;
                else if (rank <= 80) teamId = TEAM_CONFIG[4].id;
                else teamId = TEAM_CONFIG[5].id;
            }

            // --- 生成表格 ---
            if (teamId) {
                const tr = document.createElement('tr');
                tr.style.animation = `fadeIn 0.5s ease forwards`;
                
                // 設定表格內容
                tr.innerHTML = `
                    <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
                    <td style="${nameStyle}">${name}</td>
                    <td style="color:#aaa; font-size:0.9em;">(PR: ${score})</td>
                `;

                const tableBody = document.getElementById(teamId);

                // ⚡ 關鍵修改：如果是團長，用 prepend 插隊到第一排；其他人用 appendChild 排後面
                if (isLeader) {
                    tableBody.prepend(tr); 
                    // 為了凸顯團長，給整行加個深金色背景微光
                    tr.style.background = 'linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent)';
                    tr.style.borderLeft = '3px solid #FFD700';
                } else {
                    tableBody.appendChild(tr);
                }
            }
        });

        // 更新日期
        const today = new Date();
        document.getElementById('update-date').textContent = 
            `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    } catch (error) {
        console.error('讀取數據失敗:', error);
    }
}

loadRankings();