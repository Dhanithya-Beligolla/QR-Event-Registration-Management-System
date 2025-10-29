# QR Event Registration & Attendance

React + Vite client and Node/Express + MongoDB API for QR-based event registration and attendance.

Participants can register and receive a QR code via SMS/Email. Scanning the QR or opening the link marks attendance. Admins manage participants and deliveries from a dashboard.

## Highlights

- Public registration flow with selectable delivery channel (SMS, Email, Both)
- Admin dashboard: upsert participants, send QR, retokenize, view/download QR
- Scan flows: camera-based scanning and token validation; admin scan page
- Reliable QR delivery: inline PNG in email (CID) and direct PNG endpoint `/api/qr/:token.png`
- Security and hygiene: JWT auth, helmet, compression, rate limiting, CORS controls
- Developer-friendly: ESM, layered architecture, Joi validation, paginated lists
- Containerized: Dockerfiles + docker-compose; AWS CI/CD workflows included

## Architecture

- Client (`client/`): React Router app (Vite).
	- Key routes: `/register`, `/attend?token=...`, `/scan`, `/admin/login`, `/admin`, `/admin/scan`
	- Uses `@zxing/library` for QR scanning and `qrcode` for rendering QR fallbacks
- API (`server/`): Express, mounted at `/api`.
	- Routing hub: `server/routes/index.js`
	- Models: `Participant`, `Attendance`, `AdminUser`
	- Services: `participantService`, `attendanceService`, `qrService`, `smsService`, `emailService`
	- Controllers validate with Joi; pagination: `{ items, total, page, pages }`
	- Auth: JWT via `Authorization: Bearer <token>`

```
client (Vite, React Router)  <——>  server (Express API)  <——>  MongoDB
					|                                 |
					|—— calls /api/...                |—— QR gen, email/SMS, JWT, Joi
```

## Repository structure

```
client/                 # React app
server/                 # Express API
docker-compose.yml      # Local stack: Mongo, API, Client
.github/workflows/      # AWS deploy workflows (client + server)
infra/aws/README.md     # AWS deployment guide
```

## Quick start (local dev)

Prereqs
- Node 18+ and npm
- MongoDB local or Atlas (default URI: `mongodb://localhost:27017/qr_event`)

Backend
```bash
cd server
cp .env.example .env
# Edit MONGO_URI, JWT_SECRET, PUBLIC_BASE_URL, CLIENT_ORIGIN, SMTP/SMS vars
npm i
npm run dev
```
Seeds admin if none exists:
- email: `admin@example.com`
- password: `admin123`

Frontend
```bash
cd client
cp .env.example .env
npm i
npm run dev
```
Open http://localhost:5173

### One-command local stack (Docker)

`docker-compose.yml` builds and runs Mongo, API (port 5699), and client (on port 5173 → Nginx 80).

1) Ensure `server/.env` exists (the compose file loads it) and adjust `VITE_*` build args in `docker-compose.yml` for the client.
2) Bring up the stack:

```bash
docker compose up --build
```

## Environment variables

Server (`server/.env`)

- `MONGO_URI` — Mongo connection string (local, Atlas, or DocumentDB/Cosmos Mongo API)
- `JWT_SECRET` — Strong random secret for JWT signing
- `PUBLIC_BASE_URL` — Public URL of the client (e.g., `http://localhost:5173` or CloudFront URL)
- `CLIENT_ORIGIN` — Allowed CORS origin(s), comma-separated
- SMTP (example): `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- SMS provider variables as required by `server/services/smsService.js`

Client (`client/.env`)

- `VITE_API_BASE` — API base URL, e.g., `http://localhost:5699/api`
- `VITE_PUBLIC_BASE_URL` — Public URL for client-side link building, e.g., `http://localhost:5173`

Note: Vite envs are build-time. Change requires a rebuild of the client.

## API overview

Auth
- `POST /api/auth/login` → `{ token, user }`

Participants (JWT required)
- `POST /api/participants` — Upsert a participant: `{ name, email?, phone?, department?, ticketType, category, eventDateTime?ISO }`
- `GET /api/participants?q=&page=&limit=` — List with pagination `{ items, total, page, pages }`
- Retokenize endpoint available via dashboard actions (invalidates old links)

Outbound
- `POST /api/outbound/public/register` — Public registration; accepts participant fields + `via: 'sms'|'email'|'both'`; responds `{ ok, participant, url, qr, delivery }`
- `POST /api/outbound/send-qr` (JWT) — `{ participantId, via }` → `{ url, qr, sms?, email? }`

Attendance (public)
- `GET /api/attendance/validate/:token` → `{ valid, participant? }`
- `POST /api/attendance/mark` — `{ token }` → `{ ok, attendedAt }`

QR image (public)
- `GET /api/qr/:token.png` — Returns PNG QR for direct use in emails or downloads

## Client routes

- `/register` — Public registration form
- `/attend?token=...` — Validates token and marks attendance
- `/scan` — Public camera scanner (redirects to decoded URL)
- `/admin/login` → `/admin` — Admin dashboard for participants/attendance/QR sending
- `/admin/scan` — Admin scanner to validate/mark attendance

## Build & run scripts

- Server: `npm run dev` (dev), `npm run start` (prod)
- Client: `npm run dev` (dev), `npm run build` + `npm run preview` (prod preview)

## Deployment

### Azure (recommended when available)
- Containerize API and client; deploy to Azure Container Apps (API and/or client) or use Azure Static Web Apps for the client.
- Configure env vars: `MONGO_URI`, `JWT_SECRET`, `PUBLIC_BASE_URL`, `CLIENT_ORIGIN`, SMTP/SMS settings.

### AWS (ready-to-use workflows)

- API via App Runner; Client via S3 + CloudFront.
- Workflows:
	- `.github/workflows/server-deploy-app-runner.yml`
	- `.github/workflows/client-deploy-s3-cloudfront.yml`
- See `infra/aws/README.md` for step-by-step setup and required GitHub secrets:
	- General: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
	- Server: `ECR_REPOSITORY`, `APP_RUNNER_SERVICE_ARN`
	- Client: `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID` (optional)
	- Build-time: `VITE_API_BASE`, `VITE_PUBLIC_BASE_URL`

## Security notes

- Always use HTTPS in production; terminate TLS at your edge (App Runner, CloudFront, reverse proxy)
- Keep `JWT_SECRET` and SMTP/SMS credentials in a secure secret store
- Configure `CLIENT_ORIGIN` precisely; enable rate limiting and Helmet (already enabled)
- If emailing images, CID attachments are used for better client support

## Troubleshooting

- API won’t start locally: verify `server/.env` and Mongo connectivity
- CORS errors in browser: ensure `CLIENT_ORIGIN` matches the client origin
- Emails not delivered: check SMTP creds and provider logs; ensure from-address is allowed
- Client talks to wrong API: update `VITE_API_BASE` and rebuild the client
- QR image not shown via endpoint: confirm `GET /api/qr/:token.png` is reachable from the client origin

## Contributing

PRs and issues welcome. Keep changes scoped and include brief testing notes. Follow the existing ESM and layered patterns.

## License

MIT. Consider adding a `LICENSE` file at the repo root.

## Deployment options

### Option A: Azure (preferred when available)
- Containerize API and client (already included). Deploy to Azure Container Apps and serve client either as a container or via Azure Static Web Apps.
- Configure environment variables: `MONGO_URI`, `JWT_SECRET`, `PUBLIC_BASE_URL`, `CLIENT_ORIGIN`, and your SMTP/SMS settings.

### Option B: AWS (alternative)
Two simple paths:

1) API with AWS App Runner + Client on S3/CloudFront
- Build and push the server image to Amazon ECR; App Runner runs the container and handles HTTPS, scaling, and logging.
- Build the client and deploy static assets to an S3 bucket fronted by CloudFront.
- Set client build-time envs: `VITE_API_BASE` to the App Runner URL + `/api`, and `VITE_PUBLIC_BASE_URL` to your CloudFront URL.
- Set API env vars in App Runner: `MONGO_URI`, `JWT_SECRET`, `PUBLIC_BASE_URL` (CloudFront URL), `CLIENT_ORIGIN` (CloudFront URL).

2) ECS Fargate (API) + S3/CloudFront (client)
- Similar to App Runner, but with more control using ECS tasks/services behind an ALB.

GitHub Actions (provided):
- `.github/workflows/server-deploy-app-runner.yml` builds/pushes server to ECR and updates an App Runner service.
- `.github/workflows/client-deploy-s3-cloudfront.yml` builds the client, syncs `dist` to S3, and invalidates CloudFront.

Required GitHub secrets:
- General: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- Server: `ECR_REPOSITORY` (name only, e.g., `qr-event-server`), `APP_RUNNER_SERVICE_ARN`
- Client: `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID` (optional)
- Client build-time: `VITE_API_BASE`, `VITE_PUBLIC_BASE_URL`

MongoDB hosting:
- Use MongoDB Atlas (quick) or AWS DocumentDB (Mongo-compatible with caveats). Update `MONGO_URI` accordingly.
