require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const getCollection = require('./db');

const app = express();
app.use(express.json());

// GET todos
app.get('/api/contenido', async (req, res) => {
  try {
    const col = await getCollection();
    const datos = await col.find().toArray();
    res.status(200).json(datos);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// GET por id
app.get('/api/contenido/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const col = await getCollection();
    const doc = await col.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'No encontrado' });
    res.status(200).json(doc);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

const CAMPOS = ['titulo', 'categoria', 'genero', 'sinopsis', 'temporadas', 'reparto', 'trailer'];

function filtrarCampos(body) {
  const limpio = {};
  for (const campo of CAMPOS) {
    if (body[campo] !== undefined) limpio[campo] = body[campo];
  }
  return limpio;
}

// POST crear
app.post('/api/contenido', async (req, res) => {
  try {
    const datos = filtrarCampos(req.body);
    if (!datos.titulo || !datos.categoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: titulo y categoria' });
    }
    const col = await getCollection();
    const ultimo = await col.find().sort({ id: -1 }).limit(1).toArray();
    datos.id = ultimo.length ? ultimo[0].id + 1 : 1;
    const result = await col.insertOne(datos);
    res.status(201).json({ _id: result.insertedId, ...datos });
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// PUT actualizar
app.put('/api/contenido/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const datos = filtrarCampos(req.body);
    if (Object.keys(datos).length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos válidos para actualizar' });
    }
    const col = await getCollection();
    const result = await col.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: datos }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    res.status(200).json({ mensaje: 'Actualizado correctamente' });
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// DELETE eliminar
app.delete('/api/contenido/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const col = await getCollection();
    const result = await col.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    res.status(200).json({ mensaje: 'Eliminado correctamente' });
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor activo en http://localhost:' + (process.env.PORT || 3000));
});