const crearError = (codigoEstado = 500, mensaje = 'Error interno del servidor', detalles) => {
  const error = new Error(mensaje);

  // Le pegamos el código HTTP al objeto error para usarlo luego en el manejador
  error.codigoEstado = codigoEstado;

  // Los detalles son opcionales: los usamos para listar errores de validación
  if (detalles !== undefined) {
    error.detalles = detalles;
  }

  return error;
};

module.exports = crearError;
