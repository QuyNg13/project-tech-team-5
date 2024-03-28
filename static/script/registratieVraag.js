        // JavaScript-functie om vragen in HTML-button-elementen te plaatsen
        const plaatsVragen = (vragen) => {
            const buttons = document.querySelectorAll('[id^=hetantwoord]');
            buttons.forEach((button, index) => {
                button.textContent = vragen[index];
            });
        };

        // Voorbeeldvragen
        const voorbeeldVragen = [
            "Wat is de hoofdstad van Frankrijk?",
            "Hoeveel planeten zijn er in ons zonnestelsel?",
            "Wie schilderde de 'Mona Lisa'?",
            "Wat is de hoofdstad van Australië?"
        ];

        // Plaats de voorbeeldvragen in de buttons
        plaatsVragen(voorbeeldVragen);