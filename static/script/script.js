// JavaScript Document
console.log("hi");

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



/* vanaf hier js voor dropdown oude data van de opdracht vervangen voor de data van ons zelf!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/



/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function toggleDropdown() {
    var dropdownContent = document.getElementById("myDropdown");
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  }
  const options =  {
    valueNames: [ 'name', 'movie' ]
};


// //Dit is voor de buttons van sorteren op categorie


// // Stap 1: Selecteer het element met het id "filter-all" en wijs het toe aan de constante optionAll
// const optionAll = document.querySelector("#filter-all");

// // Stap 2: Selecteer het element met het id "filter-people" en wijs het toe aan de constante optionPeople
// const optionPeople = document.querySelector("#filter-people");

// // Stap 3: Selecteer het element met het id "filter-animals" en wijs het toe aan de constante optionAnimals
// const optionAnimals = document.querySelector("#filter-animals");

// // Stap 4: Selecteer het element met het id "filter-items" en wijs het toe aan de constante optionItems
// const optionItems = document.querySelector("#filter-items");


// // Stap 2.
// optionAll.addEventListener("change", filterList);
// optionPeople.addEventListener("change", filterList);
// optionAnimals.addEventListener("change", filterList);
// optionItems.addEventListener("change", filterList);


// // Stap 3.
// function filterList(event){
//   /* de ul opzoeken */
//   let deLijst = document.querySelector("ul");
//   let nieuweFilter = event.target.value;
//   // verwijder de huidige class van de lijst
//   deLijst.className = "";
//   // voeg de nieuwe class toe aan de lijst
//   // het event object bevat alle info van het event dat heeft plaatsgevonden
//   // het target is het element dat het event heeft laten afgaan
//   // in dit geval de radio button die gewijzigd is
//   // de value van die radio button is de nieuwe class
//   deLijst.classList.add(nieuweFilter);
// }

// // Stap 4.
// // Verder met de CSS

// //dit is voor tonen in grid of lijst


// // stap 1.
// var optionList = document.querySelector("#view-list");
// var optionGrid = document.querySelector("#view-grid");


// // stap 2 en 3.
// optionList.addEventListener("change", showInList);
// optionGrid.addEventListener("change", showInGrid);


// // stap 4.
// function showInList() {
//   /* de lijst in de HTML opzoeken */
//   let deLijst = document.querySelector("ul");
//   /* de class grid-view verwijderen */
//   deLijst.classList.remove("grid-view");
//   /* dan de class list-view toevoegen */
//   deLijst.classList.add("list-view");
// }


// // stap 5.
// function showInGrid() {
//   /* de lijst in de HTML opzoeken */
//   let deLijst = document.querySelector("ul");
//   /* de class list-view verwijderen */
//   deLijst.classList.remove("list-view");
//   /* dan de class grid-view toevoegen */
//   deLijst.classList.add("grid-view");
// }

// // stap 6.
// // in de CSS







