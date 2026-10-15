# Preentrega 2 - Gestión de pozos petroleros

API para consultar y administrar información de pozos petroleros de Neuquén. Está desarrollada con Node.js, Express y MongoDB.

## Datos

El archivo `pozos_petroleros.json` contiene siete pozos publicados en el [Portal SIG de Hidrocarburos de Neuquén](https://hidrocarburos.energianeuquen.gob.ar/portalgis/web/).
Los registros incluyen código, nombre, yacimiento, área, estado, recurso, método de extracción, profundidad y operador. La profundidad está expresada en metros. Se conservan algunos datos técnicos tal como aparecen publicados.

## Instalación y configuración

1. Desde una terminal abierta en la carpeta del proyecto, instalar las dependencias:

   ```bash
   npm install
   ```

2. Crear un archivo `.env` en la carpeta principal. Copiar los valores de `.env.example` y completar `MONGO_URI` con la dirección de conexión a MongoDB:

   ```env
   MONGO_URI=tu_direccion_de_conexion_a_mongodb
   MONGO_DB=pozos_petroleros
   MONGO_COLLECTION=pozos
   PORT=3000
   ```

3. En MongoDB Compass, abrir la conexión correspondiente y seleccionar la base `pozos_petroleros` y la colección `pozos`. Para cargar los datos, elegir **Add Data > Import JSON or CSV**, seleccionar `pozos_petroleros.json` y confirmar el formato JSON.

4. Iniciar el servidor:

   ```bash
   npm start
   ```

   Dejá abierta esa terminal mientras uses la API. Queda disponible en `http://localhost:3000`.

Para comprobar la conexión con MongoDB:

```bash
node test.js
```

## Rutas de la API

Se pueden probar con Thunder Client en VS Code.

| Método | Dirección | Qué hace |
|--------|-----------|----------|
| GET | `/api/pozos` | Muestra todos los pozos. |
| GET | `/api/pozos/:id` | Busca un pozo por su identificador de MongoDB. |
| GET | `/api/pozos/buscar/:termino` | Busca por código, nombre, yacimiento, área u operador. |
| POST | `/api/pozos` | Agrega un pozo. |
| PUT | `/api/pozos/:id` | Modifica los datos enviados de un pozo. |
| DELETE | `/api/pozos/:id` | Elimina un pozo. |

En `:id`, usá el valor `_id` que devuelve MongoDB. En `:termino`, escribí el dato que quieras buscar. Por ejemplo: `http://localhost:3000/api/pozos/buscar/LOMA%20NEGRA`.

### Agregar un pozo

Elegí **POST** y usá `http://localhost:3000/api/pozos`. Este ejemplo es inventado y sirve para probar el alta:

```json
{
  "codigo": "P99999",
  "nombre": "Pozo de ejemplo",
  "yacimiento": "Yacimiento de ejemplo",
  "area": "Area de ejemplo",
  "estado": "Activo",
  "fluido": "Petroleo",
  "profundidadMedida": 2500
}
```

Son obligatorios `codigo`, `nombre`, `yacimiento`, `estado`, `fluido` y `profundidadMedida`. No se puede repetir el código de otro pozo.

### Modificar, consultar o eliminar

Para estas operaciones, usá la dirección `http://localhost:3000/api/pozos/<id>` y reemplazá `<id>` por el `_id` del pozo.

Para modificar, elegí **PUT** y enviá únicamente los campos que quieras cambiar:

```json
{
  "estado": "En revisión"
}
```

Para consultar, elegí **GET**; para eliminar, elegí **DELETE**.

## Respuestas

- `200`: consulta, modificación o eliminación realizada.
- `201`: pozo agregado.
- `400`: datos inválidos o campos obligatorios ausentes.
- `404`: no se encontró el pozo.
- `409`: ya existe un pozo con ese código.
- `500`: error del servidor o de conexión con MongoDB.

MongoDB genera un `_id` para cada documento; la API lo usa para las operaciones individuales. El `id` numérico del JSON es una referencia sencilla para los siete registros.

## Fuentes consultadas

Subsecretaría de Energía, Minería e Hidrocarburos de Neuquén. (s. f.). *Portal SIG de Hidrocarburos de Neuquén*. Consultado el 15 de octubre de 2026.

- [Portal SIG de Hidrocarburos de Neuquén](https://hidrocarburos.energianeuquen.gob.ar/portalgis/web/)
