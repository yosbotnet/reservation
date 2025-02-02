#!/bin/bash

# Surgical Reservation System Startup Script
# This script handles the build and deployment process for both frontend and backend
# Requirements:
# - Ubuntu Server
# - Node.js 18+ and npm
# - PostgreSQL 14+
# - pm2 for process management (npm install -g pm2)

echo "🏥 Starting Surgical Reservation System deployment..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check requirements
echo "🔍 Checking system requirements..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

if ! command_exists psql; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14 or higher."
    exit 1
fi

if ! command_exists pm2; then
    echo "📦 Installing pm2..."
    npm install -g pm2
fi

# Backend setup
echo "🔧 Setting up backend..."
cd backend || exit 1

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate --schema=src/prisma/schema.prisma

# Run database migrations
echo "🗃️ Running database migrations..."
npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Build backend
echo "🏗️ Building backend..."
npm run build

# If build fails, exit
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed. Please check the error messages above."
    exit 1
fi

# Frontend setup
echo "🔧 Setting up frontend..."
cd ../frontend || exit 1

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Start services using PM2
echo "🚀 Starting services..."
cd ..

# Start backend
pm2 start backend/build/index.js --name "surgical-reservation-backend"

# Serve frontend using serve
npm install -g serve
pm2 start serve --name "surgical-reservation-frontend" -- -s frontend/build -l 8787

echo "✅ Deployment complete!"
echo "Backend API is running on port 8888"
echo "Frontend is running on port 8787"
echo "Use 'pm2 status' to check running services"
echo "Use 'pm2 logs' to view logs"
echo "Use 'pm2 stop all' to stop all services"

# Add pm2 startup to ensure services restart on server reboot
pm2 startup
pm2 save

echo "🔒 Services will automatically restart on system reboot"
