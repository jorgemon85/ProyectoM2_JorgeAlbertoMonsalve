const tienePropiedad = (objeto, campo) =>
  Object.prototype.hasOwnProperty.call(objeto, campo);

const esCadenaVacia = (valor) =>
  typeof valor === 'string' && valor.trim() === '';

// Valida que el id del parámetro de ruta sea un entero positivo
const validarId = (id) => {
  const idNumerico = Number(id);

  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    return {
      errores: [{ campo: 'id', mensaje: 'El id debe ser un número entero positivo' }]
    };
  }

  return { valor: idNumerico, errores: [] };
};

// Valida un campo de texto obligatorio
const validarTextoObligatorio = (cuerpo, campo, etiqueta, longitudMaxima) => {
  if (!tienePropiedad(cuerpo, campo) || cuerpo[campo] === null || esCadenaVacia(cuerpo[campo])) {
    return { error: { campo, mensaje: `${etiqueta} es obligatorio` } };
  }

  if (typeof cuerpo[campo] !== 'string') {
    return { error: { campo, mensaje: `${etiqueta} debe ser texto` } };
  }

  const valor = cuerpo[campo].trim();

  if (valor.length > longitudMaxima) {
    return { error: { campo, mensaje: `${etiqueta} no puede superar ${longitudMaxima} caracteres` } };
  }

  return { valor };
};

// Valida un campo de texto opcional
const validarTextoOpcional = (cuerpo, campo, etiqueta, longitudMaxima) => {
  if (!tienePropiedad(cuerpo, campo) || cuerpo[campo] === null || cuerpo[campo] === undefined || esCadenaVacia(cuerpo[campo])) {
    return { valor: null, presente: tienePropiedad(cuerpo, campo) };
  }

  if (typeof cuerpo[campo] !== 'string') {
    return { presente: true, error: { campo, mensaje: `${etiqueta} debe ser texto` } };
  }

  const valor = cuerpo[campo].trim();

  if (valor.length > longitudMaxima) {
    return { presente: true, error: { campo, mensaje: `${etiqueta} no puede superar ${longitudMaxima} caracteres` } };
  }

  return { valor, presente: true };
};

// Valida los datos para CREAR un autor (nombre y email son obligatorios)
const validarCrearAutor = (cuerpo = {}) => {
  const errores = [];
  const autor = {};

  const nombre = validarTextoObligatorio(cuerpo, 'nombre', 'El nombre', 100);
  const email = validarTextoObligatorio(cuerpo, 'email', 'El email', 150);
  const bio = validarTextoOpcional(cuerpo, 'bio', 'La biografía', 1000);

  for (const resultado of [nombre, email, bio]) {
    if (resultado.error) errores.push(resultado.error);
  }

  if (errores.length > 0) return { errores };

  autor.nombre = nombre.valor;
  autor.email = email.valor;
  autor.bio = bio.valor;

  return { valor: autor, errores: [] };
};

// Valida los datos para ACTUALIZAR un autor (al menos un campo debe venir)
const validarActualizarAutor = (cuerpo = {}) => {
  const errores = [];
  const autor = {};
  const camposPermitidos = ['nombre', 'email', 'bio'];
  const camposPresentes = camposPermitidos.filter((campo) => tienePropiedad(cuerpo, campo));

  if (camposPresentes.length === 0) {
    return {
      errores: [{ campo: 'cuerpo', mensaje: 'Debe enviar al menos un campo válido para actualizar' }]
    };
  }

  if (tienePropiedad(cuerpo, 'nombre')) {
    const nombre = validarTextoObligatorio(cuerpo, 'nombre', 'El nombre', 100);
    if (nombre.error) errores.push(nombre.error);
    else autor.nombre = nombre.valor;
  }

  if (tienePropiedad(cuerpo, 'email')) {
    const email = validarTextoObligatorio(cuerpo, 'email', 'El email', 150);
    if (email.error) errores.push(email.error);
    else autor.email = email.valor;
  }

  if (tienePropiedad(cuerpo, 'bio')) {
    const bio = validarTextoOpcional(cuerpo, 'bio', 'La biografía', 1000);
    if (bio.error) errores.push(bio.error);
    else autor.bio = bio.valor;
  }

  if (errores.length > 0) return { errores };

  return { valor: autor, errores: [] };
};

module.exports = {
  validarId,
  validarCrearAutor,
  validarActualizarAutor
};
