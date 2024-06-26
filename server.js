const express = require('express');
const { MongoClient} = require("mongodb");
const { ObjectId } = require('mongodb');
const app = express();
const port = 3000;
require('dotenv').config();
const uri = process.env.MONGO_DB;
const client = new MongoClient(uri);
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session')
const Swal = require('sweetalert2')
const multer = require('multer');
const fs = require ('fs')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
})); 
app.use(express.static('style'));

// Error handling pattern for MongoDB connections and operations
async function performDatabaseOperation(operation) {
  try {
    await client.connect(); // Connect to the MongoDB client
    const result = await operation(client); // Execute the operation
    return result;
  } catch (error) {
    console.error('Error performing database operation:', error);
    throw error; // Throw the error for further handling
  } finally {
    await client.close(); // Close the MongoDB client connection
  }
}


// Mongodb-client openen wanneer de applicatie start
client.connect().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});

// Afsluiten van mongodb-client wanneer de applicatie wordt gesloten
process.on('SIGINT', () => {
  client.close().then(() => {
    console.log('MongoDB client gesloten.')
    process.exit(0)
  })
})

function checkLoggedIn(req, res, next) {
  if (req.session && req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

function checkLoggedInRedirectHome(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return res.redirect('/');
  }
  next();
}

// Multer-configuratie voor het opslaan van geüploade profielfoto's
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.session.user._id; // Haal gebruikers-ID op
    const userUploadsDir = `static/style/images/uploads/${userId}`; // Maak een submap voor de gebruiker
    fs.mkdirSync(userUploadsDir, { recursive: true }); // Zorg ervoor dat de submap bestaat
    cb(null, userUploadsDir); // Bewaar geüploade profielfoto's in de submap van de gebruiker
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    console.log(file)
    cb(null, 'profile-' + uniqueSuffix + '.' + ext); // Geef het bestand een unieke naam
  }
});

const upload = multer({ storage: storage });

app.get('/', checkLoggedIn,(req, res) => {
  res.render('home');
});

app.get('/registervragen/:page', (req, res) => {
  // Gebruik de paginanummer van de URL-parameters
  let currentPage = parseInt(req.params.page) || 1;
  const totalPages = 5; // Het totale aantal vragen
  res.render('registervragen', { currentPage, totalPages });
});

app.get('/login', checkLoggedInRedirectHome,(req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/info/:gameId/:gameName', async (req, res) => {
  try {
    await client.connect();
    const gameName = req.params.gameName;
    const db = client.db("Data"); // Maak een referentie naar de database
    const users = await db.collection('users').find({ favoriteGames: gameName }).toArray(); // Zoek gebruikers die de game als favoriet hebben opgeslagen
    res.render('info', { gameName: gameName, users: users }); // Rendert het EJS-bestand met de gebruikersgegevens
  } catch (err) {
    console.error(err);
    res.status(500).send('Er is een fout opgetreden bij het ophalen van gebruikers.');
  }
});

app.get('/instellingenprofiel', async (req, res) => {
  try {
    // Controleer of de gebruikerssessie correct is ingesteld en haal het gebruikers-ID op
    if (!req.session.user || !req.session.user._id) {
      throw new Error('Gebruikerssessie niet correct ingesteld');
    }
    const userId = req.session.user._id;

    // Verbind met de database en haal de gebruikersgegevens op
    await client.connect();
    const db = client.db("Data");
    const coll = db.collection("users");
    const user = await coll.findOne({ _id: new ObjectId(userId) });
    await client.close();

    // Render de instellingenprofiel.ejs-weergave en geef de gebruikersgegevens door
    res.render('instellingenprofiel', { user: user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het laden van de profielpagina');
  }
});

//Endpoint om gebruikers op te halen 
app.get('/users', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("Data");
    const coll = db.collection("users");
    const result = await coll.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het ophalen van gebruikers' });
  } finally {
    await client.close();
  }
});

app.post('/', async (req, res) => {
  await adduser(req, res);
});


async function adduser(req, res) {
  try {
    await client.connect();
    const { username, password } = req.body; // Haal de gebruikersnaam en het wachtwoord op uit de request body.
    const db = client.db("Data");
    const coll = db.collection("users");
    console.log('unp', username, password)
    const hashedPassword = await bcrypt.hash(password, 10); // Hash het wachtwoord met bcrypt
    const { insertedId } = await coll.insertOne({ username, password: hashedPassword }); // gebruiker word aangemaakt in "users" met gehashed wachtwoord.
    req.session.loggedIn = true; //sessievariablen
    req.session.username = username;
    req.session.user = { _id: insertedId };
    console.log(insertedId); //log sessie en id
    console.log(req.session);
    return res.redirect('/registervragen/1'); //gebruiker wordt doorgestuurd naar vragenlijst
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het toevoegen van de gebruiker');
  }
}

app.post('/registervragen', upload.single('profilePic'), async (req, res) => {
  try {
    // Controleer of de gebruikerssessie correct is ingesteld en haal het gebruikers-ID op
    if (!req.session.user || !req.session.user._id) {
      throw new Error('Gebruikerssessie niet correct ingesteld');
    }
    const userId = req.session.user._id;
    const currentPage = parseInt(req.body.currentPage);// Haal de huidige pagina op uit het formulier
    let profileDataUpdate = {};// Update het profielgegevensobject afhankelijk van de huidige pagina
    if (currentPage === 1) {
      profileDataUpdate.age = req.body.age;
      profileDataUpdate.gender = req.body.gender;
    } else if (currentPage === 2) {
      profileDataUpdate.language = req.body.language;
    } else if (currentPage === 3) {
      profileDataUpdate.console = req.body.console;
      profileDataUpdate.consoleLink = req.body.consoleLink;
    } else if (currentPage === 4) {
      profileDataUpdate.favoriteGenres = req.body.genre;
      profileDataUpdate.favoriteGames = req.body.selectedGames.split(','); // Voeg geselecteerde games toe
    } else if (currentPage === 5) {
      profileDataUpdate.bio = req.body.bio;
      if (req.file) {
        profileDataUpdate.profilePic = req.file.filename;
      }
    }

    // Verbind met de database, werk het profielgegevensobject bij en sluit de verbinding
    await client.connect();
    const db = client.db("Data");
    const coll = db.collection("users");
    await coll.updateOne({ _id: new ObjectId(userId) }, { $set: profileDataUpdate });
    await client.close();
    const totalPages = 5;
    if (currentPage < totalPages) {// Als er nog meer pagina's zijn, stuur de gebruiker naar de volgende pagina
      res.redirect(`/registervragen/${currentPage + 1}`);
    } else {
      res.redirect('/'); // Als het formulier compleet is, stuur de gebruiker naar de startpagina
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het opslaan van het profiel');
  }
});

app.post('/login', async (req, res) => {
  await login(req, res);
});

async function login(req, res) {
  try {
    await client.connect();
    const { username, password } = req.body;// Haal de gebruikersnaam en het wachtwoord op uit de request body.
    const db = client.db("Data");
    const coll = db.collection("users");
    const user = await coll.findOne({ username });// Zoek naar een gebruiker met de opgegeven gebruikersnaam in "users" collectie.
    if (!user) {// Als de gebruiker niet bestaat, redirect naar '/login' met een foutmelding.
      return res.redirect('/login?error=Gebruiker niet gevonden');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);// Controleer het wachtwoord
    if (!passwordMatch) {// Als het wachtwoord niet overeenkomt redirect naar '/login' met een foutmelding.
      return res.redirect('/login?error=Ongeldig wachtwoord');
    }
    req.session.loggedIn = true;//sessievariablen
    req.session.username = username;
    req.session.user = {_id: user._id}

    res.redirect('/');//redirect naar home
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het inloggen');
  } finally {
    await client.close();
  }
}

app.post('/updateprofiel', upload.single('profilePic'), async (req, res) => {
  try {
    // Controleer of de gebruikerssessie correct is ingesteld en haal het gebruikers-ID op
    if (!req.session.user || !req.session.user._id) {
      throw new Error('Gebruikerssessie niet correct ingesteld');
    }
    const userId = req.session.user._id;

    // Update het profielgegevensobject met de ontvangen gegevens uit het formulier
    let profileDataUpdate = {};

    // Voeg alleen niet-lege velden toe aan het profielgegevensobject
    if (req.body.age) profileDataUpdate.age = req.body.age;
    if (req.body.gender) profileDataUpdate.gender = req.body.gender;
    if (req.body.language) profileDataUpdate.language = req.body.language;
    if (req.body.console) profileDataUpdate.console = req.body.console;
    if (req.body.consoleLink) profileDataUpdate.consoleLink = req.body.consoleLink;
    if (req.body.playStyle) profileDataUpdate.playStyle = req.body.playStyle;
    if (req.body.genre) profileDataUpdate.favoriteGenres = req.body.genre;
    if (req.body.selectedGames) profileDataUpdate.favoriteGames = req.body.selectedGames.split(',');
    if (req.body.bio) profileDataUpdate.bio = req.body.bio;

    // Voeg profielfoto toe aan update als deze is geüpload
    if (req.file) {
      profileDataUpdate.profilePic = req.file.filename;
    }

    // Verbind met de database, werk het profielgegevensobject bij en sluit de verbinding
    await client.connect();
    const db = client.db("Data");
    const coll = db.collection("users");
    await coll.updateOne({ _id: new ObjectId(userId) }, { $set: profileDataUpdate });
    await client.close();

    res.redirect('/instellingenprofiel'); // Stuur de gebruiker terug naar de profielpagina
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het bijwerken van het profiel');
  }
});

app.get('/friends', async (req, res) => {
  try {
      const userId = req.session.user._id; // Haal de ID van de huidige gebruiker op
      await client.connect ()
      const db = client.db("Data")
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { username: 1, profilePic: 1 });// Zoek de gebruiker in de database
      const friendIds = user.friends.map(friendId => new ObjectId(friendId));// Haal de vrienden van de gebruiker op
      const friends = await db.collection('users').find({ _id: { $in: friendIds } }).toArray();
      await client.close();
      res.render('vriendenlijst', { friends }); // Render de 'friends' view en geef de vrienden door
  } catch (err) {
      console.error(err);
      res.status(500).send('Er is een fout opgetreden');
  }
});

//Detailpagina gebruikers
app.get('/profile/:username', async (req, res) => {
  try {
    await client.connect ()
    const db = client.db("Data")
    const coll = db.collection("users")
    
    //gebruiker ophalen
    const username = req.params.username;
    const user = await coll.findOne({ _id: new ObjectId(username)})

    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden'})
    }

    res.render('profile', {user})
  } catch (error) {
    console.error ('Error:', error)
    res.status(500).json({error: 'An error has occurred'})
  }
})

//gebruiker toevoegen als vriend
app.post('/addfriend/:friendId', async (req, res) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      console.error('Gebruikerssessie niet ingesteld of gebruikers-ID ontbreekt')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await client.connect()
    const db = client.db("Data")
    const coll = db.collection("users")

    const friendId = req.params.friendId;
    const senderId = req.session.user._id;

    await coll.updateOne(
      { _id: new ObjectId(friendId) },
      { $addToSet: { friendRequests: new ObjectId(senderId) } } 
    )

    res.status(200).json({ message: 'Vriendverzoek succesvol verstuurd' })
  } catch (error) {
    console.error('Fout bij versturen van vriendverzoek:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het versturen van vriendverzoek' });
  } finally {
    await client.close();
  }
});

//Endpoint voor lijst met vriendschapsverzoeken
app.get('/friendrequests', checkLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user._id

    await client.connect();
    const db = client.db("Data");
    const usersCollection = db.collection("users")

    // Huidige gebruiker ophalen
    const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Ophalen van de verzoeken 
    const friendRequests = currentUser.friendRequests || []

    await client.close();

    res.render('vriendschapsverzoeken', { friendRequests })
  } catch (error) {
    console.error('Error fetching friend requests:', error)
    res.status(500).send('An error occurred while fetching friend requests')
  }
})


//vriendschapsverzoek accepteren
app.post('/accept-friend-request/:friendId', checkLoggedIn, async (req, res) => {
  try {
    const friendRequestId = req.params.friendId
    const currentUserid = req.session.user._id

    await client.connect()
    const db = client.db("Data")
    const usersCollection = db.collection('users')

    //Huidige gebruiker en het vriendschapsverzoek worden hier opgehaald
    const currentUser = await usersCollection.findOne({ _id: new ObjectId(currentUserid) })
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    //Opzoeken verzender van vriendschapsverzoek
    const friendRequest = currentUser.friendRequests.find(request => request.toString() === friendRequestId.toString())
    if (!friendRequest) {
      return res.status(404).json({error: 'Vriendschapsverzoek niet gevonden'})
    }

    const senderId = friendRequest

    // Logica toevoegen om de waarden te controleren
    console.log('Friend request ID:', friendRequestId);
    console.log('Current user ID:', currentUser._id);
    console.log('Current user friend requests:', currentUser.friendRequests);

    //Controle om te kijken of het vriendverzoek-ID bestaat in de friendRequests array van de huidige gebruiker
    const friendRequestIndex = currentUser.friendRequests.findIndex(request => request.toString() === friendRequestId.toString())
    if (friendRequestIndex === -1) {
      return res.status(404).json({ error: 'Friendship request not found' })
    }

    //Verwijderen verzoeken uit de friendRequests array na het accepteren
    currentUser.friendRequests.splice(friendRequestIndex, 1)

    //Gebruikersgegevens updaten in de database om het accepteren door te geven
    await usersCollection.updateOne(
      {_id: new ObjectId(currentUserid)},
      { $set: {friendRequests: currentUser.friendRequests}}
    )

    //Verzender van verzoek ophalen
    const senderUser = await usersCollection.findOne({ _id: new ObjectId(senderId)})
    if (!senderUser) {
      return res.status(404).json({ error: 'Verzender niet gevonden'})
    }

    //huidige gebruiker toevoegen aan de friends array van de verzender
    senderUser.friends.push(currentUserid)

    //updaten friends array van de verzender in de database
    await usersCollection.updateOne(
      { _id: new ObjectId(senderId)},
      { $set: {friends:senderUser.friends}}
    )
    //Verzender toevoegen aan de friends array van de ontvanger
    currentUser.friends.push(senderId)

    //updaten friends array van de verzender in de database
    await usersCollection.updateOne(
      { _id: new ObjectId(currentUserid)},
      { $set: {friends:currentUser.friends}}
    )

    res.status(200).json({ message: 'Vriendschapsverzoek geaccepteerd' })
  } catch (error) {
    console.error('Error accepting friend request:', error)
    res.status(500).json({ error: 'An error occurred while accepting friend request' })
  } finally {
    await client.close()
  }
})

