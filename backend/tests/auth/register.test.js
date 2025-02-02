const request = require('supertest');
const { app, prisma } = require('../test-app.js');

// Use a different port for tests
const API_URL = 'http://localhost:4001';

describe('POST /auth/register', () => {
  const validPatientData = {
    username: 'newpatient',
    password: 'testpass123',
    nome: 'Test',
    cognome: 'Patient',
    cf: 'TESTPT12A01H501X',
    datanascita: '1990-01-01',
    telefono: '1234567890',
    tipoutente: 'paziente',
    grupposanguigno: 'A_PLUS'
  };

  it('should register a new patient successfully', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send(validPatientData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Registration successful');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({
      username: validPatientData.username,
      nome: validPatientData.nome,
      cognome: validPatientData.cognome,
      tipoutente: validPatientData.tipoutente
    });

    // Verify user was created in database
    const user = await prisma.utente.findUnique({
      where: { username: validPatientData.username },
      include: { paziente: true }
    });
    expect(user).toBeTruthy();
    expect(user.paziente).toBeTruthy();
    expect(user.paziente.grupposanguigno).toBe(validPatientData.grupposanguigno);
  });

  it('should fail with duplicate username', async () => {
    // First registration
    await request(API_URL)
      .post('/auth/register')
      .send(validPatientData);

    // Attempt duplicate registration
    const response = await request(API_URL)
      .post('/auth/register')
      .send(validPatientData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('already exists');
  });

  it('should fail with duplicate fiscal code', async () => {
    // First registration
    await request(API_URL)
      .post('/auth/register')
      .send(validPatientData);

    // Attempt registration with same CF but different username
    const response = await request(API_URL)
      .post('/auth/register')
      .send({
        ...validPatientData,
        username: 'different'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('fiscal code');
  });

  it('should fail with invalid blood group', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send({
        ...validPatientData,
        grupposanguigno: 'INVALID'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('blood group');
  });

  it('should fail with missing required fields', async () => {
    const requiredFields = [
      'username',
      'password',
      'nome',
      'cognome',
      'cf',
      'datanascita',
      'telefono',
      'grupposanguigno'
    ];

    for (const field of requiredFields) {
      const invalidData = { ...validPatientData };
      delete invalidData[field];

      const response = await request(API_URL)
        .post('/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message.toLowerCase()).toContain("required");
    }
  });

  it('should fail with invalid date format', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send({
        ...validPatientData,
        datanascita: 'invalid-date'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('date');
  });

  it('should fail with invalid fiscal code format', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send({
        ...validPatientData,
        cf: 'invalid'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message.toLowerCase()).toContain('fiscal code');
  });
});
