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
            
            // 預設顯示內容
            let displayRank = `#${rank}`;           // 排名欄位
            let displayScore = `(PR: ${score})`;    // 分數欄位
            
            // 預設樣式
            let rankColor = '#00FFFF';    // 排名顏色 (預設螢光藍)
            let nameStyle = '';           // 名字樣式
            let scoreStyle = 'color:#aaa; font-size:0.9em;'; // 分數樣式 (預設灰色)
            
            let isLeader = false;         // 標記是否為團長

            // 👑【團長霸王條款】
            if (name === '陰帝') {
                teamId = TEAM_CONFIG[1].id;       // 強制去一團
                
                // --- 這裡依照您的要求修改 ---
                displayRank = '#1';               // 排名強制顯示 #1
                displayScore = '👑 大陰團長';      // 強度欄位顯示頭銜
                
                // 設定尊爵金色樣式
                rankColor = '#FFD700';            
                nameStyle = 'color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: bold; font-size: 1.1em;';
                scoreStyle = 'color: #FFD700; font-weight: bold; letter-spacing: 1px;'; // 頭銜也變金色
                
                isLeader = true;                  // 標記為團長
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
                
                // 填入 HTML
                tr.innerHTML = `
                    <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
                    <td style="${nameStyle}">${name}</td>
                    <td style="${scoreStyle}">${displayScore}</td>
                `;

                const tableBody = document.getElementById(teamId);

                // ⚡ 如果是團長，用 prepend 插隊到第一排
                if (isLeader) {
                    tableBody.prepend(tr); 
                    // 給整行加個深金色背景微光，並加上左側金邊
                    tr.style.background = 'linear-gradient(90deg, rgba(255, 215, 0, 0.15), transparent)';
                    tr.style.borderLeft = '4px solid #FFD700';
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