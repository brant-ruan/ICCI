// 假设有一个会议数据的 JSON 文件或对象
const conferences = {
    "2022": {
        "Black Hat USA": [
            { "location": "Las Vegas", "topic": "Security Topic 1", "speaker": "Speaker Name 1" },
            // ...更多议题
        ],
        // ...更多会议
    },
    // ...更多年份
};

// 功能：填充选择器
function populateSelectors() {
    const conferenceSelector = document.getElementById('conference-selector');
    const yearSelector = document.getElementById('year-selector');

    // 填充会议选择器
    for (const conference in conferences["2022"]) { // 假设默认显示2022年
        let option = new Option(conference, conference);
        conferenceSelector.add(option);
    }

    // 填充年份选择器
    for (const year in conferences) {
        let option = new Option(year, year);
        yearSelector.add(option);
    }
}

// 功能：显示所有会议
function showAllConferences() {
    // 清空现有表格
    const tableBody = document.getElementById('conference-table').querySelector('tbody');
    tableBody.innerHTML = '';

    // 循环遍历会议数据，创建表格行
    for (const year in conferences) {
        for (const conference in conferences[year]) {
            conferences[year][conference].forEach(topic => {
                let row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${year}</td>
                    <td>${conference}</td>
                    <td>${topic.location}</td>
                    <td>${topic.topic}</td>
                    <td>${topic.speaker}</td>
                `;
            });
        }
    }
    document.getElementById('conference-table').classList.remove('hidden');
}

// 初始化页面
populateSelectors();

// 事件监听
document.getElementById('show-all').addEventListener('click', showAllConferences);

// 更多事件监听和功能实现...
