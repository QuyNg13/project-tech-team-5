
//je kan hier een taal selecteren

const countrySelect = document.querySelector('select#taal-select');

// Haal talen op uit de API
fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
        let allLanguages = [];
        data.forEach(country => {
            const languages = Object.values(country.languages);
            languages.forEach(language => {
                if (!allLanguages.includes(language)) {
                    allLanguages.push(language);
                    const option = document.createElement('option');
                    option.value = language;
                    option.textContent = language;
                    countrySelect.appendChild(option);
                }
            });
        });
    })
    .catch(error => console.error('Fout bij het ophalen van talen:', error));

    // welke console je speelt
    const consoleSelect = document.getElementById('console-select');

    const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
    const apiUrl = 'https://api.rawg.io/api/platforms';
    
    // Haal consoles op uit de API
    fetch(apiUrl + '?key=' + apiKey)
        .then(response => response.json())
        .then(data => {
            // Loop door de resultaten en voeg consoles toe aan de dropdown
            data.results.forEach(console => {
                const option = document.createElement('option');
                option.value = console.id;
                option.textContent = console.name;
                consoleSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Fout bij het ophalen van consoles:', error));

