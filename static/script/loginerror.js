        // Functie om queryparameters uit de URL te halen
        function getQueryVariable(variable) {
            const params = new URLSearchParams(window.location.search);
            return params.get(variable);
        }

        // Haal de waarde van de 'error' queryparameter op
        const errorMessage = getQueryVariable('error');

        // Als er een foutmelding is, toon deze dan op het scherm
        if (errorMessage) {
            const errordiv = document.getElementById('error-message')
            const errorElement = document.createElement('p');
            errorElement.textContent = errorMessage;
            errordiv.appendChild(errorElement);
        }