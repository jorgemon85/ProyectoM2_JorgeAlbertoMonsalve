const express = require('express');
const poolPorDefecto = require('../db/configuracion');
const crearError = require('../errors/crearError');
const { validarId, validarCrearPublicacion, validarActualizarPublicacion } = require('../validators/publicacionValidator');
const publicacionesServicio = require('../servicios/publicacionesServicio');

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
      const publicaciones = await publicacionesServicio.obtenerTodas(pool);
      res.json(publicaciones);
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

      const publicaciones = await publicacionesServicio.obtenerPorAutor(pool, validacion.valor);
      res.json(publicaciones);
    } catch (error) {
      next(error);
    }
  });

  // GET /publicaciones/:id — obtener una publicación por su id
  enrutador.get('/:id', async (req, res, next) => {
    try {
      const publicacion = await publicacionesServicio.obtenerPorId(pool, req.publicacionId);
      res.json(publicacion);
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

      const publicacion = await publicacionesServicio.crear(pool, validacion.valor);
      res.status(201).json(publicacion);
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

      const publicacion = await publicacionesServicio.actualizar(pool, req.publicacionId, validacion.valor);
      res.json(publicacion);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /publicaciones/:id — eliminar una publicación
  enrutador.delete('/:id', async (req, res, next) => {
    try {
      await publicacionesServicio.eliminar(pool, req.publicacionId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return enrutador;
};

module.exports = crearRutasPublicaciones;
