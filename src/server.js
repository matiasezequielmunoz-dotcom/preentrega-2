require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const getCollection = require('./db');

const app = express();
app.use(express.json());

const CAMPOS = [
  'codigo',
  'nombre',
  'yacimiento',
  'area',
  'estado',
  'estadoOriginal',
  'fluido',
  'sistemaExtraccion',
  'clasePozo',
  'tipoPozo',
  'profundidadMedida',
  'operador'
];
const CAMPOS_TEXTO = CAMPOS.filter((campo) => campo !== 'profundidadMedida');
const CAMPOS_REQUERIDOS = [
  'codigo',
  'nombre',
  'yacimiento',
  'estado',
  'fluido',
  'profundidadMedida'
];

function validarYFiltrar(body, parcial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'El cuerpo de la solicitud debe ser un objeto JSON' };
  }

  const camposDesconocidos = Object.keys(body).filter((campo) => !CAMPOS.includes(campo));
  if (camposDesconocidos.length > 0) {
    return { error: `Campos no permitidos: ${camposDesconocidos.join(', ')}` };
  }

  const datos = {};
  for (const campo of CAMPOS) {
    if (body[campo] !== undefined) datos[campo] = body[campo];
  }

  if (!parcial) {
    const faltantes = CAMPOS_REQUERIDOS.filter((campo) => datos[campo] === undefined);
    if (faltantes.length > 0) {
      return { error: `Faltan campos obligatorios: ${faltantes.join(', ')}` };
    }
  } else if (Object.keys(datos).length === 0) {
    return { error: 'No se enviaron campos válidos para actualizar' };
  }

  for (const campo of CAMPOS_TEXTO) {
    if (datos[campo] !== undefined && (
      (datos[campo] === null && CAMPOS_REQUERIDOS.includes(campo)) ||
      (datos[campo] !== null && (typeof datos[campo] !== 'string' || !datos[campo].trim()))
    )) {
      return { error: `El campo ${campo} debe ser un texto no vacío o null` };
    }
  }

  if (
    datos.profundidadMedida !== undefined &&
    (typeof datos.profundidadMedida !== 'number' ||
      !Number.isFinite(datos.profundidadMedida))
  ) {
    return { error: 'profundidadMedida debe ser un número válido' };
  }

  if (datos.profundidadMedida !== undefined && datos.profundidadMedida < 0) {
    return { error: 'profundidadMedida debe ser igual o mayor que cero' };
  }

  for (const campo of CAMPOS_TEXTO) {
    if (typeof datos[campo] === 'string') datos[campo] = datos[campo].trim();
  }

  return { datos };
}

function responderError(res, operacion, error) {
  console.error(`Error al ${operacion}:`, error);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

// Buscar por código, nombre, yacimiento, área u operador.
app.get('/api/pozos/buscar/:termino', async (req, res) => {
  try {
    const col = await getCollection();
    const termino = req.params.termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const coincidencias = await col.find({
      $or: [
        { codigo: { $regex: termino, $options: 'i' } },
        { nombre: { $regex: termino, $options: 'i' } },
        { yacimiento: { $regex: termino, $options: 'i' } },
        { area: { $regex: termino, $options: 'i' } },
        { operador: { $regex: termino, $options: 'i' } }
      ]
    }).toArray();
    return res.status(200).json(coincidencias);
  } catch (error) {
    return responderError(res, 'buscar pozos', error);
  }
});

// Obtener todos los pozos.
app.get('/api/pozos', async (req, res) => {
  try {
    const col = await getCollection();
    const pozos = await col.find().toArray();
    return res.status(200).json(pozos);
  } catch (error) {
    return responderError(res, 'obtener los pozos', error);
  }
});

// Obtener un pozo por el ObjectId de MongoDB.
app.get('/api/pozos/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const col = await getCollection();
    const pozo = await col.findOne({ _id: new ObjectId(req.params.id) });
    if (!pozo) return res.status(404).json({ error: 'Pozo no encontrado' });
    return res.status(200).json(pozo);
  } catch (error) {
    return responderError(res, 'obtener el pozo', error);
  }
});

// Crear un registro de pozo.
app.post('/api/pozos', async (req, res) => {
  try {
    const validacion = validarYFiltrar(req.body);
    if (validacion.error) return res.status(400).json({ error: validacion.error });

    const col = await getCollection();
    const duplicado = await col.findOne({ codigo: validacion.datos.codigo });
    if (duplicado) return res.status(409).json({ error: 'Ya existe un pozo con ese código' });

    const ultimo = await col.find().sort({ id: -1 }).limit(1).toArray();
    const pozo = { id: ultimo.length ? ultimo[0].id + 1 : 1, ...validacion.datos };
    const resultado = await col.insertOne(pozo);
    return res.status(201).json({ _id: resultado.insertedId, ...pozo });
  } catch (error) {
    return responderError(res, 'crear el pozo', error);
  }
});

// Actualizar los campos enviados de un pozo.
app.put('/api/pozos/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const validacion = validarYFiltrar(req.body, true);
    if (validacion.error) return res.status(400).json({ error: validacion.error });

    const col = await getCollection();
    if (validacion.datos.codigo) {
      const duplicado = await col.findOne({
        codigo: validacion.datos.codigo,
        _id: { $ne: new ObjectId(req.params.id) }
      });
      if (duplicado) return res.status(409).json({ error: 'Ya existe un pozo con ese código' });
    }
    const resultado = await col.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: validacion.datos }
    );
    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Pozo no encontrado' });
    }
    return res.status(200).json({ mensaje: 'Pozo actualizado correctamente' });
  } catch (error) {
    return responderError(res, 'actualizar el pozo', error);
  }
});

// Eliminar un pozo.
app.delete('/api/pozos/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const col = await getCollection();
    const resultado = await col.deleteOne({ _id: new ObjectId(req.params.id) });
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Pozo no encontrado' });
    }
    return res.status(200).json({ mensaje: 'Pozo eliminado correctamente' });
  } catch (error) {
    return responderError(res, 'eliminar el pozo', error);
  }
});

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
  console.log(`Servidor activo en http://localhost:${puerto}`);
});
