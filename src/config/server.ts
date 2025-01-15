import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string | string[];
  apiPrefix: string;
  logLevel: string;
  rateLimitWindow: number; // in minutes
  rateLimitMax: number; // requests per window
}

interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
}

interface Config {
  server: ServerConfig;
  security: SecurityConfig;
}

// Default configuration values
const defaultConfig: Config = {
  server: {
    port: 3000,
    nodeEnv: 'development',
    corsOrigin: '*',
    apiPrefix: '/api',
    logLevel: 'info',
    rateLimitWindow: 15,
    rateLimitMax: 100
  },
  security: {
    jwtSecret: 'your-secret-key',
    jwtExpiresIn: '1d',
    bcryptSaltRounds: 10
  }
};

// Environment-specific configuration
const config: Config = {
  server: {
    port: parseInt(process.env.PORT || defaultConfig.server.port.toString(), 10),
    nodeEnv: process.env.NODE_ENV || defaultConfig.server.nodeEnv,
    corsOrigin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      defaultConfig.server.corsOrigin,
    apiPrefix: process.env.API_PREFIX || defaultConfig.server.apiPrefix,
    logLevel: process.env.LOG_LEVEL || defaultConfig.server.logLevel,
    rateLimitWindow: parseInt(
      process.env.RATE_LIMIT_WINDOW || 
      defaultConfig.server.rateLimitWindow.toString(),
      10
    ),
    rateLimitMax: parseInt(
      process.env.RATE_LIMIT_MAX || 
      defaultConfig.server.rateLimitMax.toString(),
      10
    )
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || defaultConfig.security.jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || defaultConfig.security.jwtExpiresIn,
    bcryptSaltRounds: parseInt(
      process.env.BCRYPT_SALT_ROUNDS || 
      defaultConfig.security.bcryptSaltRounds.toString(),
      10
    )
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Validate configuration
if (config.server.nodeEnv !== 'development' && 
    config.security.jwtSecret === defaultConfig.security.jwtSecret) {
  throw new Error(
    'Production environment detected but using default JWT secret. ' +
    'Please set a secure JWT_SECRET environment variable.'
  );
}

export default config;

// Helper function to check if we're in production
export const isProd = config.server.nodeEnv === 'production';

// Helper function to check if we're in development
export const isDev = config.server.nodeEnv === 'development';

// Helper function to check if we're in test
export const isTest = config.server.nodeEnv === 'test';