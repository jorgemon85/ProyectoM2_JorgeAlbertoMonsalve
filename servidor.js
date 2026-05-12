const { loadEnvFile } = require('node:process');

// Cargamos el .env solo en desarrollo; en Railway las variables ya están inyectadas
if (process.env.NODE_ENV !== 'production') {
  loadEnvFile('.env');
}

const app = require('./app');
const PUERTO = process.env.PUERTO || 3000;

app.listen(PUERTO, () => {
  console.log(`🚀 API MiniBlog corriendo en http://localhost:${PUERTO}`);
  console.log(`📚 Documentación disponible en http://localhost:${PUERTO}/api-docs`);
});
