const request = require('supertest');
const bcrypt = require('bcryptjs');
const { app, prisma } = require('../test-app.js');

// Use a different port for tests
const API_URL = 'http://localhost:4001';
const { createTestUser } = require('../setup.js');

describe('POST /auth/login', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user with known credentials
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    testUser = await createTestUser({
      username: 'testlogin',
      password: hashedPassword
    });
  });

  it('should login successfully with valid credentials', async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({
        username: 'testlogin',
        password: 'testpass123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toMatchObject({
      cf: testUser.cf,
      username: testUser.username,
      tipoutente: testUser.tipoutente
    });
  });

  it('should fail with invalid password', async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({
        username: 'testlogin',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should fail with non-existent username', async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({
        username: 'nonexistent',
        password: 'testpass123'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should fail with missing username', async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({
        password: 'testpass123'
      });

    expect(response.status).toBe(400);
  });

  it('should fail with missing password', async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({
        username: 'testlogin'
      });

    expect(response.status).toBe(400);
  });
});
