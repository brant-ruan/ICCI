let globalIndex = {};
let globalContent = {}; // 新的全局变量来存储所有会议内容
let originalHTML = {};


const indexUrl = '/conferences/index.json';

let searchTimeout;

async function populateSelectors() {
    document.getElementById('loading').style.display = 'block'; // 显示进度条
    document.getElementById('conference-table').classList.add('hidden'); // 隐藏表格
    try {
        const indexResponse = await fetch(indexUrl);
        const index = await indexResponse.json();
        globalIndex = index;
        globalContent = {}; // 初始化全局内容对象

        const yearSelector = document.getElementById('year-selector');
        const conferenceSelector = document.getElementById('conference-selector');

        yearSelector.innerHTML = '';
        conferenceSelector.innerHTML = '';

        const sortedYears = Object.keys(index).sort((a, b) => parseInt(b) - parseInt(a));
        for (const year of sortedYears) {
            let yearOption = new Option(year, year);
            yearSelector.add(yearOption);
            const conferences = index[year];
            for (const conferenceKey in conferences) {
                const conference = conferences[conferenceKey];
                for (const location of conference.locations) {
                    const contentUrl = `/conferences/${year}/${conference.pathName}/${location.pathName}/content.json`;
                    const contentResponse = await fetch(contentUrl);
                    const content = await contentResponse.json();
                    if (!globalContent[year]) {
                        globalContent[year] = {};
                    }
                    if (!globalContent[year][conference.pathName]) {
                        globalContent[year][conference.pathName] = {};
                    }
                    globalContent[year][conference.pathName][location.pathName] = content;
                }
            }
        }
        // 更新会议选择器并显示最新年份的会议
        if (sortedYears.length > 0) {
            const latestYear = sortedYears[0];
            updateConferenceSelector(index, latestYear);
            showAllConferencesForYear(latestYear);
        }
    } catch (error) {
        console.error('Error fetching index:', error);
    }
    document.getElementById('loading').style.display = 'none'; // 隐藏进度条
    document.getElementById('conference-table').classList.remove('hidden'); // 显示表格
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(td, filter, rowIndex) {
    if (!originalHTML[rowIndex]) {
        originalHTML[rowIndex] = td.innerHTML;
    }

    const innerHtml = td.innerHTML;
    const regExp = new RegExp(filter, 'gi');
    td.innerHTML = innerHtml.replace(regExp, function(matched) {
        return "<span class='highlight'>" + matched + "</span>";
    });
}

function resetText(td, rowIndex) {
    if (originalHTML[rowIndex]) {
        // 恢复原始 HTML
        td.innerHTML = originalHTML[rowIndex];
        // td.innerHTML = td.innerHTML.replace(/<span class='highlight'>(.*?)<\/span>/gi, "$1");
    }
}


function clearOriginalHTML() {
    originalHTML = {};
}

function searchFunction() {
    // clearOriginalHTML();
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
        var input, filter, table, tr, td, i;
        input = document.getElementById("searchInput");
        filter = input.value.toUpperCase();

        table = document.getElementById("conference-table");
        tr = table.getElementsByTagName("tr");

        if (filter.length === 0) {
            // 如果搜索框为空，则显示所有行并移除高亮
            for (i = 0; i < tr.length; i++) {
                tr[i].style.display = "";
                td = tr[i].getElementsByTagName("td")[3];
                if (td) {
                    resetText(td, i);
                }
            }
            return;
        }

        if (filter.length <= 2) {
            // 如果输入的字符数小于最小限制，则不执行搜索
            return;
        }

        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[3];
            if (td) {
                var rowIndex = tr[i].rowIndex;
                var txtValue = td.textContent || td.innerText;
                var upperTxtValue = txtValue.toUpperCase();
                var escapeFilter = escapeRegExp(filter);
                if (upperTxtValue.indexOf(filter) > -1) {
                    tr[i].style.display = "";
                    highlightText(td, escapeFilter, rowIndex);
                } else {
                    tr[i].style.display = "none";
                    resetText(td, rowIndex);
                }
            }
        }
    }, 500); // 延迟500毫秒执行搜索
}

function updateConferenceSelector(index, selectedYear) {
    const conferenceSelector = document.getElementById('conference-selector');
    conferenceSelector.innerHTML = '';

    let allOption = new Option("All", "all");
    conferenceSelector.add(allOption);

    const conferences = index[selectedYear];
    for (const conferenceKey in conferences) {
        const conference = conferences[conferenceKey];
        conference.locations.forEach(location => {
            let option = new Option(conference.displayName + ' - ' + location.displayName, conference.pathName + '|' + location.pathName);
            conferenceSelector.add(option);
        });
    }
}

function showConference(info) {
    const data = globalContent[info.year][info.conferencePath][info.locationPath];
    const tableBody = document.getElementById('conference-table').querySelector('tbody');
    tableBody.innerHTML = '';

    data.topics.forEach(topic => {
        let row = tableBody.insertRow();
        let videoLink = topic.video ? `<a href="${topic.video}" target="_blank">🎬</a>` : '';
        let academicLink = topic.academic ? `<span style="color: red;"> [${topic.academic}]</span>` : '';
        row.innerHTML = `
            <td>${info.year}</td>
            <td>${info.conferenceDisplayName}</td>
            <td>${info.locationDisplayName}</td>
            <td>${topic.name}${academicLink}</td>
            <td>${videoLink}</td>
        `;
    });

    document.getElementById('conference-table').classList.remove('hidden');
}

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

async function showAllConferences() {
    const tableBody = document.getElementById('conference-table').querySelector('tbody');
    tableBody.innerHTML = '';

    // 获取所有年份并按照倒序排序
    const years = Object.keys(globalContent).sort((a, b) => parseInt(b) - parseInt(a));

    for (const year of years) {
        const conferences = globalContent[year];
        for (const conferenceKey in conferences) {
            const conference = globalIndex[year][conferenceKey];
            for (const locationKey in conferences[conferenceKey]) {
                const location = conference.locations.find(loc => loc.pathName === locationKey);
                const data = conferences[conferenceKey][locationKey];
                data.topics.forEach(topic => {
                    let row = tableBody.insertRow(-1);
                    let videoLink = topic.video ? `<a href="${topic.video}" target="_blank">🎬</a>` : '';
                    let academicLink = topic.academic ? `<span style="color: red;"> [${topic.academic}]</span>` : '';
                    row.innerHTML = `
                        <td>${year}</td>
                        <td>${conference.displayName}</td>
                        <td>${location.displayName}</td>
                        <td>${topic.name}${academicLink}</td>
                        <td>${videoLink}</td>
                    `;
                });
            }
        }
    }

    document.getElementById('conference-table').classList.remove('hidden');
}

async function showAllConferencesForYear(year) {
    const tableBody = document.getElementById('conference-table').querySelector('tbody');
    tableBody.innerHTML = '';

    const conferences = globalContent[year];
    for (const conferenceKey in conferences) {
        const conference = globalIndex[year][conferenceKey];
        for (const locationKey in conferences[conferenceKey]) {
            const location = conference.locations.find(loc => loc.pathName === locationKey);
            const data = conferences[conferenceKey][locationKey];
            data.topics.forEach(topic => {
                let row = tableBody.insertRow(-1);
                let videoLink = topic.video ? `<a href="${topic.video}" target="_blank">🎬</a>` : '';
                let academicLink = topic.academic ? `<span style="color: red;"> [${topic.academic}]</span>` : '';
                row.innerHTML = `
                    <td>${year}</td>
                    <td>${conference.displayName}</td>
                    <td>${location.displayName}</td>
                    <td>${topic.name}${academicLink}</td>
                    <td>${videoLink}</td>
                `;
            });
        }
    }

    document.getElementById('conference-table').classList.remove('hidden');
}

async function appendConferenceInfo(info, tableBody) {
    const contentUrl = `/conferences/${info.year}/${info.conferencePath}/${info.locationPath}/content.json`;

    await fetch(contentUrl)
        .then(response => response.json())
        .then(data => {
            data.topics.forEach(topic => {
                let row = tableBody.insertRow(-1);
                let videoLink = topic.video ? `<a href="${topic.video}" target="_blank">🎬</a>` : '';
                let academicLink = topic.academic ? `<span style="color: red;"> [${topic.academic}]</span>` : '';
                row.innerHTML = `
                    <td>${info.year}</td>
                    <td>${info.conferenceDisplayName}</td>
                    <td>${info.locationDisplayName}</td>
                    <td>${topic.name}${academicLink}</td>
                    <td>${videoLink}</td>
                `;
            });
        })
        .catch(error => console.error('Error fetching content:', error));
}

function showAcademicStudies() {
    const tableBody = document.getElementById('conference-table').querySelector('tbody');
    tableBody.innerHTML = '';

    // 获取所有年份并按照倒序排序
    const years = Object.keys(globalContent).sort((a, b) => parseInt(b) - parseInt(a));

    for (const year of years) {
        const conferences = globalContent[year];
        for (const conferenceKey in conferences) {
            const conference = globalIndex[year][conferenceKey];
            for (const locationKey in conferences[conferenceKey]) {
                const location = conference.locations.find(loc => loc.pathName === locationKey);
                const data = conferences[conferenceKey][locationKey];
                data.topics.filter(topic => topic.academic).forEach(topic => {
                    let row = tableBody.insertRow(-1);
                    let videoLink = topic.video ? `<a href="${topic.video}" target="_blank">🎬</a>` : '';
                    let academicLink = topic.academic ? `<span style="color: red;"> [${topic.academic}]</span>` : '';
                    row.innerHTML = `
                        <td>${year}</td>
                        <td>${conference.displayName}</td>
                        <td>${location.displayName}</td>
                        <td>${topic.name}${academicLink}</td>
                        <td>${videoLink}</td>
                    `;
                });
            }
        }
    }

    document.getElementById('conference-table').classList.remove('hidden');
}

document.getElementById('year-selector').addEventListener('change', (event) => {
    const selectedYear = event.target.value;
    updateConferenceSelector(globalIndex, selectedYear);
    // show first conference
    showAllConferencesForYear(selectedYear);
});

document.getElementById('conference-selector').addEventListener('change', (event) => {
    const selectedYear = document.getElementById('year-selector').value;
    const selectedValue = event.target.value;

    if (selectedValue === "all") {
        // 显示该年份的所有会议议题
        showAllConferencesForYear(selectedYear);
    } else {
        const [conferencePath, locationPath] = selectedValue.split('|');
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
    }
});

document.getElementById('show-all').addEventListener('click', showAllConferences);
document.getElementById('show-academic').addEventListener('click', showAcademicStudies);

populateSelectors();