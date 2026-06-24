const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const recommendationsSection = document.getElementById('recommendations');
const resultsContainer = document.getElementById('resultsContainer');

function getLocalTime(placeName) {
    if (!placeName) return 'UTC';
    let timeZone = 'UTC';
    const name = placeName.toLowerCase();
    
    if (name.includes('sydney')) timeZone = 'Australia/Sydney';
    else if (name.includes('melbourne')) timeZone = 'Australia/Melbourne';
    else if (name.includes('tokyo')) timeZone = 'Asia/Tokyo';
    else if (name.includes('kyoto')) timeZone = 'Asia/Tokyo';
    else if (name.includes('rio') || name.includes('copacabana')) timeZone = 'America/Rio_De_Janeiro';
    else if (name.includes('são paulo') || name.includes('sao')) timeZone = 'America/Sao_Paulo';
    else if (name.includes('angkor')) timeZone = 'Asia/Phnom_Penh';
    else if (name.includes('taj')) timeZone = 'Asia/Kolkata';
    else if (name.includes('bora')) timeZone = 'Pacific/Tahiti';

    try {
        const options = { timeZone: timeZone, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return new Date().toLocaleTimeString('en-US', options);
    } catch (e) {
        return new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric' });
    }
}

function renderResults(places) {
    resultsContainer.innerHTML = '';
    
    if (places && places.length > 0) {
        recommendationsSection.classList.remove('hidden');
        
        places.forEach(place => {
            const currentTime = getLocalTime(place.name);
            const cardHTML = `
                <div class="card">
                    <img src="${place.imageUrl}" alt="${place.name}">
                    <div class="card-content">
                        <h3>${place.name}</h3>
                        <p>${place.description}</p>
                        <span class="local-time">🕒 Local Time: ${currentTime}</span>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML += cardHTML;
        });

        recommendationsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('No recommendations found. Try "beach", "temple", or a country like "Japan".');
        recommendationsSection.classList.add('hidden');
    }
}

function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        alert('Please enter a keyword.');
        return;
    }

    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response structure returned errors.');
            return response.json();
        })
        .then(data => {
            console.log('Fetched API Data Object:', data);
            let matchedResults = [];

            // 1. Check for Beach keywords
            if (query === 'beach' || query === 'beaches') {
                matchedResults = data.beaches;
            } 
            // 2. Check for Temple keywords
            else if (query === 'temple' || query === 'temples') {
                matchedResults = data.temples;
            } 
            // 3. Flexible Country/City keyword search
            else {
                // Find a country where the name includes what the user typed (e.g., "japan" or "australia")
                const countryMatch = data.countries.find(c => c.name.toLowerCase().includes(query));
                
                if (countryMatch) {
                    matchedResults = countryMatch.cities;
                } else {
                    // Wildcard fallback: check if they typed a specific city name directly
                    data.countries.forEach(country => {
                        const cityMatches = country.cities.filter(city => city.name.toLowerCase().includes(query));
                        if (cityMatches.length > 0) {
                            matchedResults = matchedResults.concat(cityMatches);
                        }
                    });
                }
            }
            
            // Send the results to the display function
            renderResults(matchedResults);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Unable to load recommendation data.');
        });
}

function clearSearch() {
    searchInput.value = '';
    resultsContainer.innerHTML = '';
    recommendationsSection.classList.add('hidden');
}

btnSearch.addEventListener('click', handleSearch);
btnClear.addEventListener('click', clearSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});