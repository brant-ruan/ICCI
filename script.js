const indexUrl = '/conferences/index.json';

// 功能：填充选择器
function populateSelectors() {
    fetch(indexUrl)
        .then(response => response.json())
        .then(index => {
            const yearSelector = document.getElementById('year-selector');
            const conferenceSelector = document.getElementById('conference-selector');

            yearSelector.innerHTML = '';
            conferenceSelector.innerHTML = '';

            for (const year in index) {
                let yearOption = new Option(year, year);
                yearSelector.add(yearOption);
            }

            if (Object.keys(index).length > 0) {
                const firstYear = Object.keys(index)[0];
                updateConferenceSelector(index, firstYear);
            }
        })
        .catch(error => console.error('Error fetching index:', error));
}

// 功能：更新会议选择器
function updateConferenceSelector(index, selectedYear) {
    const conferenceSelector = document.getElementById('conference-selector');
    conferenceSelector.innerHTML = '';

    const conferences = index[selectedYear];
    for (const conferenceKey in conferences) {
        const conference = conferences[conferenceKey];
        conference.locations.forEach(location => {
            let option = new Option(conference.displayName + ' - ' + location.displayName, conference.pathName + '|' + location.pathName);
            conferenceSelector.add(option);
        });
    }
}

// 功能：从用户选择的会议和地点显示信息
function showConference(selection) {
    const [conferencePath, locationPath] = selection.split('|');
    const year = document.getElementById('year-selector').value;
    const contentUrl = `/conferences/${year}/${conferencePath}/${locationPath}/content.json`;

    fetch(contentUrl)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('conference-table').querySelector('tbody');
            tableBody.innerHTML = ''; // 清空现有表格

            // 创建表格行
            data.topics.forEach(topic => {
                let row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${year}</td>
                    <td>${conference}</td>
                    <td>${location}</td>
                    <td>${topic.name}</td>
                    <td>${topic.speaker}</td>
                `;
            });

            document.getElementById('conference-table').classList.remove('hidden');
        })
        .catch(error => console.error('Error fetching content:', error));
}

// 初始化页面
populateSelectors();

// 事件监听：当年份改变时，更新会议选择器
document.getElementById('year-selector').addEventListener('change', (event) => {
    fetch(indexUrl)
        .then(response => response.json())
        .then(index => {
            updateConferenceSelector(index, event.target.value);
        })
        .catch(error => console.error('Error fetching index:', error));
});

// 当用户选择一个会议时的事件处理
document.getElementById('conference-selector').addEventListener('change', (event) => {
    showConference(event.target.value);
});

// ...更多事件监听和功能实现...
