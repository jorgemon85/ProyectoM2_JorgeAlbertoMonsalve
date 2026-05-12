# API MiniBlog

API REST para gestionar autores y publicaciones de un blog. Proyecto integrador del módulo 2 del curso Full Stack.

## Tecnologías que usé

- Node.js y Express para el servidor
- PostgreSQL para guardar los datos
- Swagger UI para documentar los endpoints
- Vitest y Supertest para los tests
- Railway para el deploy

## Cómo correrlo local

### Lo que necesitas tener instalado
- Node.js
- PostgreSQL

### Pasos

1. Clonar el repositorio
```
git clone https://github.com/jorgemon85/ProyectoM2_JorgeAlbertoMonsalve.git
cd ProyectoM2_JorgeAlbertoMonsalve
```

2. Instalar dependencias
```
npm install
```

3. Crear el archivo .env copiando el ejemplo
```
cp .env.example .env
```

4. Editar el .env con tus datos de PostgreSQL
```
PUERTO=3000
DB_HOST=localhost
DB_PUERTO=5432
DB_NOMBRE=miniblog_db
DB_USUARIO=postgres
DB_PASSWORD=tu_password
DATABASE_SSL=false
```

5. Crear la base de datos y las tablas
```
psql -U postgres -c "CREATE DATABASE miniblog_db;"
psql -U postgres -d miniblog_db -f db/setup.sql
```

6. Verificar que conecta bien
```
npm run test:db
```

7. Iniciar el servidor
```
npm run dev
```

El servidor queda corriendo en http://localhost:3000

## Documentación

Con el servidor corriendo se puede ver la documentación en:
```
http://localhost:3000/api-docs
```

## Tests

```
npm test
```

## Endpoints

**Autores**
- GET /api/autores
- GET /api/autores/:id
- POST /api/autores
- PUT /api/autores/:id
- DELETE /api/autores/:id

**Publicaciones**
- GET /api/publicaciones
- GET /api/publicaciones/:id
- GET /api/publicaciones/autor/:autorId
- POST /api/publicaciones
- PUT /api/publicaciones/:id
- DELETE /api/publicaciones/:id

## Deploy

La API está desplegada en Railway:
https://proyectom2jorgealbertomonsalve-production.up.railway.app

Para el deploy usé Railway conectado al repositorio de GitHub. La base de datos también está en Railway (PostgreSQL). Las variables de entorno que configuré en Railway fueron:

- NODE_ENV = production
- DATABASE_URL = la url de conexión de PostgreSQL
- DATABASE_SSL = true

## Uso de IA

Usé Claude (Anthropic) como asistente durante el desarrollo del proyecto. Me ayudó a entender conceptos que no tenía claros, a escribir partes del código explicándome qué hacía cada cosa, y a resolver errores que me aparecían. Todo el código lo revisé y traté de entenderlo antes de seguir al siguiente paso.
