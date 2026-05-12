import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { crearApp } from '../app.js';

const poolFalso = { query: vi.fn() };
const app = crearApp({ pool: poolFalso });

beforeEach(() => vi.clearAllMocks());

// ── GET /api/publicaciones ─────────────────────────────────
describe('GET /api/publicaciones', () => {

  it('debe retornar la lista de publicaciones con código 200', async () => {
    const publicacionesFalsas = [
      { id: 1, autor_id: 1, titulo: 'Post uno', contenido: 'Contenido', publicado: true, creado_en: new Date() }
    ];
    poolFalso.query.mockResolvedValue({ rows: publicacionesFalsas });

    const respuesta = await request(app).get('/api/publicaciones');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].titulo).toBe('Post uno');
  });

});

// ── GET /api/publicaciones/autor/:autorId ──────────────────
describe('GET /api/publicaciones/autor/:autorId', () => {

  it('debe retornar las publicaciones del autor con sus datos', async () => {
    const autorFalso = { id: 1, nombre: 'Carlos Pérez', email: 'carlos@devblog.co', bio: null };
    const publicacionesFalsas = [
      { id: 1, titulo: 'Post uno', contenido: 'Contenido', publicado: true, autor: autorFalso }
    ];

    poolFalso.query
      .mockResolvedValueOnce({ rows: [autorFalso] })
      .mockResolvedValueOnce({ rows: publicacionesFalsas });

    const respuesta = await request(app).get('/api/publicaciones/autor/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body[0].autor.nombre).toBe('Carlos Pérez');
  });

  it('debe retornar 404 cuando el autor no existe', async () => {
    poolFalso.query.mockResolvedValue({ rows: [] });

    const respuesta = await request(app).get('/api/publicaciones/autor/999');

    expect(respuesta.status).toBe(404);
  });

  it('debe retornar 400 cuando el autorId no es un número', async () => {
    const respuesta = await request(app).get('/api/publicaciones/autor/abc');

    expect(respuesta.status).toBe(400);
  });

});

// ── GET /api/publicaciones/:id ─────────────────────────────
describe('GET /api/publicaciones/:id', () => {

  it('debe retornar la publicación cuando existe', async () => {
    const publicacionFalsa = { id: 1, autor_id: 1, titulo: 'Post uno', contenido: 'Contenido', publicado: true };
    poolFalso.query.mockResolvedValue({ rows: [publicacionFalsa] });

    const respuesta = await request(app).get('/api/publicaciones/1');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.titulo).toBe('Post uno');
  });

  it('debe retornar 404 cuando la publicación no existe', async () => {
    poolFalso.query.mockResolvedValue({ rows: [] });

    const respuesta = await request(app).get('/api/publicaciones/999');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toBe('Publicación no encontrada');
  });

});

// ── POST /api/publicaciones ────────────────────────────────
describe('POST /api/publicaciones', () => {

  it('debe crear una publicación y retornar 201', async () => {
    const autorFalso = { id: 1 };
    const publicacionCreada = { id: 4, autor_id: 1, titulo: 'Nuevo post', contenido: 'Contenido', publicado: false };

    poolFalso.query
      .mockResolvedValueOnce({ rows: [autorFalso] })
      .mockResolvedValueOnce({ rows: [publicacionCreada] });

    const respuesta = await request(app)
      .post('/api/publicaciones')
      .send({ autor_id: 1, titulo: 'Nuevo post', contenido: 'Contenido' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.titulo).toBe('Nuevo post');
  });

  it('debe retornar 400 cuando falta el título', async () => {
    const respuesta = await request(app)
      .post('/api/publicaciones')
      .send({ autor_id: 1, contenido: 'Contenido' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.some((e) => e.campo === 'titulo')).toBe(true);
  });

  it('debe retornar 400 cuando falta el contenido', async () => {
    const respuesta = await request(app)
      .post('/api/publicaciones')
      .send({ autor_id: 1, titulo: 'Nuevo post' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.some((e) => e.campo === 'contenido')).toBe(true);
  });

  it('debe retornar 400 cuando falta el autor_id', async () => {
    const respuesta = await request(app)
      .post('/api/publicaciones')
      .send({ titulo: 'Nuevo post', contenido: 'Contenido' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.detalles.some((e) => e.campo === 'autor_id')).toBe(true);
  });

  it('debe retornar 404 cuando el autor no existe', async () => {
    poolFalso.query.mockResolvedValue({ rows: [] });

    const respuesta = await request(app)
      .post('/api/publicaciones')
      .send({ autor_id: 999, titulo: 'Nuevo post', contenido: 'Contenido' });

    expect(respuesta.status).toBe(404);
  });

});

// ── PUT /api/publicaciones/:id ─────────────────────────────
describe('PUT /api/publicaciones/:id', () => {

  it('debe actualizar la publicación y retornar 200', async () => {
    const publicacionActual = { id: 1, autor_id: 1, titulo: 'Post uno', contenido: 'Contenido', publicado: false };
    const publicacionActualizada = { ...publicacionActual, publicado: true };

    poolFalso.query
      .mockResolvedValueOnce({ rows: [publicacionActual] })
      .mockResolvedValueOnce({ rows: [publicacionActualizada] });

    const respuesta = await request(app)
      .put('/api/publicaciones/1')
      .send({ publicado: true });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.publicado).toBe(true);
  });

  it('debe retornar 404 cuando la publicación no existe', async () => {
    poolFalso.query.mockResolvedValue({ rows: [] });

    const respuesta = await request(app)
      .put('/api/publicaciones/999')
      .send({ publicado: true });

    expect(respuesta.status).toBe(404);
  });

  it('debe retornar 400 cuando el cuerpo está vacío', async () => {
    const respuesta = await request(app)
      .put('/api/publicaciones/1')
      .send({});

    expect(respuesta.status).toBe(400);
  });

});

// ── DELETE /api/publicaciones/:id ──────────────────────────
describe('DELETE /api/publicaciones/:id', () => {

  it('debe eliminar la publicación y retornar 204', async () => {
    poolFalso.query.mockResolvedValue({ rowCount: 1 });

    const respuesta = await request(app).delete('/api/publicaciones/1');

    expect(respuesta.status).toBe(204);
  });

  it('debe retornar 404 cuando la publicación no existe', async () => {
    poolFalso.query.mockResolvedValue({ rowCount: 0 });

    const respuesta = await request(app).delete('/api/publicaciones/999');

    expect(respuesta.status).toBe(404);
  });

});
