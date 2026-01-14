const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Archivo JSON que actúa como base de datos (ruta absoluta segura)
const DB_FILE = path.join(__dirname, 'users.json');

// Middleware para manejar JSON
app.use(express.json());

// Función para leer el archivo JSON
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8').trim();
    return data ? JSON.parse(data) : [];
  } catch (err) {
    // Si el archivo no existe o hay error, retorna un array vacío
    return [];
  }
};

// Función para escribir en el archivo JSON
const writeDatabase = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Endpoint raíz
app.get('/', (req, res) => {
  const msg = {
    message: 'Servidor en ejecucion en el puerto 3000',
    status: 200,
  };
  res.status(200).json(msg);
});

// 1. Obtener todos los usuarios
app.get('/users', (req, res) => {
  const users = readDatabase();
  res.status(200).json(users);
});

// 2. Crear un nuevo usuario
app.post('/users', (req, res) => {
  const users = readDatabase();
  const newUser = req.body;

  if (!newUser.id || !newUser.name || !newUser.email) {
    return res.status(400).json({ error: 'ID, name, and email are required' });
  }

  // Verifica si el usuario ya existe
  if (users.some((user) => user.id === newUser.id)) {
    return res.status(400).json({ error: 'User with the same ID already exists' });
  }

  users.push(newUser);
  writeDatabase(users);

  return res.status(201).json({ message: 'User created successfully', user: newUser });
});

// 3. Actualizar un usuario
app.put('/users/:id', (req, res) => {
  const users = readDatabase();
  const userId = req.params.id;
  const updatedUser = req.body;

  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex] = { ...users[userIndex], ...updatedUser };
  writeDatabase(users);

  return res.status(200).json({ message: 'User updated successfully', user: users[userIndex] });
});

// 4. Eliminar un usuario
app.delete('/users/:id', (req, res) => {
  const users = readDatabase();
  const userId = req.params.id;

  const filteredUsers = users.filter((user) => user.id !== userId);

  if (filteredUsers.length === users.length) {
    return res.status(404).json({ error: 'User not found' });
  }

  writeDatabase(filteredUsers);

  return res.status(200).json({ message: 'User deleted successfully' });
});

// 5. Buscar un usuario (CORREGIDO)
app.get('/users/:id', (req, res) => {
  const users = readDatabase();
  const userId = req.params.id;

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ user });
});

// Exportar app para Jest/Supertest
module.exports = app;

// Iniciar el servidor solo si se ejecuta directamente
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  });
}
