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
