import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import compression from 'compression';  // Move import to top

// Routes
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import doctorRoutes from './routes/doctor.js';
import adminRoutes from './routes/admin.js';

// Middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';

// Singleton pattern for Prisma
const prisma = global.prisma || new PrismaClient({
  log:  ['error'],
});
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Initialize
config();
let server = null;
const app = express();
const PORT = process.env.PORT || 8888;
app.set('workers', 1);

// Middleware (in correct order)
app.use(cors({
  origin: [process.env.CORS_ORIGIN, "http://localhost:3000","https://clinic.ybaro.it"],
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev', {
  skip: (req, res) => res.statusCode < 400,
  stream: process.stderr
}));

app.use(express.json({ limit: '1mb' }));
app.use(compression());  // Only use compression once

// Routes
app.use('/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/doctor', authenticateToken, doctorRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Error handling
const gracefulShutdown = () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
};

if (process.env.NODE_ENV !== 'production') {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

export default app;
export { prisma };