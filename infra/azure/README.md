# Azure deployment (Container Apps + ACR)

This project includes an Azure Bicep template and a GitHub Actions workflow to deploy:
- Azure Container Registry (ACR)
- Log Analytics Workspace
- Azure Container Apps Environment
- Two Container Apps:
  - `qr-event-api` (Express API on port 5699)
  - `qr-event-web` (Nginx serving the built Vite app on port 80)

## Prerequisites

1) Azure Subscription
2) Resource Group name (e.g., `rg-qr-event`) and region (e.g., `eastus`)
3) GitHub Repository Secrets (set in Settings → Secrets and variables → Actions):

Required:
- `AZURE_CREDENTIALS` — JSON from a Service Principal with access to the subscription (use `az ad sp create-for-rbac` and include `clientId`, `clientSecret`, `subscriptionId`, `tenantId`).
- `AZURE_SUBSCRIPTION_ID` — Your subscription ID
- `AZURE_RESOURCE_GROUP` — Target resource group name (will be created if not exists)
- `AZURE_LOCATION` — Azure region (e.g., `eastus`)
- `AZURE_ACR_NAME` — Globally unique ACR name (5-50 alphanumeric)
- `CLIENT_ORIGIN` — Public URL of the client app (after first deploy, update this to the web FQDN)
- `PUBLIC_BASE_URL` — Same as client origin; used by the API when building links
- `MONGO_URI` — MongoDB connection string (Atlas/Cosmos Mongo API/DocumentDB)
- `JWT_SECRET` — Strong random string

Optional (email/SMS):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `EMAIL_FROM`
- `SMS_API_URL`, `SMS_API_KEY`, `SMS_SENDER_ID`

## Files

- `infra/azure/main.bicep` — Infrastructure as Code for ACR, Log Analytics, Container Apps Env, and the two Container Apps.
- `.github/workflows/azure-deploy.yml` — CI/CD to build images, push to ACR, and deploy the Bicep template.

## First deployment

1) Push to `main` or run the workflow manually (Actions → Deploy to Azure Container Apps → Run workflow).
2) The workflow:
   - Ensures the Resource Group exists
   - Creates ACR (and other infra) on first run
   - Builds and pushes images: `qr-event-server:latest` and `qr-event-client:latest`
   - Deploys Bicep, wiring images from ACR to Container Apps
3) After success, the job prints public URLs, for example:
   - API: `https://<api-fqdn>`
   - WEB: `https://<web-fqdn>`

Update `CLIENT_ORIGIN` and `PUBLIC_BASE_URL` secrets to `https://<web-fqdn>` if they were placeholders, then re-run the workflow to apply.

## Local validation (optional)

- Ensure Docker builds locally:
  - `docker build -f server/Dockerfile .`
  - `docker build -f client/Dockerfile .`
- Optional: `docker compose up --build` to run the full stack locally.

## Notes & best practices

- For production, prefer Managed Identity + ACR pull role instead of ACR admin user credentials. This template uses admin credentials for simplicity.
- Keep secrets out of code; manage all secrets in GitHub Actions and/or Key Vault.
- If you prefer Azure Developer CLI (azd), we can scaffold `azure.yaml` and azd templates on request for a fully managed developer workflow (`azd up`).
