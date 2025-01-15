import app from './app';
import config from './config/server';
import { db } from './config/database';

const startServer = async () => {
  try {
    // Connect to database
    await db.connect();
    console.log('Successfully connected to database');

    // Start server
    app.listen(config.server.port, () => {
      console.log(`Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
      console.log(`API available at: ${config.server.apiPrefix}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  db.disconnect().finally(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  db.disconnect().finally(() => {
    process.exit(1);
  });
});

startServer();