const { loadEnvFile } = require('node:process');
loadEnvFile('.env');

const pool = require('./configuracion');

const probarConexion = async () => {
  let cliente;
  try {
    // Tomamos un cliente del pool y hacemos una consulta simple
    cliente = await pool.connect();
    const resultado = await cliente.query('SELECT NOW() AS hora_actual');
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('🕐 Hora del servidor:', resultado.rows[0].hora_actual);
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    process.exit(1);
  } finally {
    // Siempre liberamos el cliente al pool, haya error o no
    if (cliente) cliente.release();
    await pool.end();
  }
};

probarConexion();
