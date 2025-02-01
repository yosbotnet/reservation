import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import doctorRoutes from './routes/doctor.js';
import adminRoutes from './routes/admin.js';

// Middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';

// Initialize environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma with connection pooling for serverless
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  connectionTimeout: 20000, // 20 seconds
});

// Middleware for Prisma connection management in serverless
let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await prisma.$connect();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

// Cleanup middleware
app.use(async (req, res, next) => {
  res.on('finish', () => {
    if (process.env.NODE_ENV === 'development') {
      prisma.$disconnect()
        .catch(err => console.error('Error disconnecting from database:', err));
    }
  });
  next();
});
// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes with caching headers for production
const addCacheHeaders = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
  next();
};

app.use('/auth', addCacheHeaders, authRoutes);
app.use('/api/public', addCacheHeaders, publicRoutes);
app.use('/api/doctor', addCacheHeaders, authenticateToken, doctorRoutes);
app.use('/api/admin', addCacheHeaders, authenticateToken, adminRoutes);

// Error handling
app.use(errorHandler);

// Enhanced health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'disconnected'
    });
  }
});

// For Vercel, export the app
export default app;
export { prisma };

// Start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      prisma.$disconnect();
    });
  });
}
