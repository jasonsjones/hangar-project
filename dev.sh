#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting development environment (no Docker image builds)..."

# 1. Start the database only (uses pre-built postgres image, no build)
echo "🐳 Starting database..."
docker compose up -d db

# Wait for Postgres to be ready
echo "⏳ Waiting for database to be ready..."
until docker compose exec -T db pg_isready -U pilot_user -d hanger_db 2>/dev/null; do
  sleep 1
done
echo "✅ Database ready"

# 2. Install client dependencies if needed
if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# 3. Start server in background (connects to localhost postgres)
echo "🔧 Starting server..."
(
  cd server
  export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/hanger_db
  export SPRING_DATASOURCE_USERNAME=pilot_user
  export SPRING_DATASOURCE_PASSWORD=postgres
  mvn spring-boot:run
) &
SERVER_PID=$!

# 4. Start client dev server
echo "🎨 Starting client..."
cd client
npm run dev &
CLIENT_PID=$!

# Cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $SERVER_PID 2>/dev/null || true
  kill $CLIENT_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
