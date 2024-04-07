document.addEventListener('DOMContentLoaded', function () {
    const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
    const apiUrl = 'https://api.rawg.io/api/games';

    // Functie om te controleren of de huidige pagina de homepagina is
    function isHomePage() {
        return window.location.pathname === '/' || window.location.pathname === '/index.html';
    }

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
        window.location.href = `/info/${gameData.id}`; // Gebruik het ID van het spel in plaats van de naam
    }
    
    function createGameElement(gameData) {
        const gameBox = document.createElement('div');
        gameBox.classList.add('gameBox');

        const gameBoxFoto = document.createElement('img');
        gameBoxFoto.src = gameData.background_image;
        gameBoxFoto.alt = 'Game Image';

        const gameBoxTitle = document.createElement('p');
        gameBoxTitle.textContent = gameData.name;

        const gameLink = document.createElement('a');
        gameLink.href = `#${gameData.id}`; // Verwijs naar het ID van het spel
        gameLink.textContent = 'Click here for more!';        

        // Voeg een event listener toe aan de game link om de API opnieuw te fetchen bij klikken
        gameLink.addEventListener('click', function(event) {
            event.preventDefault(); // Voorkom de standaardgedrag van de link
            fetchGameData(gameData.id); // Roep de functie aan om het spel opnieuw op te halen
        });

        gameBox.appendChild(gameBoxFoto);
        gameBox.appendChild(gameBoxTitle);
        gameBox.appendChild(gameLink);

        // Voeg gameBox alleen toe als we op de homepagina zijn
        if (isHomePage()) {
            const gameContainer = document.getElementById('gameContainer');
            gameContainer.appendChild(gameBox);
        }
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

    function fetchSearchedGame(searchTerm) {
        fetch(`${apiUrl}?search=${encodeURIComponent(searchTerm)}&key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const games = data.results;
                games.forEach(game => {
                    createGameElement(game);
                });
            })
            .catch(error => console.error('Er is een fout opgetreden bij het laden van de gegevens:', error));
    }

    // Nieuwe functie voor het ophalen van games op basis van geselecteerde genres
    function fetchGamesByGenres(genres) {
        const genreQueryString = genres.map(genre => `genres=${genre}`).join('&');
        const url = `${apiUrl}?${genreQueryString}&key=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const games = data.results;
                games.forEach(game => {
                    createGameElement(game);
                });
            })
            .catch(error => console.error('Er is een fout opgetreden bij het laden van de gegevens:', error));
    }

    // Voeg een eventlistener toe aan het zoekveld, alleen als we op de homepagina zijn
    if (isHomePage()) {
        const searchInput = document.querySelector('.search');
        searchInput.addEventListener('change', function(event) {
            const searchTerm = event.target.value;
            if (searchTerm.trim() !== '') {
                // Verwijder alle huidige games van de homepagina
                const gameContainer = document.getElementById('gameContainer');
                gameContainer.innerHTML = '';

                // Haal de games op die overeenkomen met de zoekterm
                fetchSearchedGame(searchTerm);
            } else {
                // Als het zoekveld leeg is, haal willekeurige games op
                fetchRandomGames();
            }
        });

        // Voeg een event listener toe aan de dropdown voor genres
        const genreDropdown = document.getElementById('genres');
        genreDropdown.addEventListener('change', function(event) {
            const selectedGenres = Array.from(event.target.selectedOptions, option => option.value);
            if (selectedGenres.length > 0) {
                // Verwijder alle huidige games van de homepagina
                const gameContainer = document.getElementById('gameContainer');
                gameContainer.innerHTML = '';

                // Haal de games op die overeenkomen met de geselecteerde genres
                fetchGamesByGenres(selectedGenres);
            } else {
                // Als er geen genres zijn geselecteerd, haal willekeurige games op
                fetchRandomGames();
            }
        });
    }

    // Haal willekeurige games op bij het laden van de pagina, alleen als we op de homepagina zijn
    if (isHomePage()) {
        fetchRandomGames();
    }
});
