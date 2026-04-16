# AI Image Generation Prompt Library

A full-stack web application designed to manage, share, and track usage of AI image generation prompts. This system supports adding detailed prompts alongside a complexity rating (1-10) and keeps track of how many times each prompt has been viewed using a high-performance Redis cache layer. 

The application utilizes a production-ready authentication flow with HTTP-Only cookies and encrypted passwords.

## System Architecture

The overall application follows a conventional scalable architecture, containerized with Docker to ensure consistency across environments.

1. **Frontend (React + TypeScript + Vite)**
    - Uses Context API for global state management. The Auth state relies on invisible backend pings to verify HTTP cookies.
    - Styled using Tailwind CSS for a highly responsive, modern, premium Dark Mode UI.
    - Uses React Router for navigation (Dashboard, Details, Login, Sign Up).

2. **Backend (Node.js + Express + TypeScript)**
    - Built with Express to serve structured REST API endpoints.
    - Uses Prisma as an ORM to interact with the database natively via Typescript bindings.
    - Utilizes `bcryptjs` for salting/hashing user passwords, and `cookie-parser` to issue secure JWTs directly to user browsers.

3. **Database (PostgreSQL)**
    - The source of truth for all users (username, email, password hashes) and prompt data (title, content, complexity, creation timestamp).

4. **Cache (Redis)**
    - Fast, in-memory data store acting as the source of truth for prompt view counts. Decreases read-latency and database-locking in highly concurrent view increments.

## Folder Structure

Following a hybrid scalable hierarchy inspired by standard Node.js/React setups:

```text
ai-prompt-library/
├── backend/                  # Server codebase
│   ├── src/
│   │   ├── config/           # Database connections, Redis clients, Authentication middlewares
│   │   ├── prompts/          # Domain Logic (Controllers)
│   │   │   ├── urls.ts       # Route endpoints configuration
│   │   │   ├── views.ts      # Core request/response logic and database hooks
│   │   ├── index.ts          # Express entry-point
│   ├── prisma/               # Postgres DB Schema (User and Prompt models)
│   ├── Dockerfile
├── frontend/                 # UI codebase
│   ├── src/
│   │   ├── components/
│   │   │   ├── prompt-list/  # Components for displaying all prompts
│   │   │   ├── prompt-detail/# Single prompt viewer
│   │   │   ├── add-prompt/   # Form handling the creation of new prompts
│   │   │   ├── login/        # Login and Signup forms tracking true user state
│   │   ├── services/         # API wrappers enforcing credentialized cross-origin headers
│   │   ├── context/          # Context API definitions
│   │   ├── App.tsx           # Router and App container
│   ├── Dockerfile
├── docker-compose.yml        # Orchestration configurations
├── .env                      # Environment placeholders
└── README.md
```

## Database Schema (Prisma)

- **User**: Tracks `id`, unique `username`, unique `email`, `passwordHash` (Bcrypt), and `createdAt`.
- **Prompt**: Tracks `id`, `title`, `content`, `complexity` (1-10), `authorId` (Linked to User), and `createdAt`.

## API Routing Guide

### Authentication (Secure HTTP-Only Cookies)
- `POST /api/auth/signup` - Hashes provided passwords and generates a new record in Postgres. Issues JWT tracking cookie on success.
- `POST /api/auth/login` - Computes and compares hashed credentials. Issues JWT tracking cookie.
- `POST /api/auth/logout` - Revokes tracking cookie.
- `GET /api/auth/me` - Verifies presence and legitimacy of incoming HttpOnly token returning user details (Silent Verify).

### Prompts
- `GET /api/prompts` - Retrieve a listing of all stored prompts.
- `GET /api/prompts/:id` - Fetch details for a specific prompt and simultaneously increment/return its `view_count` natively tracked via Redis.
- `POST /api/prompts` - Insert a new prompt. Requires valid Authentication (intercepts cookies securely via middleware).
- `DELETE /api/prompts/:id` - Removes a prompt (Requires Auth).

## Setup Instructions

1. Ensure Docker Desktop is installed and running.
2. Run `docker-compose up --build -d` from the root directory.
3. Access the UI at `http://localhost:3000`.
