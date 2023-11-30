let globalIndex = {};

const indexUrl = '/conferences/index.json';

function searchFunction() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("conference-table");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[3];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function populateSelectors() {
    fetch(indexUrl)
        .then(response => response.json())
        .then(index => {
            globalIndex = index;
            const yearSelector = document.getElementById('year-selector');
            const conferenceSelector = document.getElementById('conference-selector');

            yearSelector.innerHTML = '';
            conferenceSelector.innerHTML = '';

            const sortedYears = Object.keys(index).sort((a, b) => parseInt(b) - parseInt(a));
            sortedYears.forEach(year => {
                let yearOption = new Option(year, year);
                yearSelector.add(yearOption);
            });

            if (sortedYears.length > 0) {
                const latestYear = sortedYears[0];
                updateConferenceSelector(index, latestYear);

                showFirstConference(index, latestYear);
            }
        })
        .catch(error => console.error('Error fetching index:', error));
}

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

function showConference(info) {
    const contentUrl = `/conferences/${info.year}/${info.conferencePath}/${info.locationPath}/content.json`;

    // console.log('Fetching content from:', contentUrl);
    fetch(contentUrl)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('conference-table').querySelector('tbody');
            tableBody.innerHTML = '';

            data.topics.forEach(topic => {
                let row = tableBody.insertRow();
                let videoLink = topic.video ? `<a href="${topic.video}" target="_blank">🎬</a>` : '';
                row.innerHTML = `
                    <td>${info.year}</td>
                    <td>${info.conferenceDisplayName}</td>
                    <td>${info.locationDisplayName}</td>
                    <td>${topic.name}</td>
                    <td>${videoLink}</td>
                `;
            });

            document.getElementById('conference-table').classList.remove('hidden');
        })
        .catch(error => console.error('Error fetching content:', error));
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

    const years = Object.keys(globalIndex).sort((a, b) => parseInt(b) - parseInt(a));
    // console.log('Years:', years);
    for (const year of years) {
        const conferences = globalIndex[year];
        // console.log('Year:', year, 'Conferences:', conferences);
        for (const conferenceKey in conferences) {
            const conference = conferences[conferenceKey];
            for (const location of conference.locations) {
                const info = {
                    year: year,
                    conferenceDisplayName: conference.displayName,
                    locationDisplayName: location.displayName,
                    conferencePath: conference.pathName,
                    locationPath: location.pathName
                };
                await appendConferenceInfo(info, tableBody);
            }
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
                row.innerHTML = `
                    <td>${info.year}</td>
                    <td>${info.conferenceDisplayName}</td>
                    <td>${info.locationDisplayName}</td>
                    <td>${topic.name}</td>
                    <td>${videoLink}</td>
                `;
            });
        })
        .catch(error => console.error('Error fetching content:', error));
}

populateSelectors();

document.getElementById('year-selector').addEventListener('change', (event) => {
    const selectedYear = event.target.value;
    updateConferenceSelector(globalIndex, selectedYear);
    // show first conference
    showFirstConference(globalIndex, selectedYear);
});

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

document.getElementById('show-all').addEventListener('click', showAllConferences);
