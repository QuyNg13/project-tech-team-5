        // Functie om queryparameters uit de URL te halen
        function getQueryVariable(variable) {
            const query = window.location.search.substring(1);
            const vars = query.split('&');
            for (let i = 0; i < vars.length; i++) {
                const pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) === variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return null;
        }

        // Haal de waarde van de 'error' queryparameter op
        const errorMessage = getQueryVariable('error');

        // Als er een foutmelding is, toon deze dan op het scherm
        if (errorMessage) {
            const errorElement = document.createElement('p');
            errorElement.textContent = errorMessage;
            document.body.appendChild(errorElement);
        }