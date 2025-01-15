import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import config from './config/server';
import { db } from './config/database';
import { AppError } from './utils/errors';
// Database connection
const connectDB = async () => {
  try {
    await db.connect();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};
// Connect to database on startup
connectDB();
// Import routes
const patientRoutes = require('./routes/patient').default;
const doctorRoutes = require('./routes/doctor').default;
const surgeryRoutes = require('./routes/surgery').default;
const nursingRoutes = require('./routes/nursing').default;
const postOpRoutes = require('./routes/postOp').default;

const app = express();

// Middleware
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use(`${config.server.apiPrefix}/patients`, patientRoutes);
app.use(`${config.server.apiPrefix}/doctors`, doctorRoutes);
app.use(`${config.server.apiPrefix}/surgeries`, surgeryRoutes);
app.use(`${config.server.apiPrefix}/nursing`, nursingRoutes);
app.use(`${config.server.apiPrefix}/post-op`, postOpRoutes);

// Health check endpoint
app.get(`${config.server.apiPrefix}/health`, async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await db.healthCheck();
    res.json({
      status: 'ok',
      timestamp: new Date(),
      database: dbHealthy ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date(),
      database: 'error'
    });
  }
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// 404 handler for unmatched routes
const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.path}`
  });
};

// Register error handlers
app.use('*', notFoundHandler);
app.use(errorHandler);



// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    await db.disconnect();
    console.log('Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);



export default app;