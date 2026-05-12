const path = require('node:path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const crearRutasAutores = require('./rutas/autores');
const crearRutasPublicaciones = require('./rutas/publicaciones');
const manejadorNoEncontrado = require('./middlewares/manejadorNoEncontrado');
const manejadorErrores = require('./middlewares/manejadorErrores');

const rutaOpenApi = path.join(__dirname, 'openapi.yaml');

// La función recibe el pool como parámetro para poder inyectarlo en los tests
const crearApp = ({ pool } = {}) => {
  const app = express();

  // Middleware para que Express entienda el JSON en el cuerpo de las peticiones
  app.use(express.json());

  // Ruta raíz: índice de la API
  app.get('/', (req, res) => {
    res.json({
      mensaje: 'API MiniBlog — DevSpark',
      version: '1.0.0',
      endpoints: {
        autores: '/api/autores',
        publicaciones: '/api/publicaciones',
        documentacion: '/api-docs',
        openapi: '/openapi.yaml'
      }
    });
  });

  // Servir el archivo openapi.yaml para que Swagger UI lo pueda leer
  app.get('/openapi.yaml', (req, res) => {
    res.sendFile(rutaOpenApi);
  });

  // Documentación interactiva con Swagger UI
  const documentoSwagger = YAML.load(rutaOpenApi);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(documentoSwagger));

  // Rutas principales de la API
  app.use('/api/autores', crearRutasAutores(pool));
  app.use('/api/publicaciones', crearRutasPublicaciones(pool));

  // Estos middlewares van AL FINAL — capturan lo que no encontraron las rutas anteriores
  app.use(manejadorNoEncontrado);
  app.use(manejadorErrores);

  return app;
};

// Exportamos crearApp para los tests y también la app con el pool real para el servidor
const app = crearApp();

module.exports = app;
module.exports.crearApp = crearApp;
