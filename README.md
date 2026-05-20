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
