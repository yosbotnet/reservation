import { PrismaClient } from '@prisma/client';
import { DatabaseError } from '../utils/errors';

class Database {
  private static instance: Database;
  private prisma: PrismaClient;
  private isConnected: boolean = false;

  private constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'minimal',
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.prisma.$connect();
      this.isConnected = true;
      console.log('Successfully connected to database');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw new DatabaseError('Failed to connect to database');
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('Successfully disconnected from database');
    } catch (error) {
      console.error('Failed to disconnect from database:', error);
      throw new DatabaseError('Failed to disconnect from database');
    }
  }

  public getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new DatabaseError('Database is not connected');
    }
    return this.prisma;
  }

  public async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(fn);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new DatabaseError('Transaction failed');
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const db = Database.getInstance();
