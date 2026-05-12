const tienePropiedad = (objeto, campo) =>
  Object.prototype.hasOwnProperty.call(objeto, campo);

const esCadenaVacia = (valor) =>
  typeof valor === 'string' && valor.trim() === '';

const validarId = (id) => {
  const idNumerico = Number(id);

  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    return {
      errores: [{ campo: 'id', mensaje: 'El id debe ser un número entero positivo' }]
    };
  }

  return { valor: idNumerico, errores: [] };
};

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

// Valida autor_id: debe ser un número entero positivo
const validarAutorId = (cuerpo, obligatorio = false) => {
  if (!tienePropiedad(cuerpo, 'autor_id') || cuerpo.autor_id === null || cuerpo.autor_id === '') {
    if (obligatorio) {
      return { error: { campo: 'autor_id', mensaje: 'El autor_id es obligatorio' } };
    }
    return { presente: false };
  }

  const autorId = Number(cuerpo.autor_id);

  if (!Number.isInteger(autorId) || autorId <= 0) {
    return { presente: true, error: { campo: 'autor_id', mensaje: 'El autor_id debe ser un número entero positivo' } };
  }

  return { valor: autorId, presente: true };
};

// Valida el campo publicado: debe ser booleano (true o false)
const validarPublicado = (cuerpo) => {
  if (!tienePropiedad(cuerpo, 'publicado') || cuerpo.publicado === null || cuerpo.publicado === undefined) {
    return { valor: false, presente: tienePropiedad(cuerpo, 'publicado') };
  }

  if (typeof cuerpo.publicado !== 'boolean') {
    return { presente: true, error: { campo: 'publicado', mensaje: 'El campo publicado debe ser verdadero o falso (booleano)' } };
  }

  return { valor: cuerpo.publicado, presente: true };
};

// Valida los datos para CREAR una publicación
const validarCrearPublicacion = (cuerpo = {}) => {
  const errores = [];
  const publicacion = {};

  const autorId = validarAutorId(cuerpo, true);
  const titulo = validarTextoObligatorio(cuerpo, 'titulo', 'El título', 200);
  const contenido = validarTextoObligatorio(cuerpo, 'contenido', 'El contenido', 10000);
  const publicado = validarPublicado(cuerpo);

  for (const resultado of [autorId, titulo, contenido, publicado]) {
    if (resultado.error) errores.push(resultado.error);
  }

  if (errores.length > 0) return { errores };

  publicacion.autor_id = autorId.valor;
  publicacion.titulo = titulo.valor;
  publicacion.contenido = contenido.valor;
  publicacion.publicado = publicado.valor ?? false;

  return { valor: publicacion, errores: [] };
};

// Valida los datos para ACTUALIZAR una publicación
const validarActualizarPublicacion = (cuerpo = {}) => {
  const errores = [];
  const publicacion = {};
  const camposPermitidos = ['autor_id', 'titulo', 'contenido', 'publicado'];
  const camposPresentes = camposPermitidos.filter((campo) => tienePropiedad(cuerpo, campo));

  if (camposPresentes.length === 0) {
    return {
      errores: [{ campo: 'cuerpo', mensaje: 'Debe enviar al menos un campo válido para actualizar' }]
    };
  }

  if (tienePropiedad(cuerpo, 'autor_id')) {
    const autorId = validarAutorId(cuerpo);
    if (autorId.error) errores.push(autorId.error);
    else publicacion.autor_id = autorId.valor;
  }

  if (tienePropiedad(cuerpo, 'titulo')) {
    const titulo = validarTextoObligatorio(cuerpo, 'titulo', 'El título', 200);
    if (titulo.error) errores.push(titulo.error);
    else publicacion.titulo = titulo.valor;
  }

  if (tienePropiedad(cuerpo, 'contenido')) {
    const contenido = validarTextoObligatorio(cuerpo, 'contenido', 'El contenido', 10000);
    if (contenido.error) errores.push(contenido.error);
    else publicacion.contenido = contenido.valor;
  }

  if (tienePropiedad(cuerpo, 'publicado')) {
    const publicado = validarPublicado(cuerpo);
    if (publicado.error) errores.push(publicado.error);
    else publicacion.publicado = publicado.valor;
  }

  if (errores.length > 0) return { errores };

  return { valor: publicacion, errores: [] };
};

module.exports = {
  validarId,
  validarCrearPublicacion,
  validarActualizarPublicacion
};
