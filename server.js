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

app.get('/info', (req, res) => {
  res.render('info');
});

app.get('/friends', async (req, res) => {
  try {
    const currentUser = req.session.user; // De huidige gebruiker
    const db = client.db('Data'); // Geef je databasenaam op

    // Zoek vrienden van de huidige gebruiker in de database
    const friends = await db.collection('users')
      .find({ _id: { $in: currentUser.friends } })
      .project({ username: 1, profilePic: 1 })
      .toArray();

    res.json(friends); // Stuur vriendengegevens terug naar de frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/instellingenprofiel', checkLoggedIn, (req, res) => {
  res.render('instellingenprofiel');
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
    const { username, password } = req.body;
    const db = client.db("Data");
    const coll = db.collection("users");
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { insertedId } = await coll.insertOne({ username, password: hashedPassword });
    req.session.loggedIn = true;
    req.session.username = username;
    req.session.user = { _id: insertedId };
    console.log(insertedId);
    console.log(req.session);
    return res.redirect('/registervragen/1');
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

    // Haal de huidige pagina op uit het formulier
    const currentPage = parseInt(req.body.currentPage);

    // Update het profielgegevensobject afhankelijk van de huidige pagina
    let profileDataUpdate = {};
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

    // Controleer of er nog meer pagina's zijn of dat het formulier compleet is
    const totalPages = 5;
    if (currentPage < totalPages) {
      // Als er nog meer pagina's zijn, stuur de gebruiker naar de volgende pagina
      res.redirect(`/registervragen/${currentPage + 1}`);
    } else {
      // Als het formulier compleet is, stuur de gebruiker naar de startpagina
      res.redirect('/');
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
    const { username, password } = req.body;
    const db = client.db("Data");
    const coll = db.collection("users");
    const user = await coll.findOne({ username });
    if (!user) {
      return res.redirect('/login?error=Gebruiker niet gevonden');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.redirect('/login?error=Ongeldig wachtwoord');
    }
    req.session.loggedIn = true;
    req.session.username = username;

    //Inlog ook met Gebruikers-ID
    req.session.user = {_id: user._id}

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het inloggen');
  } finally {
    await client.close();
  }
}

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
      return res.status(404).json({ error: 'User not found'})
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
    // Controleer of de gebruikerssessie is ingesteld en of de gebruikers-ID beschikbaar is
    if (!req.session.user || !req.session.user._id) {
      console.error('User session is not set or missing user ID');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await client.connect ()
    const db = client.db("Data")
    const coll = db.collection("users")
    
    const friendId = req.params.friendId

    await coll.updateOne(
      {_id: new ObjectId(req.session.user._id)},
      { $addToSet: {friends: new ObjectId(friendId) } }
    )
   
    res.status(200).json({message: 'Friend added succesfully'})
  } catch (error) {
    
    console.error ('Error adding friend:', error)
    res.status(500).json({error: 'An error has occurred while adding friend' })
  }
})

//Endpoint voor lijst met vriendschapsverzoeken
app.get('/friendrequests', checkLoggedIn,  async (req, res) => {
  try {
    const db = client.db("Data")
    const friendshipRequests = await db.collection.find('friendshipRequests').find({ receiver_id: new ObjectId(req.session.user._id), status: 'pending'}).toArray()

  res.render('vriendschapsverzoeken', {friendshipRequests})
} catch (error) {
  console.error('Error fetching friendship requests:', error)
  res.status(500).send('An error occured while fetching the friendship requests')
}
})

//vriendschapsverzoek accepteren
app.post('/accept-friend-request/friendId', checkLoggedIn, async (req, res) => {
  try {
    const db = client.db("Data")
    const friendRequestId = req.params.friendId

cons



    const friendshipRequest = await friendshipRequest.findOneAndUpdate(
      { _id: friendRequestId, receiver_id: req.session.user._id },
      { status: 'accepted' },
      { new: true }
    )

    if (!friendshipRequest) {
      return res.status(404).json({ error: 'Friendship request was not found'})
    }

    Swal.fire({
      title: "Confirmation",
      text: "Friendship request accepted",
      icon: "success"
    })

    res.status(200).json({message: 'Friendschip request succesfully accepted'})
  } catch (error) {
    console.error ('Error accepting friend request:', error)
    res.status(500).json({error: 'An error has occurred while adding friend' })
  }
})

