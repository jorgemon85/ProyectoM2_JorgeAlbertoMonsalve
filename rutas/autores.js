const express = require('express');
const poolPorDefecto = require('../db/configuracion');
const crearError = require('../errors/crearError');
const { validarId, validarCrearAutor, validarActualizarAutor } = require('../validators/autorValidator');

// Usamos una función que recibe el pool para poder inyectar un pool de prueba en los tests
const crearRutasAutores = (pool = poolPorDefecto) => {
  const enrutador = express.Router();

  // Middleware de parámetro: valida el :id antes de que llegue a cualquier ruta
  enrutador.param('id', (req, res, next, id) => {
    const validacion = validarId(id);

    if (validacion.errores.length > 0) {
      return next(crearError(400, 'Parámetro id inválido', validacion.errores));
    }

    req.autorId = validacion.valor;
    next();
  });

  // GET /autores — listar todos los autores
  enrutador.get('/', async (req, res, next) => {
    try {
      const resultado = await pool.query('SELECT * FROM autores ORDER BY id');
      res.json(resultado.rows);
    } catch (error) {
      next(error);
    }
  });

  // GET /autores/:id — obtener un autor por su id
  enrutador.get('/:id', async (req, res, next) => {
    try {
      const resultado = await pool.query('SELECT * FROM autores WHERE id = $1', [req.autorId]);

      if (resultado.rows.length === 0) {
        return next(crearError(404, 'Autor no encontrado'));
      }

      res.json(resultado.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  // POST /autores — crear un nuevo autor
  enrutador.post('/', async (req, res, next) => {
    try {
      const validacion = validarCrearAutor(req.body);

      if (validacion.errores.length > 0) {
        return next(crearError(400, 'Datos inválidos', validacion.errores));
      }

      const { nombre, email, bio } = validacion.valor;

      const resultado = await pool.query(
        `INSERT INTO autores (nombre, email, bio)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [nombre, email, bio]
      );

      res.status(201).json(resultado.rows[0]);
    } catch (error) {
      // Código 23505 en PostgreSQL significa violación de restricción UNIQUE (email duplicado)
      if (error.code === '23505') {
        return next(crearError(400, 'Ya existe un autor con ese email'));
      }
      next(error);
    }
  });

  // PUT /autores/:id — actualizar un autor existente
  enrutador.put('/:id', async (req, res, next) => {
    try {
      const validacion = validarActualizarAutor(req.body);

      if (validacion.errores.length > 0) {
        return next(crearError(400, 'Datos inválidos', validacion.errores));
      }

      // Buscamos el autor actual para no perder los campos que no se enviaron
      const autorActual = await pool.query('SELECT * FROM autores WHERE id = $1', [req.autorId]);

      if (autorActual.rows.length === 0) {
        return next(crearError(404, 'Autor no encontrado'));
      }

      const actual = autorActual.rows[0];
      const datos = validacion.valor;

      const resultado = await pool.query(
        `UPDATE autores
         SET nombre = $1, email = $2, bio = $3
         WHERE id = $4
         RETURNING *`,
        [
          datos.nombre !== undefined ? datos.nombre : actual.nombre,
          datos.email !== undefined ? datos.email : actual.email,
          datos.bio !== undefined ? datos.bio : actual.bio,
          req.autorId
        ]
      );

      res.json(resultado.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return next(crearError(400, 'Ya existe un autor con ese email'));
      }
      next(error);
    }
  });

  // DELETE /autores/:id — eliminar un autor
  enrutador.delete('/:id', async (req, res, next) => {
    try {
      const resultado = await pool.query('DELETE FROM autores WHERE id = $1', [req.autorId]);

      if (resultado.rowCount === 0) {
        return next(crearError(404, 'Autor no encontrado'));
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return enrutador;
};

module.exports = crearRutasAutores;
