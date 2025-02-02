const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());
app.use(compression());

// Initialize Prisma
const prisma = new PrismaClient();

// Validation middleware
const validateRegistration = (req, res, next) => {
  const { username, password, nome, cognome, cf, datanascita, telefono, grupposanguigno } = req.body;
  
  if (!username || !password || !nome || !cognome || !cf || !datanascita || !telefono || !grupposanguigno) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate fiscal code format (16 characters, alphanumeric)
  if (!/^[A-Z0-9]{16}$/.test(cf)) {
    return res.status(400).json({ message: 'Invalid fiscal code format' });
  }

  // Validate date format
  if (isNaN(Date.parse(datanascita))) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  // Validate blood group
  const validBloodGroups = ['A_PLUS', 'A_MINUS', 'B_PLUS', 'B_MINUS', 'AB_PLUS', 'AB_MINUS', 'ZERO_PLUS', 'ZERO_MINUS'];
  if (!validBloodGroups.includes(grupposanguigno)) {
    return res.status(400).json({ message: 'Invalid blood group' });
  }

  next();
};

// Auth routes for testing
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await prisma.utente.findUnique({
      where: { username },
      include: {
        dottore: true,
        paziente: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.cf, role: user.tipoutente },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        cf: user.cf,
        username: user.username,
        tipoutente: user.tipoutente,
        nome: user.nome,
        cognome: user.cognome
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/auth/register', validateRegistration, async (req, res) => {
  const { username, password, nome, cognome, cf, datanascita, telefono, grupposanguigno } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.utente.create({
      data: {
        username,
        password: hashedPassword,
        nome,
        cognome,
        cf,
        datanascita: new Date(datanascita),
        telefono,
        tipoutente: 'paziente',
        paziente: {
          create: {
            grupposanguigno
          }
        }
      }
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        username: user.username,
        nome: user.nome,
        cognome: user.cognome,
        tipoutente: user.tipoutente
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('username')) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (error.meta?.target?.includes('cf')) {
        return res.status(400).json({ message: 'Fiscal code already exists' });
      }
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});
let server;

const startServer = (port = 4001) => {
  return new Promise((resolve, reject) => {
    // First close any existing server
    if (server) {
      server.close(async () => {
        try {
          server = null;
          // Wait a moment before starting new server
          await new Promise(res => setTimeout(res, 100));
          server = app.listen(port, () => {
            resolve(server);
          });
          server.on('error', reject);
        } catch (error) {
          reject(error);
        }
      });
    } else {
      try {
        server = app.listen(port, () => {
          resolve(server);
        });
        server.on('error', reject);
      } catch (error) {
        reject(error);
      }
    }
  });
};

const stopServer = () => {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        server = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = { app, prisma, startServer, stopServer, validateRegistration };
