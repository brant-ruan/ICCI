let globalIndex = {};

const indexUrl = '/conferences/index.json';

// 功能：填充选择器
function populateSelectors() {
    fetch(indexUrl)
        .then(response => response.json())
        .then(index => {
            globalIndex = index;
            const yearSelector = document.getElementById('year-selector');
            const conferenceSelector = document.getElementById('conference-selector');

            yearSelector.innerHTML = '';
            conferenceSelector.innerHTML = '';

            // 获取所有年份并按倒序排序
            const sortedYears = Object.keys(index).sort((a, b) => parseInt(b) - parseInt(a));
            sortedYears.forEach(year => {
                let yearOption = new Option(year, year);
                yearSelector.add(yearOption);
            });

            if (sortedYears.length > 0) {
                const latestYear = sortedYears[0];
                updateConferenceSelector(index, latestYear);

                // 显示最新年份的第一个会议的信息
                showFirstConference(index, latestYear);
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
function showConference(info) {
    const contentUrl = `/conferences/${info.year}/${info.conferencePath}/${info.locationPath}/content.json`;

    console.log('Fetching content from:', contentUrl);
    fetch(contentUrl)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('conference-table').querySelector('tbody');
            tableBody.innerHTML = ''; // 清空现有表格

            // 创建表格行
            data.topics.forEach(topic => {
                let row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${info.year}</td>
                    <td>${info.conferenceDisplayName}</td>
                    <td>${info.locationDisplayName}</td>
                    <td>${topic.name}</td>
                `;
            });

            document.getElementById('conference-table').classList.remove('hidden');
        })
        .catch(error => console.error('Error fetching content:', error));
}

// 功能：显示第一个会议的信息
function showFirstConference(index, selectedYear) {
    const firstConferenceKey = Object.keys(index[selectedYear])[0];
    const firstConference = index[selectedYear][firstConferenceKey];
    const firstLocation = firstConference.locations[0];
    const info = {
        year: selectedYear,
        conferenceDisplayName: firstConference.displayName,
        locationDisplayName: firstLocation.displayName,
        conferencePath: firstConference.pathName,
        locationPath: firstLocation.pathName
    };
    showConference(info);
}

// 功能：显示所有会议
function showAllConferences() {
    const tableBody = document.getElementById('conference-table').querySelector('tbody');
    tableBody.innerHTML = ''; // 首先清空现有表格

    // 获取所有年份并按数值倒序排序
    const years = Object.keys(globalIndex).sort((a, b) => parseInt(b) - parseInt(a));
    
    years.forEach(year => {
        const conferences = globalIndex[year];
        for (const conferenceKey in conferences) {
            const conference = conferences[conferenceKey];
            conference.locations.forEach(location => {
                const info = {
                    year: year,
                    conferenceDisplayName: conference.displayName,
                    locationDisplayName: location.displayName,
                    conferencePath: conference.pathName,
                    locationPath: location.pathName
                };
                appendConferenceInfo(info, tableBody); // 追加会议信息
            });
        }
    });

    document.getElementById('conference-table').classList.remove('hidden');
}

// 功能：追加会议信息到表格
function appendConferenceInfo(info, tableBody) {
    const contentUrl = `/conferences/${info.year}/${info.conferencePath}/${info.locationPath}/content.json`;

    fetch(contentUrl)
        .then(response => response.json())
        .then(data => {
            data.topics.forEach(topic => {
                let row = tableBody.insertRow(-1);
                row.innerHTML = `
                    <td>${info.year}</td>
                    <td>${info.conferenceDisplayName}</td>
                    <td>${info.locationDisplayName}</td>
                    <td>${topic.name}</td>
                `;
            });
        })
        .catch(error => console.error('Error fetching content:', error));
}

// 初始化页面
populateSelectors();

// 事件监听：当年份改变时，更新会议选择器
document.getElementById('year-selector').addEventListener('change', (event) => {
    const selectedYear = event.target.value;
    updateConferenceSelector(globalIndex, selectedYear);
    // // show first conference
    showFirstConference(globalIndex, selectedYear);
});

// 当用户选择一个会议时的事件处理
document.getElementById('conference-selector').addEventListener('change', (event) => {
    const selectedYear = document.getElementById('year-selector').value;
    const [conferencePath, locationPath] = event.target.value.split('|');
    const conference = globalIndex[selectedYear][conferencePath];
    const location = conference.locations.find(loc => loc.pathName === locationPath);
    const info = {
        year: selectedYear,
        conferenceDisplayName: conference.displayName,
        locationDisplayName: location.displayName,
        conferencePath: conferencePath,
        locationPath: locationPath
    };
    showConference(info);
});

// 添加事件监听器以处理 "Show All Conferences" 按钮的点击
document.getElementById('show-all').addEventListener('click', showAllConferences);