require('dotenv').config();
const { MongoClient } = require('mongodb');

async function probar() {
  if (!process.env.MONGO_URI) {
    throw new Error('Falta configurar MONGO_URI en el archivo .env');
  }
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  try {
    const databaseName = process.env.MONGO_DB || 'pozos_petroleros';
    const collectionName = process.env.MONGO_COLLECTION || 'pozos';
    const total = await client.db(databaseName).collection(collectionName).countDocuments();
    console.log(`Conectado. Documentos en ${collectionName}:`, total);
  } finally {
    await client.close();
  }
}

probar().catch((error) => {
  console.error('No se pudo verificar la conexión con MongoDB:', error);
  process.exitCode = 1;
});