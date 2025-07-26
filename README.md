# Cloud IDE Editor with Docker

This project is a modern Cloud IDE Editor built with the MERN stack (MongoDB, Express, React, Node.js) and containerized with Docker for easy setup, development, and deployment.

## Features

- Interactive code editor with syntax highlighting
- File tree navigation
- Terminal integration
- Dark/light mode support
- MongoDB database for storing user data
- Containerized with Docker for consistent development and deployment

## Architecture

- **Frontend**: React application with Vite, Tailwind CSS, and Ace Editor
- **Backend**: Express.js API with MongoDB (via Mongoose)
- **Database**: MongoDB for data persistence
- **Docker**: Containerization for all services

## Folder Structure

- `frontend/` - React application with code editor and UI components
- `backend/` - Express.js API with MongoDB connection
- `docker-compose.yml` - Orchestrates all services with health checks and dependencies

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git (optional, for cloning the repository)

## Quick Start

1. **Clone the repository (if not already done):**
   ```sh
   git clone <repository-url>
   cd cloud-ide-editor
   ```

2. **Build and start all services:**
   ```sh
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend IDE: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - MongoDB: Available internally at `mongodb://mongo:27017/cloudIDE`

## Development

### Running in Development Mode

```sh
# Start all services with live reloading
docker-compose up

# Rebuild containers after dependency changes
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### Stopping the Services

```sh
# Stop the services
docker-compose down

# Stop and remove volumes (will delete database data)
docker-compose down -v
```

## Environment Variables

### Backend (.env)

- `PORT`: API server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

## Health Checks

The Docker Compose configuration includes health checks for all services to ensure proper startup order and monitoring:

- MongoDB: Checks database connectivity
- Backend: Verifies API availability
- Frontend: Depends on backend health

## Notes

- Hot reloading is enabled via Docker volumes for both backend and frontend
- Node modules are excluded from volume mounting for better performance
- The application uses the latest stable versions of all dependencies
- MongoDB data is persisted in a Docker volume