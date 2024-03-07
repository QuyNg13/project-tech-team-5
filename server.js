const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()

const { MongoClient } = require("mongodb");
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

app.set('view engine', 'ejs')
app.use(express.static('style'))

app.get('/', (req, res) => {
  res.render('base')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/', adduser)

async function adduser(req,res) {
  try {
    await client.connect();
    const { username, password } = req.body
    const db = client.db("Data")
    const coll = db.collection("users")
    const { ObjectId } = require("mongodb")
    const result = await coll.insertOne({ username, password })
    console.log(result.insertedId)
  } finally {
    await client.close();
  }
}
adduser().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})