// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// 團別對應設定
const TEAM_CONFIG = {
    1: { name: '大陰帝國', id: 'team1-body', limit: 20 },
    2: { name: '大陰帝國-稽查菊', id: 'team2-body', limit: 40 },
    3: { name: '大陰帝國-手入與支出', id: 'team3-body', limit: 60 },
    4: { name: '大陰帝國-抽查桃稅', id: 'team4-body', limit: 80 },
    5: { name: '大陰帝國-天龍特攻隊', id: 'team5-body', limit: 100 }
};

async function loadRankings() {
    try {
        const response = await fetch(CSV_FILE_PATH);
        const csvText = await response.text();
        
        // 分割每一行
        const rows = csvText.trim().split('\n').slice(1); // 去除標題列

        rows.forEach(row => {
            // 解析 CSV
            const columns = row.split(',');
            if (columns.length < 3) return;

            const rank = parseInt(columns[0].trim());
            const name = columns[1].trim();
            const score = columns[2].trim();

            // --- 邏輯判斷區 ---
            let teamId = null;
            let displayRank = `#${rank}`; // 預設顯示排名 (例如 #23)
            let rankColor = '#00FFFF';    // 預設排名顏色 (螢光藍)
            let nameStyle = '';           // 預設名字樣式

            // 👑【團長霸王條款】
            if (name === '陰帝') {
                teamId = TEAM_CONFIG[1].id;       // 強制鎖定在一團
                displayRank = '👑 大陰團長';      // 強制修改排名文字
                rankColor = '#FFD700';            // 改成尊爵金色
                nameStyle = 'color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: bold;'; // 名字也發金光
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
                tr.innerHTML = `
                    <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
                    <td style="${nameStyle}">${name}</td>
                    <td style="color:#aaa; font-size:0.9em;">(PR: ${score})</td>
                `;
                document.getElementById(teamId).appendChild(tr);
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