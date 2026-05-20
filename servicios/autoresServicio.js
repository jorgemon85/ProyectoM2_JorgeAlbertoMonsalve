const crearError = require('../errors/crearError');

const obtenerTodos = async (pool) => {
  const resultado = await pool.query('SELECT * FROM autores ORDER BY id');
  return resultado.rows;
};

const obtenerPorId = async (pool, id) => {
  const resultado = await pool.query('SELECT * FROM autores WHERE id = $1', [id]);

  if (resultado.rows.length === 0) {
    throw crearError(404, 'Autor no encontrado');
  }

  return resultado.rows[0];
};

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
    // Código 23505: violación de restricción UNIQUE (email duplicado)
    if (error.code === '23505') {
      throw crearError(400, 'Ya existe un autor con ese email');
    }
    throw error;
  }
};

const actualizar = async (pool, id, datos) => {
  const autorActual = await pool.query('SELECT * FROM autores WHERE id = $1', [id]);

  if (autorActual.rows.length === 0) {
    throw crearError(404, 'Autor no encontrado');
  }

  const actual = autorActual.rows[0];

  try {
    const resultado = await pool.query(
      `UPDATE autores
       SET nombre = $1, email = $2, bio = $3
       WHERE id = $4
       RETURNING *`,
      [
        datos.nombre !== undefined ? datos.nombre : actual.nombre,
        datos.email !== undefined ? datos.email : actual.email,
        datos.bio !== undefined ? datos.bio : actual.bio,
        id
      ]
    );
    return resultado.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw crearError(400, 'Ya existe un autor con ese email');
    }
    throw error;
  }
};

const eliminar = async (pool, id) => {
  const resultado = await pool.query('DELETE FROM autores WHERE id = $1', [id]);

  if (resultado.rowCount === 0) {
    throw crearError(404, 'Autor no encontrado');
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
