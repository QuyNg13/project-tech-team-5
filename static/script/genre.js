const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
const apiUrl = 'https://api.rawg.io/api/genres';

// Functie om genres op te halen en in dropdownlijst in te voegen
async function fetchGenres() {
    try {
        const response = await fetch(`${apiUrl}?key=${apiKey}`);
        const data = await response.json();

        const select = document.getElementById('genre-select');

        // Loop door de genres en voeg elke genre toe als een option in de dropdownlijst
        data.results.forEach(genre => {
            const option = document.createElement('option');
            option.text = genre.name;
            option.value = genre.slug;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Fout bij ophalen genres:', error);
    }
}

// Roep de functie aan om genres op te halen wanneer de pagina geladen is
window.onload = fetchGenres;