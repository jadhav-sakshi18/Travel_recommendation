document.getElementById('btnSearch').addEventListener('click', searchRecommendations);
document.getElementById('btnClear').addEventListener('click', clearResults);

function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const searchBlock = document.getElementById('nav-search-block');
    if (sectionId === 'home') {
        document.getElementById('home-section').classList.add('active');
        searchBlock.style.display = 'flex';
    } else if (sectionId === 'about') {
        document.getElementById('about-section').classList.add('active');
        searchBlock.style.display = 'none';
    } else if (sectionId === 'contact') {
        document.getElementById('contact-section').classList.add('active');
        searchBlock.style.display = 'none';
    }
    clearResults();
}

function searchRecommendations() {
    const input = document.getElementById('srcInput').value.toLowerCase().trim();
    const resultDiv = document.getElementById('result-container');
    resultDiv.innerHTML = ''; 

    if (!input) {
        resultDiv.innerHTML = '<p class="status-msg">Please enter a search keyword.</p>';
        return;
    }

    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to capture API resources.');
            return response.json();
        })
        .then(data => {
            let matches = [];

            // Task 7 logic variations matching engine
            if (input === 'beach' || input === 'beaches') {
                matches = data.beaches || [];
            } else if (input === 'temple' || input === 'temples') {
                matches = data.temples || [];
            } else if (input === 'country' || input === 'countries') {
                if (data.countries) {
                    data.countries.forEach(country => {
                        if (country.cities) matches.push(...country.cities);
                    });
                }
            } else {
                // Individual direct match search logic checks (e.g. searching "Japan" or "Australia")
                if (data.countries) {
                    const foundCountry = data.countries.find(c => c.name.toLowerCase() === input);
                    if (foundCountry && foundCountry.cities) {
                        matches = foundCountry.cities;
                    }
                }
            }

            if (matches.length > 0) {
                displayResults(matches);
            } else {
                resultDiv.innerHTML = '<p class="status-msg">No recommendations found for your keyword.</p>';
            }
        })
        .catch(error => {
            console.error('Data acquisition error:', error);
            resultDiv.innerHTML = '<p class="status-msg">Error retrieving recommendations.</p>';
        });
}

function displayResults(items) {
    const resultDiv = document.getElementById('result-container');
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('result-card');

        // TASK 10 OPTIONAL: Wrapped inside a try/catch block to prevent breaking country search if a timezone string is invalid
        let displayTime = "";
        if (item.timeZone) {
            try {
                const options = { timeZone: item.timeZone, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
                const formattedTime = new Date().toLocaleTimeString('en-US', options);
                displayTime = `<p class="local-time">Local Time: ${formattedTime}</p>`;
            } catch (e) {
                console.warn(`Invalid timezone format encountered: ${item.timeZone}`);
                displayTime = ""; // Skip rendering time but still render the country/city card safely!
            }
        }

        card.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="card-info">
                <h3>${item.name}</h3>
                ${displayTime}
                <p>${item.description}</p>
                <button class="btn-visit">Visit</button>
            </div>
        `;
        resultDiv.appendChild(card);
    });
}

function clearResults() {
    document.getElementById('srcInput').value = '';
    document.getElementById('result-container').innerHTML = '';
}