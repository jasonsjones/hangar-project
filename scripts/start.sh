#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting the Monorepo Orchestrator..."

# 1. Build the Backend (Spring Boot)
echo "📦 Building server..."
cd packages/server
mvn clean package -DskipTests
cd ../..

# 2. Build the Frontend (React TypeScript)
echo "📦 Building client..."
cd packages/client
npm install
npm run build
cd ../..

# 3. Spin up the Docker containers
echo "🐳 Launching Docker Compose..."
# --build ensures Docker picks up the newly created JAR and static files
docker-compose up --build -d

echo "✅ App is running!"
echo "Client: http://localhost:5173"
echo "Server API: http://localhost:8080/api"
