const { Pool } = require('pg');

// Si existe DATABASE_URL (Railway en producción), la usamos directamente.
// Si no, usamos las variables individuales (desarrollo local).
const configuracionPool = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PUERTO,
      database: process.env.DB_NOMBRE,
      user: process.env.DB_USUARIO,
      password: process.env.DB_PASSWORD
    };

// En Railway la base de datos requiere SSL. Lo activamos solo si la variable lo indica.
if (process.env.DATABASE_SSL === 'true') {
  configuracionPool.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(configuracionPool);

module.exports = pool;
