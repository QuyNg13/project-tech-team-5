console.log("data")

//document.getElementById('searchButton').addEventListener('click', searchGame);
//document.getElementById('gameinfo').innerHTML = gameInfo

function searchGame() {
    const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
    const apiUrl = 'https://api.rawg.io/api/games';

    const gameName = document.getElementById('gameNameInput').value;

fetch(`${apiUrl}?key=${apiKey}&search=${gameName}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const game = data.results[0]; // Assuming first result is the desired game

        if (game) {
            const gameInfo = `
              <h1>${game.name}</h1>
              <p><strong>Released:</strong> ${game.released}</p>
              <p><strong>Rating:</strong> ${game.rating}</p>
              <p><strong>Metacritic:</strong> ${game.metacritic}</p>
              <p><strong>Ratings Count:</strong> ${game.ratings_count}</p>
              <p><strong>Reviews Text Count:</strong> ${game.reviews_text_count}</p>
              <p><strong>Playtime:</strong> ${game.playtime} hours</p>
              <img scr='background_image'> ${game.background_image}</img> 
            `;
            document.getElementById('gameInfo').innerHTML = gameInfo;
        } else {
            document.getElementById('gameInfo').innerHTML = "<p>Game not found.</p>";
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

