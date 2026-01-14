const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Ajusta esta línea si tu archivo NO se llama app.js o no está en la raíz:
const app = require('../index');

const USERS_FILE = path.join(__dirname, '..', 'users.json');

const testUser = {
  id: 'test-user-001',
  name: 'Usuario Prueba',
  email: 'test@correo.com',
};

beforeAll(() => {
  // Limpieza: eliminar usuario de prueba si existe
  let users = [];

  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8').trim();
      users = raw ? JSON.parse(raw) : [];
    }
  } catch (err) {
    users = [];
  }

  const filtered = users.filter((u) => u.id !== testUser.id);
  fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
});

describe('Pruebas de la API', () => {

  it('Debe responder el endpoint raiz', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Servidor en ejecucion/i);
  });

  it('Debe crear un nuevo usuario', async () => {
    const res = await request(app).post('/users').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toMatchObject(testUser);
  });

  it('Debe obtener todos los usuarios', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Debe buscar al usuario creado', async () => {
    const res = await request(app).get(`/users/${testUser.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toMatchObject(testUser);
  });

});
