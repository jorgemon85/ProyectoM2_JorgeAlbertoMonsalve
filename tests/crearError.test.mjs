import { describe, it, expect } from 'vitest';
import crearError from '../errors/crearError.js';

// describe agrupa tests relacionados bajo un nombre
describe('crearError', () => {

  it('debe crear un error con código de estado y mensaje', () => {
    const error = crearError(404, 'No encontrado');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('No encontrado');
    expect(error.codigoEstado).toBe(404);
  });

  it('debe usar 500 y mensaje genérico cuando no se pasan argumentos', () => {
    const error = crearError();

    expect(error.codigoEstado).toBe(500);
    expect(error.message).toBe('Error interno del servidor');
  });

  it('debe incluir detalles cuando se pasan', () => {
    const detalles = [{ campo: 'nombre', mensaje: 'El nombre es obligatorio' }];
    const error = crearError(400, 'Datos inválidos', detalles);

    expect(error.detalles).toEqual(detalles);
  });

  it('no debe incluir detalles cuando no se pasan', () => {
    const error = crearError(400, 'Datos inválidos');

    expect(error.detalles).toBeUndefined();
  });

});
