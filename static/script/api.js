document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'https://api.rawg.io/api/games';
    const inputField = document.getElementById('gameNameInput'); // Inputveld voor de spelnaam

    // Functie om gegevens van de API op te halen en in te vullen op basis van de ingevoerde spelnaam
    function fetchGameData(gameName) {
        // Haal de gegevens van de API op
        fetch(apiUrl + `?search=${gameName}`)
            .then(response => response.json())
            .then(data => {
                // Controleer of er resultaten zijn gevonden
                if (data.results.length > 0) {
                    const gameData = data.results[0]; // Neem het eerste resultaat
                    // Vul de HTML-inhoud in met de informatie van het spel
                    document.querySelector('h1').textContent = gameData.name;
                    document.querySelector('img').src = gameData.background_image;
                    document.querySelector('ul li:nth-child(1) p').textContent = `Op de volgende console beschikbaar: ${gameData.platforms.map(platform => platform.platform.name).join(', ')}`;
                    document.querySelector('ul li:nth-child(2) p').textContent = `Genre: ${gameData.genres.map(genre => genre.name).join(', ')}`;
                    document.querySelector('ul li:nth-child(3) p').textContent = gameData.game_modes.includes('coop') ? 'CO-OP' : 'PVP';
                    document.querySelector('ul li:nth-child(4) p').textContent = `Koop dit spel nu hier: ${gameData.stores.map(store => store.store.name).join(', ')}`;
                    document.querySelector('ul li:nth-child(5) p').textContent = `Korte beschrijving: ${gameData.description}`;
                } else {
                    // Geen resultaten gevonden
                    console.log('Geen resultaten gevonden voor de ingevoerde spelnaam.');
                }
            })
            .catch(error => console.error('Er is een fout opgetreden bij het laden van de gegevens:', error));
    }

    // Event listener voor het invoerveld, om de gegevens op te halen wanneer de gebruiker iets invoert
    inputField.addEventListener('input', function () {
        const gameName = inputField.value.trim(); // Trim om eventuele extra spaties te verwijderen
        if (gameName !== '') {
            fetchGameData(gameName);
        }
    });
});
