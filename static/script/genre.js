const apiKey1 = '10645c8e398d4448b53875f7a8a2ae0c';
const apiUrl1 = 'https://api.rawg.io/api/genres';

// Functie om genres op te halen en in dropdownlijst in te voegen
async function fetchGenres() {
    try {
        const response = await fetch(`${apiUrl1}?key=${apiKey1}`);
        const data = await response.json();

        const genreSelect = document.getElementById('genre-select');

        // Loop door de genres en voeg elke genre toe als een option in de dropdownlijst
        data.results.forEach(genre => {
            const option = document.createElement('option');
            option.text = genre.name;
            option.value = genre.slug;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Fout bij ophalen genres:', error);
    }
}

// Roep de functie aan om genres op te halen wanneer de pagina geladen is
window.onload = fetchGenres;