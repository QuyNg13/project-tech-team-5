document.addEventListener('DOMContentLoaded', function () {
    const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
    const apiUrl = 'https://api.rawg.io/api/games';

    function fetchGameData(gameId) {
        fetch(`${apiUrl}/${gameId}?key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    displayGameData(data);
                } else {
                    console.log('Geen resultaten gevonden voor de ingevoerde spelnaam.');
                }
            })
            .catch(error => console.error('Er is een fout opgetreden bij het laden van de gegevens:', error));
    }

    function displayGameData(gameData) {
        const gameImage = document.querySelector('#gameImage');
        gameImage.src = gameData.background_image;

        const gameTitle = document.querySelector('#gameTitle');
        gameTitle.textContent = gameData.name;
    }

    // Functie om de gameId uit de URL te halen
    function getGameIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('gameId');
    }

    // Controleer of er een gameId in de URL is en laad de gegevens als dat het geval is
    const gameIdFromUrl = getGameIdFromUrl();
    if (gameIdFromUrl) {
        fetchGameData(gameIdFromUrl);
    }
});
