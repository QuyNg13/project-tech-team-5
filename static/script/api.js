document.addEventListener('DOMContentLoaded', function () {
    const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
    const apiUrl = 'https://api.rawg.io/api/games';

    function fetchGameData(gameName) {
        fetch(`${apiUrl}?search=${gameName}`)
            .then(response => response.json())
            .then(data => {
                if (data.results.length > 0) {
                    const gameData = data.results[0];
                    displayGameData(gameData);
                } else {
                    console.log('Geen resultaten gevonden voor de ingevoerde spelnaam.');
                }
            })
            .catch(error => console.error('Er is een fout opgetreden bij het laden van de gegevens:', error));
    }

    function displayGameData(gameData) {
        document.querySelector('h1').textContent = gameData.name;
        document.querySelector('img:nth-child(2)').src = gameData.background_image;
        document.querySelector('ul li:nth-child(1) p').textContent = `Op de volgende console beschikbaar: ${gameData.platforms.map(platform => platform.platform.name).join(', ')}`;
        document.querySelector('ul li:nth-child(2) p').textContent = `Genre: ${gameData.genres.map(genre => genre.name).join(', ')}`;
        document.querySelector('ul li:nth-child(3) p').textContent = gameData.game_modes.includes('coop') ? 'CO-OP' : 'PVP';
        document.querySelector('ul li:nth-child(4) p').textContent = `Koop dit spel nu hier: ${gameData.stores.map(store => store.store.name).join(', ')}`;
        document.querySelector('ul li:nth-child(5) p').textContent = `Korte beschrijving: ${gameData.description}`;
    }

    // Controleer of er een game-naam in de URL is en laad de gegevens als dat het geval is
    const urlParams = new URLSearchParams(window.location.search);
    const gameNameFromUrl = urlParams.get('gameName');
    if (gameNameFromUrl) {
        gameNameInput.value = gameNameFromUrl;
        fetchGameData(gameNameFromUrl);
    }


});
