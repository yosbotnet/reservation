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

# Check database migration status and prompt for confirmation
echo "🗃️ Checking database migration status..."
npx prisma migrate status --schema=src/prisma/schema.prisma

# Show pending migrations
echo "📋 Pending migrations:"
npx prisma migrate diff --from-schema-datamodel src/prisma/schema.prisma --to-schema-datasource src/prisma/schema.prisma

# Prompt for migration confirmation
read -p "⚠️ Do you want to proceed with database migrations? This could potentially affect your data. (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "🛑 Migration skipped. Please review and apply migrations manually if needed."
else
    echo "🗃️ Running database migrations..."
    npx prisma migrate deploy --schema=src/prisma/schema.prisma
fi

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

# Start backend (check if dist or build directory exists)
if [ -f backend/dist/index.js ]; then
    pm2 start backend/dist/index.js --interpreter node --name "surgical-reservation-backend"
elif [ -f backend/build/index.js ]; then
    pm2 start backend/build/index.js --interpreter node --name "surgical-reservation-backend"
else
    echo "❌ Cannot find backend build output. Please check if the build generated the correct files."
    exit 1
fi

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