# API MiniBlog

API REST para gestionar autores y publicaciones de un blog.  
Proyecto integrador del Módulo 2 — Curso Full Stack.

---

## Probar la API en producción

La API está desplegada en Railway y se puede probar directamente desde el navegador sin instalar nada:

**Swagger UI (producción):**  
https://proyectom2jorgealbertomonsalve-production.up.railway.app/api-docs/

**URL base de producción:**  
https://proyectom2jorgealbertomonsalve-production.up.railway.app

---

## Tecnologías

| Herramienta | Uso |
|---|---|
| Node.js + Express | Servidor y rutas HTTP |
| PostgreSQL + pg | Base de datos relacional |
| Swagger UI | Documentación interactiva de la API |
| Vitest + Supertest | Tests automatizados |
| Railway | Deploy y base de datos en la nube |

---

## Estructura del proyecto

```
api-miniblog/
├── db/
│   ├── configuracion.js       # Configuración del pool de conexión
│   └── setup.sql              # Tablas y datos de ejemplo
├── errors/
│   └── crearError.js          # Función para crear errores HTTP
├── middlewares/
│   ├── manejadorErrores.js    # Manejo global de errores
│   └── manejadorNoEncontrado.js
├── rutas/
│   ├── autores.js             # Endpoints de autores
│   └── publicaciones.js       # Endpoints de publicaciones
├── servicios/
│   ├── autoresServicio.js     # Lógica de negocio y queries de autores
│   └── publicacionesServicio.js
├── validators/
│   ├── autorValidator.js      # Validaciones de autores
│   └── publicacionValidator.js
├── tests/                     # Tests automatizados (62 tests)
├── app.js                     # Configuración de Express
├── servidor.js                # Punto de entrada
└── openapi.yaml               # Especificación OpenAPI
```

---

## Fragmentos de código importantes

### 1. Inyección de dependencias para tests

El patrón más importante del proyecto. `crearApp` recibe el pool de base de datos como parámetro en lugar de importarlo directamente. Esto permite que los tests le pasen un pool falso y corran sin necesidad de tener PostgreSQL instalado.

```js
// app.js
const crearApp = ({ pool } = {}) => {
  const app = express();
  app.use(express.json());

  app.use('/api/autores', crearRutasAutores(pool));
  app.use('/api/publicaciones', crearRutasPublicaciones(pool));

  app.use(manejadorNoEncontrado);
  app.use(manejadorErrores);

  return app;
};
```

Las rutas reciben ese mismo pool y lo pasan al servicio, manteniendo la cadena de inyección:

```js
// rutas/autores.js
const crearRutasAutores = (pool = poolPorDefecto) => {
  const enrutador = express.Router();

  enrutador.get('/:id', async (req, res, next) => {
    try {
      const autor = await autoresServicio.obtenerPorId(pool, req.autorId);
      res.json(autor);
    } catch (error) {
      next(error);
    }
  });

  return enrutador;
};
```

---

### 2. Capa de servicios — separación de lógica de negocio

Los servicios contienen todas las queries a la base de datos. Las rutas solo se encargan de recibir la petición, validar y enviar la respuesta. Esta separación hace el código más organizado y fácil de mantener.

```js
// servicios/autoresServicio.js
const crear = async (pool, { nombre, email, bio }) => {
  try {
    const resultado = await pool.query(
      `INSERT INTO autores (nombre, email, bio)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, email, bio]
    );
    return resultado.rows[0];
  } catch (error) {
    // PostgreSQL lanza el código 23505 cuando se viola una restricción UNIQUE.
    // Lo interceptamos aquí para devolver un error HTTP 400 claro al cliente.
    if (error.code === '23505') {
      throw crearError(400, 'Ya existe un autor con ese email');
    }
    throw error;
  }
};
```

---

### 3. Query con JOIN para publicaciones de un autor

Este endpoint devuelve las publicaciones junto con los datos del autor en un solo objeto anidado, usando `json_build_object` de PostgreSQL para armar el campo `autor` directamente en la query.

```js
// servicios/publicacionesServicio.js
const obtenerPorAutor = async (pool, autorId) => {
  const autor = await pool.query('SELECT * FROM autores WHERE id = $1', [autorId]);

  if (autor.rows.length === 0) {
    throw crearError(404, 'Autor no encontrado');
  }

  const resultado = await pool.query(
    `SELECT
       p.id, p.titulo, p.contenido, p.publicado, p.creado_en,
       json_build_object(
         'id',     a.id,
         'nombre', a.nombre,
         'email',  a.email,
         'bio',    a.bio
       ) AS autor
     FROM publicaciones p
     JOIN autores a ON p.autor_id = a.id
     WHERE p.autor_id = $1
     ORDER BY p.id`,
    [autorId]
  );

  return resultado.rows;
};
```

La respuesta tiene esta forma:
```json
[
  {
    "id": 1,
    "titulo": "Mi primer artículo",
    "contenido": "...",
    "publicado": true,
    "autor": {
      "id": 2,
      "nombre": "María López",
      "email": "maria@ejemplo.com",
      "bio": "Desarrolladora full stack"
    }
  }
]
```

---

### 4. Validaciones de entrada

Antes de tocar la base de datos, cada petición pasa por un validador que revisa tipos, campos obligatorios y longitudes. Si hay errores los acumula todos y los devuelve juntos, para que el cliente sepa de una vez qué tiene que corregir.

```js
// validators/autorValidator.js
const validarCrearAutor = (cuerpo = {}) => {
  const errores = [];
  const autor = {};

  const nombre = validarTextoObligatorio(cuerpo, 'nombre', 'El nombre', 100);
  const email  = validarTextoObligatorio(cuerpo, 'email',  'El email',  150);
  const bio    = validarTextoOpcional(cuerpo,    'bio',    'La bio',   1000);

  for (const resultado of [nombre, email, bio]) {
    if (resultado.error) errores.push(resultado.error);
  }

  if (errores.length > 0) return { errores };

  autor.nombre = nombre.valor;
  autor.email  = email.valor;
  autor.bio    = bio.valor;

  return { valor: autor, errores: [] };
};
```

Si la validación falla, la respuesta tiene esta forma:
```json
{
  "error": "Datos inválidos",
  "detalles": [
    { "campo": "nombre", "mensaje": "El nombre es obligatorio" },
    { "campo": "email",  "mensaje": "El email es obligatorio" }
  ]
}
```

---

### 5. Middleware global de errores

Todos los errores del sistema llegan a este middleware gracias a `next(error)`. Express lo reconoce como manejador de errores por tener exactamente 4 parámetros (`err, req, res, next`). Centraliza las respuestas de error en un solo lugar.

```js
// middlewares/manejadorErrores.js
const manejadorErrores = (err, req, res, next) => {
  const codigoEstado = err.codigoEstado || 500;

  const respuesta = {
    // Para errores 500 ocultamos el mensaje interno para no exponer
    // detalles sensibles de la base de datos al cliente
    error: codigoEstado === 500 ? 'Error interno del servidor' : err.message
  };

  if (err.detalles) {
    respuesta.detalles = err.detalles;
  }

  if (codigoEstado === 500) {
    console.error(err); // Solo logueamos los 500 para investigarlos
  }

  res.status(codigoEstado).json(respuesta);
};
```

---

### 6. Tests automatizados con mocks

Los tests usan un pool falso (`poolFalso`) en lugar de conectarse a PostgreSQL. Gracias a la inyección de dependencias del punto 1, `pool.query` se reemplaza con una función mock que devuelve lo que cada test necesita.

```js
// tests/autores.rutas.test.mjs
const poolFalso = { query: vi.fn() };
const app = crearApp({ pool: poolFalso });

beforeEach(() => vi.clearAllMocks()); // Limpia entre tests

describe('POST /api/autores', () => {

  it('debe crear un autor y retornar 201', async () => {
    const autorCreado = { id: 4, nombre: 'María López', email: 'maria@devblog.co' };
    poolFalso.query.mockResolvedValue({ rows: [autorCreado] });

    const respuesta = await request(app)
      .post('/api/autores')
      .send({ nombre: 'María López', email: 'maria@devblog.co' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombre).toBe('María López');
  });

  it('debe retornar 400 cuando el email ya existe', async () => {
    // Simulamos el error que lanzaría PostgreSQL por email duplicado
    const errorDuplicado = new Error('duplicate key');
    errorDuplicado.code = '23505';
    poolFalso.query.mockRejectedValue(errorDuplicado);

    const respuesta = await request(app)
      .post('/api/autores')
      .send({ nombre: 'María López', email: 'carlos@devblog.co' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toContain('email');
  });

});
```

---

## Endpoints

### Autores `/api/autores`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/autores` | Lista todos los autores |
| GET | `/api/autores/:id` | Obtiene un autor por ID |
| POST | `/api/autores` | Crea un nuevo autor |
| PUT | `/api/autores/:id` | Actualiza un autor existente |
| DELETE | `/api/autores/:id` | Elimina un autor y sus publicaciones |

**Ejemplo — crear autor:**
```json
POST /api/autores
{
  "nombre": "María López",
  "email": "maria@ejemplo.com",
  "bio": "Desarrolladora full stack"
}
```

### Publicaciones `/api/publicaciones`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/publicaciones` | Lista todas las publicaciones |
| GET | `/api/publicaciones/:id` | Obtiene una publicación por ID |
| GET | `/api/publicaciones/autor/:autorId` | Lista publicaciones de un autor con sus datos |
| POST | `/api/publicaciones` | Crea una nueva publicación |
| PUT | `/api/publicaciones/:id` | Actualiza una publicación existente |
| DELETE | `/api/publicaciones/:id` | Elimina una publicación |

**Ejemplo — crear publicación:**
```json
POST /api/publicaciones
{
  "autor_id": 1,
  "titulo": "Mi primer artículo",
  "contenido": "Contenido del artículo...",
  "publicado": false
}
```

---

## Correr el proyecto en local

### Requisitos previos
- Node.js
- PostgreSQL

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/jorgemon85/ProyectoM2_JorgeAlbertoMonsalve.git
cd ProyectoM2_JorgeAlbertoMonsalve
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Crear el archivo de variables de entorno**
```bash
cp .env.example .env
```

**4. Editar `.env` con tus datos de PostgreSQL**
```env
PUERTO=3000
DB_HOST=localhost
DB_PUERTO=5432
DB_NOMBRE=miniblog_db
DB_USUARIO=postgres
DB_PASSWORD=tu_password
DATABASE_SSL=false
```

**5. Crear la base de datos y las tablas**
```bash
psql -U postgres -c "CREATE DATABASE miniblog_db;"
psql -U postgres -d miniblog_db -f db/setup.sql
```

El script `setup.sql` crea las tablas e inserta datos de ejemplo para probar de inmediato.

**6. Verificar la conexión**
```bash
npm run test:db
```

**7. Iniciar el servidor**
```bash
npm run dev
```

El servidor queda corriendo en `http://localhost:3000`  
La documentación local en `http://localhost:3000/api-docs`

---

## Tests

```bash
npm test
```

El proyecto cuenta con **62 tests automatizados** distribuidos en 5 archivos que cubren:
- Operaciones CRUD de autores y publicaciones
- Casos de error (404, 400, email duplicado, autor inexistente)
- Validaciones de campos obligatorios

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con recarga automática |
| `npm start` | Servidor en modo producción |
| `npm test` | Ejecuta todos los tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cobertura` | Tests con reporte de cobertura |
| `npm run test:db` | Verifica la conexión a la base de datos |

---

## Deploy en Railway

La aplicación y la base de datos están alojadas en Railway.  
La conexión usa `DATABASE_URL` con SSL habilitado.

Variables de entorno configuradas en Railway:

```
NODE_ENV=production
DATABASE_URL=<url de conexión provista por Railway>
DATABASE_SSL=true
```

---

## Uso de IA

Usé Claude (Anthropic) como asistente durante el desarrollo. Me ayudó a entender conceptos, revisar errores y estructurar el código. Todo lo revisé y busqué entender antes de seguir avanzando.
