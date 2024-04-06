// Elementen selecteren
const selectedGamesContainer = document.getElementById("selectedGames");
const favoriteGamesInput = document.getElementById("favoriteGames");
const gameSuggestions = document.getElementById("gameSuggestions");

// Array voor geselecteerde spellen
let selectedGames = [];

// Voeg een event listener toe aan de toevoegknop
document.getElementById("addGameBtn").addEventListener("click", addGame);

// Voeg een event listener toe aan het inputveld voor favoriete spellen
favoriteGamesInput.addEventListener("input", getGameSuggestions);

// Functie om een spel toe te voegen
function addGame() {
    const gameName = favoriteGamesInput.value.trim();
    if (gameName !== "" && !selectedGames.includes(gameName)) {
        selectedGames.push(gameName);
        renderSelectedGames();
    }
}

// Functie om geselecteerde spellen weer te geven
function renderSelectedGames() {
    selectedGamesContainer.innerHTML = "";
    selectedGames.forEach(gameName => {
        const gameTag = document.createElement("div");
        gameTag.textContent = gameName;
        
        const removeButton = document.createElement("button");
        removeButton.textContent = "Verwijder";
        removeButton.addEventListener("click", () => {
            selectedGames = selectedGames.filter(name => name !== gameName);
            renderSelectedGames();
        });
        
        gameTag.appendChild(removeButton);
        selectedGamesContainer.appendChild(gameTag);
    });
    document.getElementById("selectedGamesInput").value = selectedGames.join(',');
    favoriteGamesInput.value = "";
}

// Functie om spellensuggesties op te halen
async function getGameSuggestions() {
    const inputValue = favoriteGamesInput.value.trim();
    if (inputValue !== "") {
        const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
        const response = await fetch(`https://api.rawg.io/api/games?search=${inputValue}&page_size=5&key=${apiKey}&multiplayer_modes=true`);
        const data = await response.json();
        displayGameSuggestions(data.results);
    } else {
        gameSuggestions.innerHTML = "";
    }
}

// Functie om spellensuggesties weer te geven
function displayGameSuggestions(results) {
    gameSuggestions.innerHTML = "";
    results.forEach(game => {
        const gameOption = document.createElement("div");
        gameOption.textContent = game.name;
        gameOption.addEventListener("click", () => {
            favoriteGamesInput.value = game.name;
            gameSuggestions.innerHTML = "";
        });
        gameSuggestions.appendChild(gameOption);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const selectedGamesContainer = document.getElementById("selectedGamesContainer");
    selectedGamesContainer.addEventListener("click", function(event) {
        if (event.target.classList.contains("removeGameBtn")) {
            const gameElement = event.target.parentNode;
            const gameToRemove = gameElement.textContent.trim();
            gameElement.parentNode.removeChild(gameElement);
            const selectedGamesInput = document.getElementById("selectedGamesInput");
            const selectedGames = selectedGamesInput.value.split(",");
            const index = selectedGames.indexOf(gameToRemove);
            if (index !== -1) {
                selectedGames.splice(index, 1);
                selectedGamesInput.value = selectedGames.join(",");
            }
        }
    });
});