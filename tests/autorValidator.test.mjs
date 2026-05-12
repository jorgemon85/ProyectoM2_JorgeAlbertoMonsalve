import { describe, it, expect } from 'vitest';
import { validarId, validarCrearAutor, validarActualizarAutor } from '../validators/autorValidator.js';

// ── validarId ──────────────────────────────────────────────
describe('validarId', () => {

  it('debe aceptar un id numérico positivo', () => {
    const resultado = validarId('5');
    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor).toBe(5);
  });

  it('debe rechazar un id de texto', () => {
    const resultado = validarId('abc');
    expect(resultado.errores).toHaveLength(1);
    expect(resultado.errores[0].campo).toBe('id');
  });

  it('debe rechazar un id negativo', () => {
    const resultado = validarId('-3');
    expect(resultado.errores).toHaveLength(1);
  });

  it('debe rechazar el id cero', () => {
    const resultado = validarId('0');
    expect(resultado.errores).toHaveLength(1);
  });

});

// ── validarCrearAutor ──────────────────────────────────────
describe('validarCrearAutor', () => {

  it('debe aceptar datos válidos con todos los campos', () => {
    const resultado = validarCrearAutor({
      nombre: 'María López',
      email: 'maria@devblog.co',
      bio: 'Escritora técnica'
    });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.nombre).toBe('María López');
    expect(resultado.valor.email).toBe('maria@devblog.co');
    expect(resultado.valor.bio).toBe('Escritora técnica');
  });

  it('debe aceptar datos válidos sin bio (campo opcional)', () => {
    const resultado = validarCrearAutor({
      nombre: 'María López',
      email: 'maria@devblog.co'
    });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.bio).toBeNull();
  });

  it('debe rechazar cuando falta el nombre', () => {
    const resultado = validarCrearAutor({ email: 'maria@devblog.co' });

    expect(resultado.errores.some((e) => e.campo === 'nombre')).toBe(true);
  });

  it('debe rechazar cuando falta el email', () => {
    const resultado = validarCrearAutor({ nombre: 'María López' });

    expect(resultado.errores.some((e) => e.campo === 'email')).toBe(true);
  });

  it('debe rechazar nombre vacío con espacios', () => {
    const resultado = validarCrearAutor({ nombre: '   ', email: 'maria@devblog.co' });

    expect(resultado.errores.some((e) => e.campo === 'nombre')).toBe(true);
  });

  it('debe recortar los espacios del nombre y email', () => {
    const resultado = validarCrearAutor({
      nombre: '  María López  ',
      email: '  maria@devblog.co  '
    });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.nombre).toBe('María López');
    expect(resultado.valor.email).toBe('maria@devblog.co');
  });

  it('debe rechazar nombre que supera 100 caracteres', () => {
    const resultado = validarCrearAutor({
      nombre: 'a'.repeat(101),
      email: 'maria@devblog.co'
    });

    expect(resultado.errores.some((e) => e.campo === 'nombre')).toBe(true);
  });

  it('debe devolver varios errores cuando faltan varios campos', () => {
    const resultado = validarCrearAutor({});

    expect(resultado.errores.length).toBeGreaterThanOrEqual(2);
  });

});

// ── validarActualizarAutor ─────────────────────────────────
describe('validarActualizarAutor', () => {

  it('debe aceptar actualizar solo el nombre', () => {
    const resultado = validarActualizarAutor({ nombre: 'Nuevo Nombre' });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.nombre).toBe('Nuevo Nombre');
  });

  it('debe aceptar actualizar solo el email', () => {
    const resultado = validarActualizarAutor({ email: 'nuevo@devblog.co' });

    expect(resultado.errores).toHaveLength(0);
    expect(resultado.valor.email).toBe('nuevo@devblog.co');
  });

  it('debe rechazar un cuerpo vacío sin campos', () => {
    const resultado = validarActualizarAutor({});

    expect(resultado.errores).toHaveLength(1);
    expect(resultado.errores[0].campo).toBe('cuerpo');
  });

  it('debe rechazar nombre vacío en actualización', () => {
    const resultado = validarActualizarAutor({ nombre: '' });

    expect(resultado.errores.some((e) => e.campo === 'nombre')).toBe(true);
  });

});
