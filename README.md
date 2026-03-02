# 🟡 Playground

**A public sticky-note wall where anyone can leave a note for the world to see.**

Register, stick a note on the wall, and it stays there for everyone. Think of it as a digital graffiti board — except cleaner. Everyone sees every note, but only you can edit or delete yours.

The idea is simple: if you exist and want the world to know, leave a note. It could be a thought, a joke, a quote, your name, or just "I was here." The wall remembers.

Built as a full-stack project from scratch — React frontend, Python backend, PostgreSQL database, Dockerized for local development, and deployed to AWS ECS Fargate. No templates, no boilerplate generators, no shortcuts.

---

## The Problem

Most note-taking apps are private by design — they're for you and you alone. But sometimes you just want to say something to nobody in particular. You want to put something out there, not in a tweet that gets buried in 30 seconds, not in a story that disappears in 24 hours, but on a quiet little wall that just... sits there.

Playground is that wall.

It also happens to solve a more practical problem: building a real, production-grade full-stack application that covers every layer of the modern web stack — from frontend component design to backend authentication, database management, containerization, and cloud deployment.

---

## Screenshots

| Public Wall (Logged Out) | Logged In |
|:---:|:---:|
| ![Public Wall](screenshots/wall-logged-out.png) | ![Logged In](screenshots/wall-logged-in.png) |

| Creating a Note | Multiple Notes |
|:---:|:---:|
| ![Create Note](screenshots/create-note.png) | ![Notes Wall](screenshots/multiple-notes.png) |
---

## Features

- **Public Note Wall** — Every note posted by every user is visible to everyone. No private silos.
- **User Authentication** — Register with email and password. Passwords are hashed with bcrypt before they ever touch the database.
- **Secure Sessions via HttpOnly Cookies** — JWTs are stored in HttpOnly cookies, which means JavaScript can't read them. Even if the app had an XSS vulnerability, your session token can't be stolen.
- **Ownership-Based Permissions** — You can only edit or delete notes you wrote. The delete button only appears on *your* notes. Even if someone tried to bypass the UI, the backend rejects unauthorized requests with `403 Forbidden`.
- **Strong Password Enforcement** — Minimum 8 characters, at least one uppercase letter, at least one number. No `password123` allowed.
- **Nginx Reverse Proxy** — The frontend container routes all `/api/` requests through Nginx to the backend. This makes cookies work without HTTPS and keeps the architecture clean.
- **Dark Mode Support** — The note wall supports a dark theme toggle.
- **Responsive Grid Layout** — Notes are displayed in a CSS Grid that adapts from desktop to mobile.
- **Real-time UI Updates** — Creating, editing, or deleting a note instantly updates the wall without a page reload.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + TypeScript | Type safety catches bugs before they ship. React's component model keeps the UI modular. |
| **Styling** | Vanilla CSS | Full control over the design. No utility class bloat. CSS variables power the dark mode toggle. |
| **Backend** | FastAPI (Python) | Async-first, automatic OpenAPI docs at `/docs`, and Pydantic handles request validation out of the box. |
| **Database** | PostgreSQL (Neon) | Serverless Postgres — scales to zero when idle, no server management. Standard SQL, nothing proprietary. |
| **ORM** | SQLAlchemy 2.0 | Maps Python classes to database tables. Handles connection pooling and query building cleanly. |
| **Auth** | bcrypt + python-jose (JWT) | bcrypt for password hashing (one-way, salted). python-jose for creating and verifying JSON Web Tokens. |
| **Web Server** | Nginx | Serves the React static build and reverse-proxies `/api/` requests to the backend. Enables HttpOnly cookies over plain HTTP. |
| **Containerization** | Docker + Docker Compose | One command (`docker compose up`) runs both frontend and backend locally. Consistent environments everywhere. |
| **Cloud** | AWS ECS Fargate | Serverless container orchestration. No EC2 instances to manage. Push an image, ECS runs it. |
| **Container Registry** | AWS ECR | Private Docker image storage, integrated with ECS. |
| **Secrets Management** | AWS SSM Parameter Store | Database credentials are stored as encrypted SecureStrings — never hardcoded in task definitions or code. |

---

## Architecture Overview

```
Browser (port 80)
    │
    ▼
 Nginx (Frontend Container)
    │
    ├── GET /           → Serves React static files (HTML/CSS/JS)
    │
    └── /api/*          → Reverse proxy to Backend Container (port 8000)
                              │
                              ├── POST /auth/register   → Hash password, create user
                              ├── POST /auth/login      → Verify password, set HttpOnly cookie
                              ├── POST /auth/logout     → Delete cookie
                              ├── GET  /auth/me         → Decode JWT → return current user
                              ├── GET  /notes/          → Public: returns all notes
                              ├── POST /notes/          → Authenticated: create a note
                              ├── PATCH /notes/{id}     → Authenticated + owner only: edit
                              └── DELETE /notes/{id}    → Authenticated + owner only: delete
                                        │
                                        ▼
                                  PostgreSQL (Neon)
                                  ├── users (id, email, hashed_password)
                                  └── notes (id, title, body, user_id, created_at)
```

**Why the reverse proxy?**

HttpOnly cookies require the frontend and backend to be on the same origin (same domain + port). Without a custom domain and SSL certificate, the browser considers `frontend-ip:80` and `backend-ip:8000` as different origins and refuses to send cookies cross-origin.

The Nginx reverse proxy solves this by making the browser think everything comes from one server at port 80. Requests to `/api/notes/` hit Nginx, which silently forwards them to the backend. The browser never sees the backend directly, so cookies flow normally.

**Why runtime `envsubst` instead of build-time `sed`?**

ECS Fargate assigns ephemeral public IPs to tasks. Every time a service redeploys, the backend can get a new IP. Originally, the backend URL was baked into the Nginx config at Docker build time — meaning every IP change required a full image rebuild.

Now, the Nginx config uses `${VITE_API_URL}` as a template variable. The official `nginx:alpine` image automatically runs `envsubst` on files in `/etc/nginx/templates/` during container startup, reading the value from the environment. This means the ECS task definition can update the backend URL without rebuilding the frontend image.

---

## Installation

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A PostgreSQL database URL (get one free from [Neon](https://neon.tech))
- Git

### 1. Clone the repo

```bash
git clone https://github.com/Rohitrout416/Notes-App.git
cd Notes-App
```

### 2. Set up the backend environment

Create a `.env` file inside the `backend/` directory:

```bash
echo 'DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require' > backend/.env
```

Replace the URL with your actual Neon (or any Postgres) connection string.

### 3. Run with Docker Compose

```bash
docker compose up --build
```

That's it. This builds both containers and starts them:
- **Frontend** → [http://localhost:5173](http://localhost:5173)
- **Backend API docs** → [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. (Optional) Run without Docker

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend/Note-app
npm install
npm run dev
```

The Vite dev server is preconfigured to proxy `/api/` requests to `localhost:8000`.

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `backend/.env` | PostgreSQL connection string. Stored in AWS SSM Parameter Store in production — never hardcoded in task definitions. |
| `JWT_SECRET_KEY` | `backend/.env` (optional) | Secret key used to sign JWT tokens. Defaults to a placeholder — **change this in production.** |
| `VITE_API_URL` | ECS task definition (runtime) | The backend's `http://IP:8000` URL. Injected into the Nginx container at startup via `envsubst`. Only needed for cloud deployment. |

---

## API Examples

### Register a new user

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "StrongPass1"}'
```

```json
{"email": "you@example.com", "id": 1, "notes": []}
```

### Log in (sets HttpOnly cookie)

```bash
curl -i -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "StrongPass1"}'
```

Response headers include:
```
set-cookie: access_token="Bearer eyJhbG..."; HttpOnly; Max-Age=604800; Path=/; SameSite=lax
```

### Create a note (requires auth cookie)

```bash
curl -X POST http://localhost:8000/notes/ \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=Bearer eyJhbG..." \
  -d '{"title": "Hello World", "body": "I was here."}'
```

### Get all notes (public, no auth needed)

```bash
curl http://localhost:8000/notes/
```

---

## Design Decisions & Trade-offs

### HttpOnly Cookies over `localStorage`

Storing JWTs in `localStorage` is simpler but inherently insecure — any XSS vulnerability gives attackers full access to the token. HttpOnly cookies can't be read by JavaScript at all. The trade-off is added complexity: you need a reverse proxy for same-origin cookie delivery, and the logout flow requires a server-side endpoint to clear the cookie (since the frontend can't delete it).

### Nginx Reverse Proxy over CORS

Instead of configuring `allow_credentials=True` with specific `allow_origins` (which breaks when IPs change on every deployment), the Nginx proxy makes everything same-origin. No CORS headers needed for the cookie flow. The backend still has a permissive CORS policy for the Swagger docs to work.

### Neon (Serverless Postgres) over self-hosted

Neon scales to zero when idle — no cost for a portfolio project sitting unused. The trade-off: Neon's serverless nature drops idle connections after ~5 minutes. Fixed with `pool_pre_ping=True` in SQLAlchemy, which tests connections before using them and reconnects automatically.

### Runtime `envsubst` over build-time `sed`

ECS Fargate assigns ephemeral IPs. Originally, the backend URL was baked into the Nginx config with `sed` during `docker build`. Every backend redeployment (new IP) required rebuilding the entire frontend image. Switching to `envsubst` at container startup reads the URL from the environment, making the frontend image reusable across deployments.

### No database migrations tool

For a project at this scale, `create_all()` handles schema creation. Adding Alembic migrations would be the right move if the schema needed to evolve without data loss. Currently, dropping and recreating tables means losing existing data — acceptable during initial development, not in production.

---

## Known Limitations

- **No HTTPS** — The app runs on plain HTTP. HttpOnly cookies work because `secure=False` is explicitly set. In a real production environment, you'd need a domain name and an SSL certificate (via AWS ACM + Application Load Balancer or Cloudflare).
- **Ephemeral IPs on ECS** — Without a Load Balancer or Elastic IP, the public IP changes on every deployment. The frontend's runtime `envsubst` helps, but you still need to update the ECS task definition with the new backend IP manually.
- **No rate limiting** — The registration and login endpoints have no rate limiting. A production deployment would need something like `slowapi` or an API Gateway throttle.
- **No email verification** — Users can register with any email address without proving they own it.
- **No pagination** — All notes are fetched in a single `GET /notes/` call. Works fine for dozens of notes, would need cursor-based pagination for thousands.
- **JWT stored as a single secret** — Token revocation isn't possible without a token blacklist or switching to short-lived access tokens + refresh tokens.

---

## Future Improvements

- [ ] **Custom domain + HTTPS** via AWS ACM and an Application Load Balancer
- [ ] **Alembic database migrations** for safe schema evolution
- [ ] **Rate limiting** on auth endpoints
- [ ] **Email verification** on registration
- [ ] **Pagination** with cursor-based infinite scroll on the note wall
- [ ] **Search and filtering** — find notes by keyword or date
- [ ] **AI-powered features** — auto-summarize notes, fix grammar, or generate replies
- [ ] **WebSocket real-time updates** — see new notes appear on the wall live without refreshing
- [ ] **User profiles** — avatars, display names, and a page showing all notes by one user

---

## Contributing

This is a personal project, but if you want to contribute:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-idea`)
3. Commit your changes (`git commit -m 'Add: your feature'`)
4. Push to the branch (`git push origin feature/your-idea`)
5. Open a Pull Request

Keep commits clean and focused. If you're fixing a bug, include steps to reproduce it.

---

## Author

**Rohit Kumar Rout**
- GitHub: [@Rohitrout416](https://github.com/Rohitrout416)

---

## Author Notes

This was my first full-stack project built from scratch — no tutorials followed step-by-step, no boilerplate cloned. Every decision, from choosing HttpOnly cookies over localStorage to setting up the Nginx reverse proxy to deploying on ECS Fargate, was made by actually running into the problem and solving it.

The code isn't perfect. There are things I'd do differently if I started over (Alembic from day one, a proper domain with HTTPS, maybe Next.js instead of a separate Nginx container). But that's the point — you learn the *why* behind best practices by first doing it the manual way.

If you're reading this and thinking about building your own full-stack project: do it. Don't wait until you "know enough." I didn't. You figure it out as you go.

*— Rohit*
