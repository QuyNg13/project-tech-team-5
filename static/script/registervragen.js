document.getElementById("favoriteGames").addEventListener("input", async function(event) {
    const inputValue = event.target.value;
    if (inputValue.trim() !== "") {
        const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
        const response = await fetch(`https://api.rawg.io/api/games?search=${inputValue}&page_size=5&key=${apiKey}`);
        // const response = await fetch(`https://api.rawg.io/api/games?search=${inputValue}&page_size=5`);
        const data = await response.json();
        const gameSuggestions = document.getElementById("gameSuggestions");
        gameSuggestions.innerHTML = "";
        data.results.forEach(game => {
            const gameOption = document.createElement("div");
            gameOption.textContent = game.name;
            gameOption.classList.add("game-option");
            gameOption.addEventListener("click", function() {
                document.getElementById("favoriteGames").value = game.name;
                gameSuggestions.innerHTML = "";
            });
            gameSuggestions.appendChild(gameOption);
        });
    } else {
        document.getElementById("gameSuggestions").innerHTML = "";
    }
});