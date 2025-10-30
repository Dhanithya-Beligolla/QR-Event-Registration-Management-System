@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Azure Container Registry name (must be globally unique, 5-50 alphanumeric)')
param acrName string

@description('Log Analytics workspace name')
param logAnalyticsWorkspaceName string = '${uniqueString(resourceGroup().id)}-law'

@description('Container Apps Environment name')
param containerAppsEnvName string = '${uniqueString(resourceGroup().id)}-cae'

@description('API Container App name')
param apiAppName string = 'qr-event-api'

@description('Web (client) Container App name')
param webAppName string = 'qr-event-web'

@description('Public client origin (e.g., https://yourclient.example)')
param clientOrigin string

@description('Public base URL for link building (client URL)')
param publicBaseUrl string

@secure()
@description('MongoDB connection string')
param mongoUri string

@secure()
@description('JWT secret')
param jwtSecret string

@description('SMTP host (optional)')
param smtpHost string = ''

@description('SMTP port (optional)')
param smtpPort int = 587

@description('SMTP user (optional)')
param smtpUser string = ''

@secure()
@description('SMTP password (optional)')
param smtpPass string = ''

@description('From address for emails (optional)')
param emailFrom string = ''

@description('SMS API URL (optional)')
param smsApiUrl string = ''

@description('SMS API key (optional)')
param smsApiKey string = ''

@description('SMS Sender ID (optional)')
param smsSenderId string = 'QRAPP'

@description('API container port')
param apiPort int = 5699

@description('Web container port')
param webPort int = 80

// Azure Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true // For simplicity in demos; prefer Managed Identity in production
  }
}

// Log Analytics Workspace for ACA logs
resource law 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// Container Apps Environment
resource cae 'Microsoft.App/managedEnvironments@2024-02-02-preview' = {
  name: containerAppsEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: law.properties.customerId
        sharedKey: listKeys(law.id, law.apiVersion).primarySharedKey
      }
    }
  }
}

var registryServer = acr.properties.loginServer
var registryCreds = listCredentials(acr.id, acr.apiVersion)

// API Container App
resource apiApp 'Microsoft.App/containerApps@2024-02-02-preview' = {
  name: apiAppName
  location: location
  properties: {
    managedEnvironmentId: cae.id
    configuration: {
      ingress: {
        external: true
        targetPort: apiPort
        transport: 'auto'
      }
      registries: [
        {
          server: registryServer
          username: registryCreds.username
          passwordSecretRef: 'acr-pw'
        }
      ]
      secrets: [
        {
          name: 'acr-pw'
          value: registryCreds.passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${registryServer}/qr-event-server:latest'
          env: [
            { name: 'PORT', value: string(apiPort) },
            { name: 'CLIENT_ORIGIN', value: clientOrigin },
            { name: 'PUBLIC_BASE_URL', value: publicBaseUrl },
            { name: 'MONGO_URI', value: mongoUri },
            { name: 'JWT_SECRET', value: jwtSecret },
            { name: 'SMTP_HOST', value: smtpHost },
            { name: 'SMTP_PORT', value: string(smtpPort) },
            { name: 'SMTP_USER', value: smtpUser },
            { name: 'SMTP_PASS', value: smtpPass },
            { name: 'EMAIL_FROM', value: emailFrom },
            { name: 'SMS_API_URL', value: smsApiUrl },
            { name: 'SMS_API_KEY', value: smsApiKey },
            { name: 'SMS_SENDER_ID', value: smsSenderId }
          ]
          probes: [
            {
              type: 'liveness'
              httpGet: {
                path: '/health'
                port: apiPort
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            },
            {
              type: 'readiness'
              httpGet: {
                path: '/health'
                port: apiPort
              }
              initialDelaySeconds: 2
              periodSeconds: 10
            }
          ]
          resources: {
            cpu: 0.5
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

// Web (client) Container App
resource webApp 'Microsoft.App/containerApps@2024-02-02-preview' = {
  name: webAppName
  location: location
  properties: {
    managedEnvironmentId: cae.id
    configuration: {
      ingress: {
        external: true
        targetPort: webPort
        transport: 'auto'
      }
      registries: [
        {
          server: registryServer
          username: registryCreds.username
          passwordSecretRef: 'acr-pw'
        }
      ]
      secrets: [
        {
          name: 'acr-pw'
          value: registryCreds.passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${registryServer}/qr-event-client:latest'
          resources: {
            cpu: 0.25
            memory: '512Mi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 2
      }
    }
  }
}

output apiUrl string = 'https://' + apiApp.properties.configuration.ingress.fqdn
output webUrl string = 'https://' + webApp.properties.configuration.ingress.fqdn
