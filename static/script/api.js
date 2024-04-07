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
        document.getElementById('gameTitle').textContent = gameData.name;
        document.getElementById('platforms').textContent = gameData.platforms.map(platform => platform.platform.name).join(', ');
        document.getElementById('genres').textContent = gameData.genres.map(genre => genre.name).join(', ');
        document.getElementById('multiplayer').textContent = gameData.tags.some(tag => tag.slug === 'multiplayer') ? 'Yes' : 'No';

        const currentUrl = window.location.href;
        const storesList = gameData.stores.map(store => `<a href="${store.store.domain}" target="_blank">${store.store.name}</a>`).join(', ');
        document.getElementById('buy').innerHTML = `${storesList}`;        

        document.getElementById('description').textContent = gameData.description_raw;
        document.getElementById('gameImage').src = gameData.background_image;

        const maxWords = 50;
        const descriptionWords = gameData.description_raw.split(' ').slice(0, maxWords).join(' ');
        document.getElementById('description').textContent = descriptionWords.length < gameData.description_raw.length ? descriptionWords + '...' : descriptionWords;

        document.getElementById('gameImage').src = gameData.background_image;

    }

    
    // Haal gameId uit de URL
    const gameId = window.location.pathname.split('/').pop();
    fetchGameData(gameId);
});