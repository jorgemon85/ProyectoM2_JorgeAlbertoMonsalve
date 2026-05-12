import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { crearApp } from '../app.js';

// Pool falso (mock): simula la base de datos sin conectarse a PostgreSQL real.
// Cada test puede sobreescribir el método query para controlar qué "devuelve la BD".
const poolFalso = { query: vi.fn() };
const app = crearApp({ pool: poolFalso });

// Limpiamos los mocks antes de cada test para que no se mezclen resultados
import { beforeEach } from 'vitest';
beforeEach(() => vi.clearAllMocks());

// ── GET /api/autores ───────────────────────────────────────
describe('GET /api/autores', () => {

  it('debe retornar la lista de autores con código 200', async () => {
    const autoresFalsos = [
      { id: 1, nombre: 'Carlos Pérez', email: 'carlos@devblog.co', bio: null, creado_en: new Date() }
    ];
    poolFalso.query.mockResolvedValue({ rows: autoresFalsos });

    const respuesta = await request(app).get('/api/autores');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].nombre).toBe('Carlos Pérez');
  });

});

// ── GET /api/autores/:id ───────────────────────────────────
describe('GET /api/autores/:id', () => {

  it('debe retornar el autor cuando existe', async () => {
    const autorFalso = { id: 1, nombre: 'Carlos Pérez', email: 'carlos@devblog.co', bio: null };
    poolFalso.query.mockResolvedValue({ rows: [autorFalso] });

    const respuesta = await request(app).get('/api/autores/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.nombre).toBe('Carlos Pérez');
  });

  it('debe retornar 404 cuando el autor no existe', async () => {
    poolFalso.query.mockResolvedValue({ rows: [] });

    const respuesta = await request(app).get('/api/autores/999');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toBe('Autor no encontrado');
  });

  it('debe retornar 400 cuando el id no es un número', async () => {
    const respuesta = await request(app).get('/api/autores/abc');

    expect(respuesta.status).toBe(400);
  });

});

// ── POST /api/autores ──────────────────────────────────────
describe('POST /api/autores', () => {

  it('debe crear un autor y retornar 201', async () => {
    const autorCreado = { id: 4, nombre: 'María López', email: 'maria@devblog.co', bio: null };
    poolFalso.query.mockResolvedValue({ rows: [autorCreado] });

    const respuesta = await request(app)
      .post('/api/autores')
      .send({ nombre: 'María López', email: 'maria@devblog.co' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.nombre).toBe('María López');
  });

  it('debe retornar 400 cuando falta el nombre', async () => {
    const respuesta = await request(app)
      .post('/api/autores')
      .send({ email: 'maria@devblog.co' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.some((e) => e.campo === 'nombre')).toBe(true);
  });

  it('debe retornar 400 cuando falta el email', async () => {
    const respuesta = await request(app)
      .post('/api/autores')
      .send({ nombre: 'María López' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.some((e) => e.campo === 'email')).toBe(true);
  });

  it('debe retornar 400 cuando el email ya existe', async () => {
    // Simulamos el error de PostgreSQL por violación de restricción UNIQUE
    const errorDuplicado = new Error('duplicate key');
    errorDuplicado.code = '23505';
    poolFalso.query.mockRejectedValue(errorDuplicado);

    const respuesta = await request(app)
      .post('/api/autores')
      .send({ nombre: 'María López', email: 'carlos@devblog.co' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toContain('email');
  });

});

// ── PUT /api/autores/:id ───────────────────────────────────
describe('PUT /api/autores/:id', () => {

  it('debe actualizar el autor y retornar 200', async () => {
    const autorActual = { id: 1, nombre: 'Carlos Pérez', email: 'carlos@devblog.co', bio: null };
    const autorActualizado = { ...autorActual, bio: 'Nueva bio' };

    // Primera llamada: buscar el autor actual. Segunda: actualizar y retornar.
    poolFalso.query
      .mockResolvedValueOnce({ rows: [autorActual] })
      .mockResolvedValueOnce({ rows: [autorActualizado] });

    const respuesta = await request(app)
      .put('/api/autores/1')
      .send({ bio: 'Nueva bio' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.bio).toBe('Nueva bio');
  });

  it('debe retornar 404 cuando el autor no existe', async () => {
    poolFalso.query.mockResolvedValue({ rows: [] });

    const respuesta = await request(app)
      .put('/api/autores/999')
      .send({ nombre: 'Nuevo nombre' });

    expect(respuesta.status).toBe(404);
  });

  it('debe retornar 400 cuando el cuerpo está vacío', async () => {
    const respuesta = await request(app)
      .put('/api/autores/1')
      .send({});

    expect(respuesta.status).toBe(400);
  });

});

// ── DELETE /api/autores/:id ────────────────────────────────
describe('DELETE /api/autores/:id', () => {

  it('debe eliminar el autor y retornar 204', async () => {
    poolFalso.query.mockResolvedValue({ rowCount: 1 });

    const respuesta = await request(app).delete('/api/autores/1');

    expect(respuesta.status).toBe(204);
  });

  it('debe retornar 404 cuando el autor no existe', async () => {
    poolFalso.query.mockResolvedValue({ rowCount: 0 });

    const respuesta = await request(app).delete('/api/autores/999');

    expect(respuesta.status).toBe(404);
  });

});
