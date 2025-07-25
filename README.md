# MERN Stack with Docker

This project is a boilerplate MERN (MongoDB, Express, React, Node.js) stack application using Docker for easy setup and orchestration.

## Folder Structure

- `backend/` - Express.js API with MongoDB (via Mongoose)
- `frontend/` - React app (Vite)
- `docker-compose.yml` - Orchestrates MongoDB, backend, and frontend

## Quick Start

1. **Build and start all services:**
   ```sh
   docker-compose up --build
   ```

2. **Access the apps:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - MongoDB: [localhost:27017](mongodb://localhost:27017)

## Environment Variables

- Backend: See `backend/.env` for MongoDB connection and port.

## Notes
- Hot reloading is enabled via Docker volumes for both backend and frontend.
- You can add your own API routes and React components as needed. 