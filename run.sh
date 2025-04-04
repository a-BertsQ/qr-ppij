#!/bin/bash

# Make the script exit on any error
set -e

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
  echo "❌ Node.js is not installed. Please install Node.js and try again."
  exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
  echo "❌ npm is not installed. Please install npm and try again."
  exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️ .env file not found. Creating from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example. Please update it with your configuration."
  else
    echo "❌ .env.example file not found. Please create a .env file manually."
    exit 1
  fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Check database connection
echo "🔍 Checking database connection..."
npx ts-node --transpile-only scripts/check-db.ts

if [ $? -eq 0 ]; then
  echo "✅ Database connection successful!"
else
  echo "❌ Database connection failed. Please check your DATABASE_URL in .env"
  exit 1
fi

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Start the development server
echo "🚀 Starting development server..."
npm run dev

