const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function setupTestDb() {
  const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/clinica_test";
  
  try {
    // Drop existing database if it exists
    console.log('Dropping existing test database if it exists...');
    try {
      await execAsync('dropdb -U postgres clinica_test --if-exists');
    } catch (error) {
      if (!error.message.includes('does not exist')) {
        throw error;
      }
    }

    // Create fresh test database
    console.log('Creating test database...');
    await execAsync('createdb -U postgres clinica_test');

    // Set environment variable for Prisma
    process.env.DATABASE_URL = DATABASE_URL;

    // First, generate the Prisma client
    console.log('Generating Prisma Client...');
    await execAsync('npx prisma generate --schema=src/prisma/schema.prisma');

    // Push the schema directly to the database
    console.log('Pushing schema to database...');
    await execAsync('npx prisma db push --schema=src/prisma/schema.prisma --accept-data-loss --force-reset');

    console.log('Test database setup complete!');
  } catch (error) {
    console.error('Error setting up test database:', error);
    console.error(error.message);
    process.exit(1);
  }
}

setupTestDb();