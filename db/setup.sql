-- Crear la tabla de autores
CREATE TABLE IF NOT EXISTS autores (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  bio         TEXT,
  creado_en   TIMESTAMP DEFAULT NOW()
);

-- Crear la tabla de publicaciones
-- author_id es clave foránea (FK) que apunta a autores.id
-- ON DELETE CASCADE significa: si se elimina un autor, sus posts se eliminan también
CREATE TABLE IF NOT EXISTS publicaciones (
  id          SERIAL PRIMARY KEY,
  autor_id    INTEGER NOT NULL REFERENCES autores(id) ON DELETE CASCADE,
  titulo      VARCHAR(200) NOT NULL,
  contenido   TEXT NOT NULL,
  publicado   BOOLEAN DEFAULT false,
  creado_en   TIMESTAMP DEFAULT NOW()
);

-- Datos de prueba (seed) para autores
-- El WHERE NOT EXISTS evita insertar duplicados si corremos el script varias veces
INSERT INTO autores (nombre, email, bio)
SELECT 'Carlos Pérez', 'carlos@devblog.co', 'Desarrollador backend apasionado por Node.js y bases de datos.'
WHERE NOT EXISTS (SELECT 1 FROM autores WHERE email = 'carlos@devblog.co');

INSERT INTO autores (nombre, email, bio)
SELECT 'Laura Gómez', 'laura@devblog.co', 'Diseñadora y escritora técnica con 5 años de experiencia.'
WHERE NOT EXISTS (SELECT 1 FROM autores WHERE email = 'laura@devblog.co');

INSERT INTO autores (nombre, email, bio)
SELECT 'Andrés Torres', 'andres@devblog.co', NULL
WHERE NOT EXISTS (SELECT 1 FROM autores WHERE email = 'andres@devblog.co');

-- Datos de prueba (seed) para publicaciones
INSERT INTO publicaciones (autor_id, titulo, contenido, publicado)
SELECT
  (SELECT id FROM autores WHERE email = 'carlos@devblog.co'),
  'Introducción a Node.js',
  'Node.js es un entorno de ejecución de JavaScript del lado del servidor. En este post exploramos sus conceptos básicos.',
  true
WHERE NOT EXISTS (SELECT 1 FROM publicaciones WHERE titulo = 'Introducción a Node.js');

INSERT INTO publicaciones (autor_id, titulo, contenido, publicado)
SELECT
  (SELECT id FROM autores WHERE email = 'carlos@devblog.co'),
  'Cómo conectar Express con PostgreSQL',
  'En este tutorial vamos paso a paso desde la instalación del paquete pg hasta las primeras consultas SQL.',
  false
WHERE NOT EXISTS (SELECT 1 FROM publicaciones WHERE titulo = 'Cómo conectar Express con PostgreSQL');

INSERT INTO publicaciones (autor_id, titulo, contenido, publicado)
SELECT
  (SELECT id FROM autores WHERE email = 'laura@devblog.co'),
  'Buenas prácticas de documentación de APIs',
  'Una API bien documentada ahorra horas de integración. Aquí explicamos cómo usar OpenAPI y Swagger UI.',
  true
WHERE NOT EXISTS (SELECT 1 FROM publicaciones WHERE titulo = 'Buenas prácticas de documentación de APIs');
