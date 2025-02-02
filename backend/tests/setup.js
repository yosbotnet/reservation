const { prisma, startServer, stopServer } = require('./test-app.js');
const jwt = require('jsonwebtoken');

// At the top of setup.js
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Modify the beforeAll
beforeAll(async () => {
  try {
    // Kill any process using the test port
    try {
      await exec(`lsof -t -i:4001 | xargs kill -9`);
    } catch (error) {
      // Ignore if no process found
    }
    
    // Wait a moment before starting
    await new Promise(res => setTimeout(res, 100));
    
    // Connect to test database
    await prisma.$connect();
    
    // Start server
    await startServer(4001);
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

// Modify afterAll to ensure cleanup
afterAll(async () => {
  try {
    await stopServer();
    await prisma.$disconnect();
    
    // Final check to kill any hanging process
    try {
      await exec(`lsof -t -i:4001 | xargs kill -9`);
    } catch (error) {
      // Ignore if no process found
    }
  } catch (error) {
    console.error('Teardown failed:', error);
    throw error;
  }
});

// Reset database between tests
beforeEach(async () => {
  // Clean up all tables
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' AND tablename != '_prisma_migrations'
  `;

  for (const { tablename } of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  }
});

// Test helpers
const createTestToken = (user) => {
  return jwt.sign(
    { id: user.cf, role: user.tipoutente },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const createTestUser = async (data = {}) => {
  const defaultUser = {
    cf: 'TEST123456789012',
    username: 'testuser',
    password: 'password123',
    nome: 'Test',
    cognome: 'User',
    datanascita: new Date('1990-01-01'),
    telefono: '1234567890',
    tipoutente: 'paziente'
  };

  const user = await prisma.utente.create({
    data: { ...defaultUser, ...data }
  });

  if (user.tipoutente === 'dottore') {
    await prisma.dottore.create({
      data: {
        cf: user.cf,
        numeroregistrazione: data.numeroregistrazione || 'REG123',
        dataassunzione: new Date(),
        iban: data.iban || 'IT123456789'
      }
    });
  } else if (user.tipoutente === 'paziente') {
    await prisma.paziente.create({
      data: {
        cf: user.cf,
        grupposanguigno: data.grupposanguigno || 'A_PLUS'
      }
    });
  }

  return user;
};

const createTestRoom = async (data = {}) => {
  const defaultRoom = {
    nome: 'Test Room'
  };

  return await prisma.sala_operativa.create({
    data: { ...defaultRoom, ...data }
  });
};

const createTestEquipment = async (data = {}) => {
  const defaultEquipment = {
    nome: 'Test Equipment'
  };

  return await prisma.attrezzatura.create({
    data: { ...defaultEquipment, ...data }
  });
};

const createTestSurgeryType = async (data = {}) => {
  const defaultType = {
    nome: 'Test Surgery',
    complessita: 'media',
    durata: 60,
    costo: 1000
  };

  return await prisma.tipo_intervento.create({
    data: { ...defaultType, ...data }
  });
};

module.exports = {
  createTestToken,
  createTestUser,
  createTestRoom,
  createTestEquipment,
  createTestSurgeryType
};
