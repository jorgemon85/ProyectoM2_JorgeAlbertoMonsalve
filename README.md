# API MiniBlog — DevSpark

API REST para gestionar autores y publicaciones del blog de DevSpark.
Construida con Node.js, Express y PostgreSQL.

---

## Tecnologías usadas

- **Node.js** + **Express** — servidor y rutas
- **PostgreSQL** + **pg** — base de datos y consultas SQL
- **Swagger UI** — documentación interactiva
- **Vitest** + **Supertest** — tests unitarios y de integración
- **Railway** — deploy en producción

---

## Requisitos previos

- Node.js v18 o superior
- PostgreSQL instalado localmente

---

## Cómo ejecutar localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/api-miniblog.git
cd api-miniblog
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa tus credenciales:

```bash
cp .env.example .env
```

Edita el `.env` con tus datos de PostgreSQL local:

```
PUERTO=3000
DB_HOST=localhost
DB_PUERTO=5432
DB_NOMBRE=miniblog_db
DB_USUARIO=postgres
DB_PASSWORD=tu_password
DATABASE_SSL=false
```

### 4. Crear la base de datos y las tablas

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE miniblog_db;"

# Crear tablas e insertar datos de prueba
psql -U postgres -d miniblog_db -f db/setup.sql
```

### 5. Verificar la conexión

```bash
npm run test:db
```

### 6. Iniciar el servidor

```bash
# Modo desarrollo (reinicia al guardar cambios)
npm run dev

# Modo producción
npm run iniciar
```

El servidor quedará disponible en: `http://localhost:3000`

---

## Documentación OpenAPI (Swagger UI)

Con el servidor corriendo, abre en el navegador:

```
http://localhost:3000/api-docs
```

Desde ahí puedes explorar y probar todos los endpoints de forma interactiva.

---

## Cómo ejecutar los tests

```bash
# Correr todos los tests una vez
npm test

# Correr en modo watch (se re-ejecutan al guardar cambios)
npm run test:watch

# Generar reporte de cobertura
npm run test:cobertura
```

---

## Endpoints disponibles

### Autores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/autores` | Listar todos los autores |
| GET | `/api/autores/:id` | Obtener un autor |
| POST | `/api/autores` | Crear un autor |
| PUT | `/api/autores/:id` | Actualizar un autor |
| DELETE | `/api/autores/:id` | Eliminar un autor |

### Publicaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/publicaciones` | Listar todas las publicaciones |
| GET | `/api/publicaciones/:id` | Obtener una publicación |
| GET | `/api/publicaciones/autor/:autorId` | Publicaciones de un autor con sus datos |
| POST | `/api/publicaciones` | Crear una publicación |
| PUT | `/api/publicaciones/:id` | Actualizar una publicación |
| DELETE | `/api/publicaciones/:id` | Eliminar una publicación |

---

## Deploy en Railway

### 1. Crear el proyecto en Railway

1. Ir a [railway.app](https://railway.app) e iniciar sesión con GitHub
2. Click en **New Project** → **Deploy from GitHub repo**
3. Seleccionar el repositorio `api-miniblog`

### 2. Agregar la base de datos PostgreSQL

1. Dentro del proyecto en Railway, click en **Add Service** → **Database** → **PostgreSQL**
2. Railway crea la base de datos automáticamente

### 3. Configurar las variables de entorno

En la pestaña **Variables** del servicio Node.js, agregar:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=true
```

> `${{Postgres.DATABASE_URL}}` es una referencia interna de Railway que apunta automáticamente a la base de datos creada en el paso anterior.

### 4. Crear las tablas en Railway

En el servicio PostgreSQL de Railway, ir a la pestaña **Data** → **Query** y pegar el contenido del archivo `db/setup.sql`.

### 5. Verificar el deploy

Railway genera una URL pública del estilo:
`https://api-miniblog-production.up.railway.app`

Prueba que funciona visitando la URL raíz y `/api-docs`.

---

## Registro de uso de IA

Este proyecto fue desarrollado con asistencia de **Claude (Anthropic)** como herramienta de apoyo en el proceso de aprendizaje:

- Generación de la estructura base del proyecto siguiendo la arquitectura estudiada en el curso
- Explicación de conceptos como pool de conexiones, middleware de errores y validación de datos
- Escritura de tests unitarios con Vitest y Supertest
- Documentación OpenAPI en formato YAML
- Guía paso a paso para el proceso de deploy en Railway

Todo el código fue revisado y comprendido línea por línea como parte del proceso de aprendizaje del módulo Full Stack M2.
