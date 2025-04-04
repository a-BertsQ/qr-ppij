#!/bin/bash

# Make the script exit on any error
set -e

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed. Please install Node.js and try again."
  exit 1
fi

# Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is not installed. Please install npm and try again."
  exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️ .env file not found. Please make sure your environment variables are set up correctly."
  exit 1
fi

# Generate Prisma client if needed
if [ ! -d "node_modules/.prisma" ]; then
  echo "🔄 Generating Prisma client..."
  npx prisma generate
fi

# Run the create-superadmin script
echo "🔑 Running create-superadmin script..."
npx ts-node --project tsconfig.scripts.json scripts/create-superadmin.ts

