# Hangar Project

A full-stack flight simulator application with a Spring Boot backend and React frontend.

## Tech Stack

### Backend
- **Java 21** with **Spring Boot 4.0.0**
- **PostgreSQL 17** database
- **Spring Security** for authentication
- **Spring Data JDBC** for database access
- **Maven** for build management

### Frontend
- **React 19** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS 4** for styling
- **ESLint** for code quality

### Infrastructure
- **Docker Compose** for orchestration
- **Nginx** as reverse proxy

## Prerequisites

- **Java 21** or higher
- **Node.js 18+** and npm
- **Maven 3.8+**
- **Docker** and **Docker Compose**
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hangar-project
```

### 2. Configure Environment

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env` and set your database credentials:

```env
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=hangar_db
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_secure_password
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

### 3. Development Mode

For local development without building Docker images:

```bash
./scripts/dev.sh
```

This script will:
- Start PostgreSQL in Docker
- Run the Spring Boot server locally (port 8080)
- Run the Vite dev server locally (port 5173)

Access the application at `http://localhost:5173`

### 4. Production Mode

To run the full stack in Docker containers:

```bash
docker compose up --build
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

## Project Structure

```
hangar-project/
├── client/                 # React frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── Dockerfile         # Frontend container
├── server/                 # Spring Boot backend
│   ├── src/               # Java source code
│   ├── pom.xml            # Maven configuration
│   └── Dockerfile         # Backend container
├── scripts/               # Development scripts
│   ├── dev.sh            # Local development script
│   └── start.sh          # Production start script
├── docker-compose.yml     # Container orchestration
├── .env.example          # Environment template
└── README.md             # This file
```

## Available Scripts

### Development

```bash
# Start local development environment
./scripts/dev.sh

# Start client dev server only
cd client && npm run dev

# Start server only
cd server && mvn spring-boot:run
```

### Production

```bash
# Start all services with Docker
docker compose up

# Build and start services
docker compose up --build

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

### Frontend

```bash
cd client

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend

```bash
cd server

# Run tests
mvn test

# Build JAR
mvn clean package

# Run application
mvn spring-boot:run
```

## API Endpoints

The backend API runs on `http://localhost:8080` and includes:

- `GET /status` - Server health check

Additional endpoints can be found in the source code under `server/src/main/java/dev/jasonsjones/hanger_api/`

## Database

The application uses PostgreSQL 17 with the following configuration:

- **Host**: localhost (dev) / db (Docker)
- **Port**: 5432
- **Database**: Configured in `.env`
- **Connection pooling**: Managed by Spring Boot
- **Schema management**: Hibernate DDL auto-update

### Database Healthcheck

The database container includes a healthcheck that ensures it's ready before dependent services start.

## Security

- CSRF protection is disabled for API endpoints to support REST clients
- Spring Security is configured for basic authentication
- Database credentials are managed via environment variables
- Never commit `.env` file to version control

## Development Notes

### Hot Reload

- **Frontend**: Vite provides instant HMR (Hot Module Replacement)
- **Backend**: Spring Boot DevTools enables automatic restart on code changes

### Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | Vite dev server / Nginx |
| Backend | 8080 | Spring Boot API |
| Database | 5432 | PostgreSQL |

### Environment Variables

All environment-specific configuration is managed through the `.env` file. See `.env.example` for required variables.

## Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker compose ps

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Port Already in Use

If ports 5173, 8080, or 5432 are already in use:

```bash
# Find process using port
lsof -i :8080

# Kill the process or change ports in docker-compose.yml
```

### Clean Start

For a completely fresh environment:

```bash
# Remove all containers, volumes, and orphans
docker compose down -v --remove-orphans

# Remove node_modules and rebuild
rm -rf client/node_modules
cd client && npm install

# Clear Maven build artifacts
cd server && mvn clean
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally with `./scripts/dev.sh`
4. Commit with descriptive messages
5. Push and create a pull request

## License

See project license information.

## Contact

For questions or issues, please open a GitHub issue.
