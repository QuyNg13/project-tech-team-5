console.log("Test script demo 4")

const username = document.getElementById('username');
const password = document.getElementById('password');
const submit = document.getElementById ("submit");
const check = document.getElementById ("check");

submit.addEventListener("click", createUser, false);
check.addEventListener("click", getUsers, false)

async function createUser(event) {
    console.log('Functie create users uitgevoerd!')
    event.preventDefault();
    const response = await fetch("http://localhost:4000/person3", {

    method: "POST", 
    mode: "cors", 
    headers: {
        "Content-Type": "application/json", 
    
    },
    body: JSON.stringify({
        name: username.value, 
        password: password.value,
    }),
});
   
}
async function getUsers() {
    console.log('Functie get users uitgevoerd!')
    try {
      const response = await fetch('http://localhost:4000/person3')
  
      if (!response.ok) {
        throw new Error('Netwerkfout bij het ophalen van gegevens')
      }
      const data = await response.json()
      console.log(data);
      const users = data.records;
      console.log(users);
      console.log('Lijst van gebruikers: ', users)
      return users
      
    } catch (error) {
      console.error('Er is een fout opgetreden:', error)
    }
  }
  
  async function login() {

    getUsers();

      const usernameInput = document.getElementById('username')
      const passwordInput = document.getElementById('password')
      
      // haal de wachtwoorden op uit het JSON-bestand
      // gebruik await omdat getCredentials async functie is
       try {
          // haal de wachtwoorden op uit het JSON-bestand
          const response = await fetch('http://localhost:4000/person3')
          const users = await response.json()

            console.log("users: ", users.records);
          // probeer de gebruiker met de opgegeven gebruikersnaam te vinden in de array met gebruikers
          // als deze gebruiker niet bestaat zal myUser undefined zijn
          const myUser = users.records.find(x => x.name === usernameInput.value)
          if (myUser) {
              console.log('Gebruiker gevonden: ', myUser)
          } else {
              console.log('Gebruiker niet gevonden')
          }
          
          // controleer of we een gebruiker met deze gebruikersnaam hebben gevonden en zo ja, 
          // of het wachtwoord overeenkomt
          if (myUser && myUser.password === passwordInput.value) {
              alert('Login successful!')
          } else {
              alert('Invalid username or password')
          }
      } 
      catch (error) {
          console.error('Er is een fout opgetreden bij het inloggen:', error)
      }
  }
  