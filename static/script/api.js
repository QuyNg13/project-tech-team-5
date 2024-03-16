const apiKey = '6e440f5967c14e1a94ac6f44d69c4386';
const apiUrl = 'https://api.rawg.io/api/platforms';

fetch(`${apiUrl}?key=${apiKey}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Do something with the data
    console.log(data);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });