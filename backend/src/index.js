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

// Initialize
config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/doctor', authenticateToken, doctorRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
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

export { app, prisma };