# Preentrega 2 - API REST con Node.js + MongoDB

API REST con CRUD completo sobre el set de datos Trailerflix (películas y series), hecha con Node.js, Express y MongoDB Atlas.

## Tecnologías
- Node.js
- Express
- MongoDB Atlas (driver oficial `mongodb`)
- dotenv

## Instalación
1. Clonar el repositorio e instalar dependencias:
```bash
   npm install
```
2. Crear un archivo `.env` siguiendo el ejemplo de `.env.example` y completar `MONGO_URI` con la cadena de conexión de tu cluster.
3. Importar `trailerflix.json` en MongoDB (base `trailerflix`, colección `contenido`).
4. Iniciar el servidor:
```bash
   node index.js
```
   El servidor queda en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Descripción | Códigos de respuesta |
|--------|------|-------------|----------------------|
| GET | `/api/contenido` | Lista todo el contenido | 200, 500 |
| GET | `/api/contenido/:id` | Obtiene un título por su `_id` | 200, 400, 404, 500 |
| POST | `/api/contenido` | Crea un título nuevo | 201, 400, 500 |
| PUT | `/api/contenido/:id` | Actualiza campos de un título | 200, 400, 404, 500 |
| DELETE | `/api/contenido/:id` | Elimina un título | 200, 400, 404, 500 |

## Ejemplos

### GET /api/contenido
Respuesta (200):
```json
[
  {
    "_id": "6acd4928682a05914762feb6",
    "id": 28,
    "titulo": "Interestelar",
    "categoria": "Película",
    "genero": "Ciencia Ficción, Drama, Aventura",
    "sinopsis": "...",
    "temporadas": "N/A",
    "reparto": "Matthew McConaughey, Anne Hathaway"
  }
]
```

### GET /api/contenido/:id
Ejemplo: `GET /api/contenido/6acd4928682a05914762feb6`

Respuesta (200): el documento completo.
Si el id no es válido (400): `{ "error": "ID inválido" }`
Si no existe (404): `{ "error": "No encontrado" }`

### POST /api/contenido
Campos obligatorios: `titulo` y `categoria`.

Body:
```json
{
  "titulo": "Prueba",
  "categoria": "Película",
  "genero": "Drama",
  "sinopsis": "Una película de prueba",
  "reparto": "Actor Uno, Actriz Dos"
}
```
Respuesta (201):
```json
{
  "_id": "6acd5fd033ebacab333a2db4",
  "titulo": "Prueba",
  "categoria": "Película",
  "genero": "Drama",
  "sinopsis": "Una película de prueba",
  "reparto": "Actor Uno, Actriz Dos",
  "id": 31
}
```
Si faltan campos (400): `{ "error": "Faltan campos obligatorios: titulo y categoria" }`

### PUT /api/contenido/:id
Body (solo los campos a cambiar):
```json
{ "titulo": "Prueba modificada" }
```
Respuesta (200): `{ "mensaje": "Actualizado correctamente" }`
Si no existe (404): `{ "error": "No encontrado" }`

### DELETE /api/contenido/:id
Respuesta (200): `{ "mensaje": "Eliminado correctamente" }`
Si no existe (404): `{ "error": "No encontrado" }`

## Manejo de errores
- **400**: id inválido, campos faltantes o body sin campos válidos.
- **404**: el título no existe.
- **500**: error interno del servidor.