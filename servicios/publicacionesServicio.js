const crearError = require('../errors/crearError');

const obtenerTodas = async (pool) => {
  const resultado = await pool.query('SELECT * FROM publicaciones ORDER BY id');
  return resultado.rows;
};

const obtenerPorId = async (pool, id) => {
  const resultado = await pool.query('SELECT * FROM publicaciones WHERE id = $1', [id]);

  if (resultado.rows.length === 0) {
    throw crearError(404, 'Publicación no encontrada');
  }

  return resultado.rows[0];
};

const obtenerPorAutor = async (pool, autorId) => {
  const autor = await pool.query('SELECT * FROM autores WHERE id = $1', [autorId]);

  if (autor.rows.length === 0) {
    throw crearError(404, 'Autor no encontrado');
  }

  const resultado = await pool.query(
    `SELECT
       p.id,
       p.titulo,
       p.contenido,
       p.publicado,
       p.creado_en,
       json_build_object(
         'id', a.id,
         'nombre', a.nombre,
         'email', a.email,
         'bio', a.bio
       ) AS autor
     FROM publicaciones p
     JOIN autores a ON p.autor_id = a.id
     WHERE p.autor_id = $1
     ORDER BY p.id`,
    [autorId]
  );

  return resultado.rows;
};

const crear = async (pool, { autor_id, titulo, contenido, publicado }) => {
  const autor = await pool.query('SELECT id FROM autores WHERE id = $1', [autor_id]);

  if (autor.rows.length === 0) {
    throw crearError(404, 'El autor especificado no existe');
  }

  const resultado = await pool.query(
    `INSERT INTO publicaciones (autor_id, titulo, contenido, publicado)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [autor_id, titulo, contenido, publicado]
  );

  return resultado.rows[0];
};

const actualizar = async (pool, id, datos) => {
  const publicacionActual = await pool.query(
    'SELECT * FROM publicaciones WHERE id = $1',
    [id]
  );

  if (publicacionActual.rows.length === 0) {
    throw crearError(404, 'Publicación no encontrada');
  }

  const actual = publicacionActual.rows[0];

  if (datos.autor_id !== undefined) {
    const autor = await pool.query('SELECT id FROM autores WHERE id = $1', [datos.autor_id]);

    if (autor.rows.length === 0) {
      throw crearError(404, 'El autor especificado no existe');
    }
  }

  const resultado = await pool.query(
    `UPDATE publicaciones
     SET autor_id = $1, titulo = $2, contenido = $3, publicado = $4
     WHERE id = $5
     RETURNING *`,
    [
      datos.autor_id !== undefined ? datos.autor_id : actual.autor_id,
      datos.titulo !== undefined ? datos.titulo : actual.titulo,
      datos.contenido !== undefined ? datos.contenido : actual.contenido,
      datos.publicado !== undefined ? datos.publicado : actual.publicado,
      id
    ]
  );

  return resultado.rows[0];
};

const eliminar = async (pool, id) => {
  const resultado = await pool.query(
    'DELETE FROM publicaciones WHERE id = $1',
    [id]
  );

  if (resultado.rowCount === 0) {
    throw crearError(404, 'Publicación no encontrada');
  }
};

module.exports = { obtenerTodas, obtenerPorId, obtenerPorAutor, crear, actualizar, eliminar };
