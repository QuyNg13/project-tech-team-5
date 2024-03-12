const express = require('express')
const { MongoClient } = require("mongodb")
const app = express()
const port = 3000

require('dotenv').config()

const uri = process.env.MONGO_DB;
const client = new MongoClient(uri);

// standaard code van MongoDBCollectionNamespace, kan gebruikt worden als referentie //

// async function run() {
//   try {
//     await client.connect();
//     // database and collection code goes here
//     const db = client.db("sample_guides");
//     const coll = db.collection("planets")
//     const { ObjectId } = require("mongodb");
//     // insert code goes here
//     const docs = 
//     {name: "Comet", officialName: "die ene", orbitalPeriod: 75, radius: 3.4175, mass: 2.2e14};
//     const result = await coll.insertOne(docs);
//     // display the results of your operation
//     console.log(result.insertedId);
//     // find code goes here
//     const cursor = coll.find({ hasRings: true });
//     // iterate code goes here
//     await cursor.forEach(console.log);
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('static'))

app.set('view engine', 'ejs')
app.use(express.static('style'))

//Endpoint om gebruikers op te halen
app.get('/users', async (req, res) => {
  try {
    await client.connect()
    const db = client.db("Data")
    const coll = db.collection("users")
    const result = await coll.find({}).toArray()
    res.json(result)
    
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Er is een fout opgetreden bij het ophalen van gebruikers'})
  } finally {
    await client.close ()
  }

})


app.get('/', (req, res) => {
  res.render('base')
})

app.get('/register', (req, res) => {
  res.render('register')
})

// app.post('/', adduser)

app.post('/', async(req,res) => {
  await adduser(req, res)
})

async function adduser(req,res) {
  try {
    await client.connect();
    const { username, password } = req.body
    const db = client.db("Data")
    const coll = db.collection("users")
    const {insertId} = require("mongodb")
    const result = await coll.insertOne({ username, password })
    console.log(result.insertedId)
    res.send('Gebruiker toegevoegd')
  } catch (error) {
    console.error(error)
    res.status(500).send('Er is een fout opgetreden bij het toevoegen van de gebruiker')
  }
  finally {
    await client.close ()
  }
}
 

// adduser().catch(console.dir);


// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

// mongodb client openen wanneer de applicatie start 

client.connect().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })
})

//afsluiten van mongodb client wanneer de applicatie wordt gesloten
process.on ('SIGINT', () => {
  client.close().then(() => {
    console.log('MongoDB client gesloten.')
    process.exit(0)
  })
})
