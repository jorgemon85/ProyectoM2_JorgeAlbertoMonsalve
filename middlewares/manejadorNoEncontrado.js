const crearError = require('../errors/crearError');

const manejadorNoEncontrado = (req, res, next) => {
  next(crearError(404, `Ruta no encontrada: ${req.method} ${req.path}`));
};

module.exports = manejadorNoEncontrado;
