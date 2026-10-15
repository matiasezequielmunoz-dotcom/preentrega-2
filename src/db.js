require('dotenv').config();
const { MongoClient } = require('mongodb');

if (!process.env.MONGO_URI) {
  throw new Error('Falta configurar MONGO_URI en el archivo .env');
}

const client = new MongoClient(process.env.MONGO_URI);
const databaseName = process.env.MONGO_DB || 'pozos_petroleros';
const collectionName = process.env.MONGO_COLLECTION || 'pozos';
let connection;

async function getCollection() {
  connection = connection || client.connect();
  await connection;
  return client.db(databaseName).collection(collectionName);
}

module.exports = getCollection;