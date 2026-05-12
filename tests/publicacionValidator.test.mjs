import { describe, it, expect } from 'vitest';
import { validarId, validarCrearPublicacion, validarActualizarPublicacion } from '../validators/publicacionValidator.js';

// ── validarCrearPublicacion ────────────────────────────────
describe('validarCrearPublicacion', () => {

  it('debe aceptar datos válidos completos', () => {
    const resultado = validarCrearPublicacion({
      autor_id: 1,
      titulo: 'Mi post',
      contenido: 'Contenido del post',
      publicado: true
    });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.autor_id).toBe(1);
    expect(resultado.valor.titulo).toBe('Mi post');
    expect(resultado.valor.publicado).toBe(true);
  });

  it('debe usar publicado=false por defecto cuando no se envía', () => {
    const resultado = validarCrearPublicacion({
      autor_id: 1,
      titulo: 'Mi post',
      contenido: 'Contenido del post'
    });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.publicado).toBe(false);
  });

  it('debe rechazar cuando falta el autor_id', () => {
    const resultado = validarCrearPublicacion({
      titulo: 'Mi post',
      contenido: 'Contenido'
    });

    expect(resultado.errores.some((e) => e.campo === 'autor_id')).toBe(true);
  });

  it('debe rechazar cuando falta el título', () => {
    const resultado = validarCrearPublicacion({
      autor_id: 1,
      contenido: 'Contenido'
    });

    expect(resultado.errores.some((e) => e.campo === 'titulo')).toBe(true);
  });

  it('debe rechazar cuando falta el contenido', () => {
    const resultado = validarCrearPublicacion({
      autor_id: 1,
      titulo: 'Mi post'
    });

    expect(resultado.errores.some((e) => e.campo === 'contenido')).toBe(true);
  });

  it('debe rechazar autor_id negativo', () => {
    const resultado = validarCrearPublicacion({
      autor_id: -1,
      titulo: 'Mi post',
      contenido: 'Contenido'
    });

    expect(resultado.errores.some((e) => e.campo === 'autor_id')).toBe(true);
  });

  it('debe rechazar publicado que no sea booleano', () => {
    const resultado = validarCrearPublicacion({
      autor_id: 1,
      titulo: 'Mi post',
      contenido: 'Contenido',
      publicado: 'si'
    });

    expect(resultado.errores.some((e) => e.campo === 'publicado')).toBe(true);
  });

  it('debe recortar espacios del título y contenido', () => {
    const resultado = validarCrearPublicacion({
      autor_id: 1,
      titulo: '  Mi post  ',
      contenido: '  Contenido del post  '
    });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.titulo).toBe('Mi post');
    expect(resultado.valor.contenido).toBe('Contenido del post');
  });

  it('debe devolver varios errores cuando faltan varios campos obligatorios', () => {
    const resultado = validarCrearPublicacion({});

    expect(resultado.errores.length).toBeGreaterThanOrEqual(3);
  });

});

// ── validarActualizarPublicacion ───────────────────────────
describe('validarActualizarPublicacion', () => {

  it('debe aceptar actualizar solo el campo publicado', () => {
    const resultado = validarActualizarPublicacion({ publicado: true });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.publicado).toBe(true);
  });

  it('debe aceptar actualizar solo el título', () => {
    const resultado = validarActualizarPublicacion({ titulo: 'Nuevo título' });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.titulo).toBe('Nuevo título');
  });

  it('debe rechazar un cuerpo vacío sin campos', () => {
    const resultado = validarActualizarPublicacion({});

    expect(resultado.errores).toHaveLength(1);
    expect(resultado.errores[0].campo).toBe('cuerpo');
  });

  it('debe rechazar título vacío en actualización', () => {
    const resultado = validarActualizarPublicacion({ titulo: '   ' });

    expect(resultado.errores.some((e) => e.campo === 'titulo')).toBe(true);
  });

});
