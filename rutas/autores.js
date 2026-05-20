const express = require('express');
const poolPorDefecto = require('../db/configuracion');
const crearError = require('../errors/crearError');
const { validarId, validarCrearAutor, validarActualizarAutor } = require('../validators/autorValidator');
const autoresServicio = require('../servicios/autoresServicio');

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
      const autores = await autoresServicio.obtenerTodos(pool);
      res.json(autores);
    } catch (error) {
      next(error);
    }
  });

  // GET /autores/:id — obtener un autor por su id
  enrutador.get('/:id', async (req, res, next) => {
    try {
      const autor = await autoresServicio.obtenerPorId(pool, req.autorId);
      res.json(autor);
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

      const autor = await autoresServicio.crear(pool, validacion.valor);
      res.status(201).json(autor);
    } catch (error) {
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

      const autor = await autoresServicio.actualizar(pool, req.autorId, validacion.valor);
      res.json(autor);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /autores/:id — eliminar un autor
  enrutador.delete('/:id', async (req, res, next) => {
    try {
      await autoresServicio.eliminar(pool, req.autorId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return enrutador;
};

module.exports = crearRutasAutores;
