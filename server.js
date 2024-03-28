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

app.get('/', checkLoggedIn,(req, res) => {
  res.render('home');
});

app.get('/registervragen', (req, res) => {
  res.render('registervragen');
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

app.get('/instellingenprofiel', checkLoggedIn, (req, res) => {
  res.render('instellingenprofiel');
});

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
    return res.redirect('/registervragen');
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het toevoegen van de gebruiker');
  }
}

app.post('/registervragen', async (req, res) => {
  try {
      if (!req.session.user || !req.session.user._id) {
          throw new Error('Gebruikerssessie niet correct ingesteld');
      }
      
      const userId = req.session.user._id; // Haal alleen het gebruikers-ID uit de sessie
      const profileData = {
          age: req.body.age,
          language: req.body.language,
          console: req.body.console,
          consoleLink: req.body.consoleLink,
          playStyle: req.body.playStyle,
          bio: req.body.bio,
          favoriteGenres: req.body.genre,
          gender: req.body.gender,
          favoriteGames: req.body.favoriteGames
      };
      await client.connect();
      const db = client.db("Data");
      const coll = db.collection("users");
      // Profielgegevens opslaan in de database onder het ID van de gebruiker
      await coll.updateOne({ _id: new ObjectId(userId) }, { $set: { profileData } });
      res.redirect('/'); // Optioneel: Doorsturen naar volgende pagina
  } catch (error) {
      console.error(error);
      res.status(500).send('Er is een fout opgetreden bij het opslaan van het profiel');
  } finally {
      await client.close();
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
}
