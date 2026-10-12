require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

async function getCollection() {
  await client.connect();
  return client.db('trailerflix').collection('contenido');
}

module.exports = getCollection;