require('dotenv').config();
const { MongoClient } = require('mongodb');

async function probar() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const total = await client.db('trailerflix').collection('contenido').countDocuments();
  console.log('Conectado. Documentos en contenido:', total);
  await client.close();
}

probar().catch(console.error);