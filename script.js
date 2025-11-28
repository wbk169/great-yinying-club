// 設定檔案路徑
const CSV_FILE_PATH = 'rankings.csv';

// 團別對應設定 (注意：人數限制邏輯已寫在下方判斷式中)
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

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length < 3) return;

            const rank = parseInt(columns[0].trim());
            const name = columns[1].trim();
            const score = columns[2].trim();

            let teamId = null;
            let displayRank = '';
            let displayScore = `(PR: ${score})`;
            let rankColor = '#00FFFF'; // 預設螢光藍
            let nameStyle = '';
            let scoreStyle = 'color:#aaa; font-size:0.9em;';
            let isLeader = false;

            // 👑【團長霸王條款】
            if (name === '陰帝') {
                teamId = TEAM_CONFIG[1].id;
                displayRank = '#1';               // 團長永遠是 #1
                displayScore = '👑 大陰團長';
                rankColor = '#FFD700';            // 金色
                nameStyle = 'color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: bold; font-size: 1.1em;';
                scoreStyle = 'color: #FFD700; font-weight: bold; letter-spacing: 1px;';
                isLeader = true;
            } 
            // 🛡️【一般平民邏輯】
            else {
                // ⚡ 修正 A：所有人的顯示排名 +1，把 #1 讓給團長
                // 例如：戰力第1名 -> 顯示 #2
                displayRank = `#${rank + 1}`;

                // ⚡ 修正 B：調整分團門檻，確保每團 20 人
                // 一團：團長 + 戰力 1~19 名 (共 20 人)
                // 二團：戰力 20~39 名 (共 20 人) ...以此類推
                if (rank <= 19) teamId = TEAM_CONFIG[1].id;
                else if (rank <= 39) teamId = TEAM_CONFIG[2].id;
                else if (rank <= 59) teamId = TEAM_CONFIG[3].id;
                else if (rank <= 79) teamId = TEAM_CONFIG[4].id;
                else teamId = TEAM_CONFIG[5].id;
            }

            // --- 生成表格 ---
            if (teamId) {
                const tr = document.createElement('tr');
                tr.style.animation = `fadeIn 0.5s ease forwards`;
                
                tr.innerHTML = `
                    <td style="font-weight:bold; color:${rankColor}; white-space:nowrap;">${displayRank}</td>
                    <td style="${nameStyle}">${name}</td>
                    <td style="${scoreStyle}">${displayScore}</td>
                `;

                const tableBody = document.getElementById(teamId);

                // 如果是團長，插隊到第一排
                if (isLeader) {
                    tableBody.prepend(tr); 
                    tr.style.background = 'linear-gradient(90deg, rgba(255, 215, 0, 0.15), transparent)';
                    tr.style.borderLeft = '4px solid #FFD700';
                } else {
                    tableBody.appendChild(tr);
                }
            }
        });

        const today = new Date();
        document.getElementById('update-date').textContent = 
            `${today.getFullYear()}/${String(today.getMonth()+1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    } catch (error) {
        console.error('讀取數據失敗:', error);
    }
}

loadRankings();