const express = require('express');
const { MongoClient } = require("mongodb");
const app = express();
const port = 3000;
require('dotenv').config();
const uri = process.env.MONGO_DB;
const client = new MongoClient(uri);
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.set('view engine', 'ejs');
app.use(express.static('style'));

app.get('/', (req, res) => {
  res.render('base');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Endpoint om gebruikers op te halen
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
    const hashedPassword = await bcrypt.hash(password, 10);
    // De destructuring assignment hier corrigeren
    const { insertedId } = await coll.insertOne({ username, password: hashedPassword });
    
    console.log(insertedId);
    res.send('Gebruiker toegevoegd');
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het toevoegen van de gebruiker');
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
    console.log('MongoDB-client gesloten.');
    process.exit(0);
  });
});