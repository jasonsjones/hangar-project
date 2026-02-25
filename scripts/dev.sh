#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e
# Enable job control so background jobs get their own process groups (needed for clean shutdown)
set -m

# Load environment variables from .env (create from .env.example if missing)
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Copy .env.example to .env and configure your secrets."
  echo "   Run: cp .env.example .env"
  exit 1
fi
set -a
source .env
set +a

echo "🚀 Starting development environment (no Docker image builds)..."

# 1. Remove existing db container and volume for fresh start (in case db name/creds changed)
echo "🗑️  Removing existing database and volume for fresh start..."
docker compose down -v 2>/dev/null || true

# 2. Start the database only (uses pre-built postgres image, no build)
echo "🐳 Starting database..."
docker compose up -d db

# Wait for Postgres to be ready
echo "⏳ Waiting for database to be ready..."
until docker compose exec -T db pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" 2>/dev/null; do
  sleep 1
done
echo "✅ Database ready"

# 3. Install client dependencies if needed
if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# 4. Start server in background (connects to localhost postgres)
echo "🔧 Starting server..."
(
  cd server
  export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/${POSTGRES_DB}"
  export SPRING_DATASOURCE_USERNAME
  export SPRING_DATASOURCE_PASSWORD
  export SPRING_JPA_HIBERNATE_DDL_AUTO
  mvn spring-boot:run
) &
SERVER_PID=$!

# 5. Start client dev server
echo "🎨 Starting client..."
cd client
npm run dev &
CLIENT_PID=$!

# Cleanup on exit - kill process groups so Java (mvn) and Node (npm) children are terminated
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  # Kill process groups (negative PID) to terminate entire trees: mvn->java, npm->node
  [ -n "$SERVER_PID" ] && kill -TERM -- -$SERVER_PID 2>/dev/null || true
  [ -n "$CLIENT_PID" ] && kill -TERM -- -$CLIENT_PID 2>/dev/null || true
  # Give processes a moment to exit gracefully
  sleep 2
  # Force kill any stragglers
  [ -n "$SERVER_PID" ] && kill -KILL -- -$SERVER_PID 2>/dev/null || true
  [ -n "$CLIENT_PID" ] && kill -KILL -- -$CLIENT_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
