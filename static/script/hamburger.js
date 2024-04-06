const hamburger = document.querySelector("header nav button");
const navMenu = document.querySelector("header nav ul");


hamburger.addEventListener("click", () =>{
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");

})

document.querySelectorAll("header nav ul li a").forEach(n => n. 
    addEventListener("click", ()=> {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")

    }))


document.addEventListener('DOMContentLoaded', function () {
    // Voeg een eventlistener toe om de dropdown te activeren bij klikken op de knop
    document.querySelectorAll('footer ul li button').forEach(function (button) {
        button.addEventListener('click', function (e) {
            e.stopPropagation(); // Stop de gebeurtenispropagatie om te voorkomen dat de pagina sluit
            const parentLi = this.parentElement;
            parentLi.classList.toggle('active');
            
            // Sluit alle andere dropdowns
            document.querySelectorAll('footer ul li').forEach(function (dropdown) {
                if (dropdown !== parentLi) {
                    dropdown.classList.remove('active');
                }
            });
        });
    });

    // Sluit de dropdown als er ergens anders op de pagina wordt geklikt
    document.addEventListener('click', function (event) {
        document.querySelectorAll('footer ul li').forEach(function (dropdown) {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('active');
            }
        });
    });
});