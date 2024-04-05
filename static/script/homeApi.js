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
        window.location.href = `/info/${encodeURIComponent(gameData.name)}`;
    }

    function createGameElement(gameData) {
        const gameBox = document.createElement('div');
        gameBox.classList.add('gameBox');

        const gameBoxFoto = document.createElement('img');
        gameBoxFoto.src = gameData.background_image;
        gameBoxFoto.alt = 'Game Image';

        const gameBoxTitle = document.createElement('h2');
        gameBoxTitle.textContent = gameData.name;

        const gameboxDescriptie = document.createElement('p');
        gameboxDescriptie.textContent = gameData.description_raw;

        const gameLink = document.createElement('a');
        gameLink.href = '#'; // We gebruiken een dummy href omdat we de standaardgedraging van de link willen voorkomen
        gameLink.textContent = gameData.name;

        // Voeg een event listener toe aan de game link om de API opnieuw te fetchen bij klikken
        gameLink.addEventListener('click', function(event) {
            event.preventDefault(); // Voorkom de standaardgedrag van de link
            fetchGameData(gameData.id); // Roep de functie aan om het spel opnieuw op te halen
        });

        gameBox.appendChild(gameBoxFoto);
        gameBox.appendChild(gameBoxTitle);
        gameBox.appendChild(gameboxDescriptie);
        gameBox.appendChild(gameLink);

        // Voeg gameBox alleen toe als we op de homepagina zijn
        if (isHomePage()) {
            const gameContainer = document.getElementById('gameContainer');
            gameContainer.appendChild(gameBox);
        }
    }

    // Controleer of de huidige pagina de homepagina is
    function isHomePage() {
        return window.location.pathname === '/' || window.location.pathname === '/index.html';
    }

    function fetchRandomGames() {
        const randomPage = Math.floor(Math.random() * 100) + 1; // Random pagina tussen 1 en 100
        const randomUrl = `${apiUrl}?page=${randomPage}&key=${apiKey}`;

        fetch(randomUrl)
            .then(response => response.json())
            .then(data => {
                const games = data.results.slice(0, 10); // Maximaal 10 spellen
                games.forEach(game => {
                    createGameElement(game);
                });
            })
            .catch(error => console.error('Er is een fout opgetreden bij het laden van de gegevens:', error));
    }

    fetchRandomGames();
});
