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
        const gameInfo = document.getElementById('gameInfo');
        gameInfo.innerHTML = ''; // Clear previous game info
    
        const gameBoxFoto = document.createElement('img');
        gameBoxFoto.src = gameData.background_image;
        gameBoxFoto.alt = 'Game Image';
    
        const gameBoxTitle = document.createElement('h2');
        gameBoxTitle.textContent = gameData.name;

        const gameboxDescriptie = document.createElement('p');
        gameboxDescriptie.textContent = gameData.description_raw;
    
        gameInfo.appendChild(gameBoxFoto);
        gameInfo.appendChild(gameBoxTitle);
        gameInfo.appendChild(gameboxDescriptie);
    }

    // Haal gameId uit de URL
    const gameId = window.location.pathname.split('/').pop();
    fetchGameData(gameId);
});
