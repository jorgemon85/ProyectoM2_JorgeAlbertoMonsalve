const manejadorErrores = (err, req, res, next) => {
  const codigoEstado = err.codigoEstado || 500;

  // Para errores 500 ocultamos el mensaje interno y mostramos uno genérico
  // (el mensaje interno puede revelar detalles sensibles de la base de datos)
  const respuesta = {
    error: codigoEstado === 500 ? 'Error interno del servidor' : err.message
  };

  // Si hay detalles de validación los incluimos en la respuesta
  if (err.detalles) {
    respuesta.detalles = err.detalles;
  }

  // Los errores 500 los imprimimos en consola para poder investigarlos
  if (codigoEstado === 500) {
    console.error(err);
  }

  res.status(codigoEstado).json(respuesta);
};

module.exports = manejadorErrores;
