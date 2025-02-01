# Medical Clinic Reservation System

A full-stack application for managing medical clinic reservations.

## Project Structure

```
.
├── frontend/         # React frontend application
├── backend/         # Express.js backend API
└── db/             # Database scripts and schemas
```

## Development Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
- Copy `backend/.env.example` to `backend/.env` and update the values
- Frontend environment files are already set up for development and production

3. Start development servers:

For frontend:
```bash
npm run dev:frontend
```

For backend:
```bash
npm run dev:backend
```

## Deployment on Vercel

1. Push your code to a Git repository

2. Create a new project on Vercel and link your repository

3. Add the following environment variables in Vercel:
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `JWT_SECRET`: Secret key for JWT token generation

4. Deploy! Vercel will automatically:
   - Build the frontend
   - Set up the backend as serverless functions
   - Handle routing between frontend and API

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL database connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3000)

### Frontend
- Development: API calls go to `http://localhost:3000`
- Production: API calls go to `/api` (handled by Vercel)
