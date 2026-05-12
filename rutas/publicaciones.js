const express = require('express');
const poolPorDefecto = require('../db/configuracion');
const crearError = require('../errors/crearError');
const { validarId, validarCrearPublicacion, validarActualizarPublicacion } = require('../validators/publicacionValidator');

const crearRutasPublicaciones = (pool = poolPorDefecto) => {
  const enrutador = express.Router();

  enrutador.param('id', (req, res, next, id) => {
    const validacion = validarId(id);

    if (validacion.errores.length > 0) {
      return next(crearError(400, 'Parámetro id inválido', validacion.errores));
    }

    req.publicacionId = validacion.valor;
    next();
  });

  // GET /publicaciones — listar todas las publicaciones
  enrutador.get('/', async (req, res, next) => {
    try {
      const resultado = await pool.query('SELECT * FROM publicaciones ORDER BY id');
      res.json(resultado.rows);
    } catch (error) {
      next(error);
    }
  });

  // GET /publicaciones/autor/:autorId — publicaciones de un autor con sus datos
  // IMPORTANTE: esta ruta debe ir ANTES de /:id para que Express no confunda
  // "autor" con un id numérico
  enrutador.get('/autor/:autorId', async (req, res, next) => {
    try {
      const validacion = validarId(req.params.autorId);

      if (validacion.errores.length > 0) {
        return next(crearError(400, 'Parámetro autorId inválido', validacion.errores));
      }

      const autorId = validacion.valor;

      // Verificamos que el autor exista
      const autor = await pool.query('SELECT * FROM autores WHERE id = $1', [autorId]);

      if (autor.rows.length === 0) {
        return next(crearError(404, 'Autor no encontrado'));
      }

      // JOIN: unimos publicaciones con autores para traer los datos del autor en cada post
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

      res.json(resultado.rows);
    } catch (error) {
      next(error);
    }
  });

  // GET /publicaciones/:id — obtener una publicación por su id
  enrutador.get('/:id', async (req, res, next) => {
    try {
      const resultado = await pool.query('SELECT * FROM publicaciones WHERE id = $1', [req.publicacionId]);

      if (resultado.rows.length === 0) {
        return next(crearError(404, 'Publicación no encontrada'));
      }

      res.json(resultado.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  // POST /publicaciones — crear una nueva publicación
  enrutador.post('/', async (req, res, next) => {
    try {
      const validacion = validarCrearPublicacion(req.body);

      if (validacion.errores.length > 0) {
        return next(crearError(400, 'Datos inválidos', validacion.errores));
      }

      const { autor_id, titulo, contenido, publicado } = validacion.valor;

      // Verificamos que el autor exista antes de crear la publicación
      const autor = await pool.query('SELECT id FROM autores WHERE id = $1', [autor_id]);

      if (autor.rows.length === 0) {
        return next(crearError(404, 'El autor especificado no existe'));
      }

      const resultado = await pool.query(
        `INSERT INTO publicaciones (autor_id, titulo, contenido, publicado)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [autor_id, titulo, contenido, publicado]
      );

      res.status(201).json(resultado.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  // PUT /publicaciones/:id — actualizar una publicación existente
  enrutador.put('/:id', async (req, res, next) => {
    try {
      const validacion = validarActualizarPublicacion(req.body);

      if (validacion.errores.length > 0) {
        return next(crearError(400, 'Datos inválidos', validacion.errores));
      }

      const publicacionActual = await pool.query(
        'SELECT * FROM publicaciones WHERE id = $1',
        [req.publicacionId]
      );

      if (publicacionActual.rows.length === 0) {
        return next(crearError(404, 'Publicación no encontrada'));
      }

      const actual = publicacionActual.rows[0];
      const datos = validacion.valor;

      // Si se quiere cambiar el autor, verificamos que el nuevo autor exista
      if (datos.autor_id !== undefined) {
        const autor = await pool.query('SELECT id FROM autores WHERE id = $1', [datos.autor_id]);

        if (autor.rows.length === 0) {
          return next(crearError(404, 'El autor especificado no existe'));
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
          req.publicacionId
        ]
      );

      res.json(resultado.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /publicaciones/:id — eliminar una publicación
  enrutador.delete('/:id', async (req, res, next) => {
    try {
      const resultado = await pool.query(
        'DELETE FROM publicaciones WHERE id = $1',
        [req.publicacionId]
      );

      if (resultado.rowCount === 0) {
        return next(crearError(404, 'Publicación no encontrada'));
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return enrutador;
};

module.exports = crearRutasPublicaciones;
