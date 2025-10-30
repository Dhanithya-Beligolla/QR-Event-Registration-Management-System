# AWS deployment guide (API: App Runner, Client: S3 + CloudFront)

This project ships with GitHub Actions to deploy the API to AWS App Runner and the client to S3/CloudFront.

## 1) Prerequisites
- AWS account with permissions to manage: ECR, App Runner, S3, CloudFront
- GitHub repo-level secrets configured (see below)
- MongoDB connection (Atlas or AWS DocumentDB). Copy the connection string for `MONGO_URI`.

## 2) Create ECR repository (for the API image)
- Name: e.g., `qr-event-server`
- Note the repo name; set it as GitHub secret `ECR_REPOSITORY`.

## 3) Create App Runner service (API)
- Source: Container registry (ECR)
- Image: point to your ECR repo image (temporary tag; the workflow will update to latest commit tag)
- Port: 5699 (matches the Express server)
- Environment variables:
  - `MONGO_URI`: your Atlas/DocumentDB connection string
  - `JWT_SECRET`: strong random string
  - `PUBLIC_BASE_URL`: Client public URL (CloudFront URL you’ll set up later)
  - `CLIENT_ORIGIN`: same as client public URL
  - SMTP/SMS variables as required by `server/services/emailService.js` and `smsService.js`
- Save the App Runner Service ARN, set as GitHub secret `APP_RUNNER_SERVICE_ARN`.

## 4) Create S3 bucket + CloudFront distribution (Client)
- Create an S3 bucket for static hosting (block public access, use CloudFront OAC)
- Create a CloudFront distribution with the S3 bucket as origin
  - Default root object: `index.html`
  - Cache policy: use defaults; SPA works with our GitHub Action (it forces index.html no-cache)
- Note the Distribution ID, set as secret `CLOUDFRONT_DISTRIBUTION_ID`
- Client public URL is the CloudFront domain name

## 5) Configure GitHub secrets
- `AWS_REGION`: e.g., `us-east-1`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (or use OIDC with a role-to-assume)
- Server:
  - `ECR_REPOSITORY`: e.g., `qr-event-server`
  - `APP_RUNNER_SERVICE_ARN`: from step 3
- Client:
  - `S3_BUCKET`: your S3 bucket name
  - `CLOUDFRONT_DISTRIBUTION_ID`: from step 4 (optional but recommended)
  - Build-time envs:
    - `VITE_API_BASE`: e.g., `https://<app-runner-url>/api`
    - `VITE_PUBLIC_BASE_URL`: e.g., `https://<cloudfront-domain>`

## 6) Run the workflows
- On push to `main` affecting `server/**`, the API workflow builds/pushes the image and updates App Runner.
- On push to `main` affecting `client/**`, the Client workflow builds the Vite app and syncs to S3, then invalidates CloudFront.

## 7) CORS and links
- Ensure `CLIENT_ORIGIN` (server env) matches your CloudFront URL.
- Ensure `PUBLIC_BASE_URL` (server env) matches your client public URL.
- `VITE_API_BASE` must point to the API’s public URL + `/api`.

## 8) Troubleshooting
- App Runner 502/503: Check service logs for container crashes; verify `MONGO_URI` and SMTP/SMS envs.
- CORS errors from browser: Double-check `CLIENT_ORIGIN` and CloudFront URL.
- Client shows old build: Confirm CloudFront invalidation ran and index.html is set to no-cache (our workflow enforces this).

## 9) Alternative: ECS Fargate
- Use ECS task + service behind an Application Load Balancer for the API; reuse the same ECR repo and image.
- Client remains S3/CloudFront.
