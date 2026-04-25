# infra

Single-file Bicep template that provisions everything needed to run BankQL on Azure:

- **Storage account** — Function App deployment package + (later) dataset blob hosting.
- **Log Analytics workspace + Application Insights** — logs/traces for the Function App.
- **App Service Plan (Flex Consumption)** — serverless Node 24 compute.
- **Function App** — `@bankql/azf-v1`; system-assigned identity has `Storage Blob Data Owner` on the storage account so Flex Consumption can pull its deployment package.
- **Static Web App (Standard tier)** — hosts `@bankql/web`. Standard tier is required for linked backends.
- **SWA linked backend** — proxies `/api/*` on the SWA origin to the Function App. Same-origin — no CORS, no Front Door.

## First-time deploy

```bash
# 1. Create the RG
az group create --name bankql --location eastus2

# 2. Fill in secrets
cp infra/main.parameters.example.json infra/main.parameters.json
# edit foundryEndpoint, foundryModel, foundryApiKey

# 3. Deploy
az deployment group create \
  --resource-group bankql \
  --template-file infra/main.bicep \
  --parameters @infra/main.parameters.json
```

Outputs: `functionAppName`, `staticWebAppName`, and their hostnames.

## GitHub Actions secrets

After the first deploy, create three GitHub secrets so CI can push artifacts:

| Secret                            | How to obtain                                                                                                                                                                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `az staticwebapp secrets list --name <swaName> --query "properties.apiKey" -o tsv`                                                                                                                                                                               |
| `AZURE_CREDENTIALS`               | Federated-identity preferred: create a user-assigned identity with federated credential for this repo, assign `Contributor` on the RG. Store client id / tenant id / subscription id as `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_SUBSCRIPTION_ID` secrets. |
| `vars.AZURE_FUNCTIONAPP_NAME`     | Value of the `functionAppName` output. Set as a repo **variable**, not a secret.                                                                                                                                                                                 |

## Updating secrets later

Rotate the Foundry key:

```bash
az functionapp config appsettings set \
  --name <functionAppName> --resource-group bankql \
  --settings AZURE_FOUNDRY_API_KEY=<new-key>
```

Don't re-run Bicep with a new `foundryApiKey` unless you want to redeploy everything.

## Cost notes

- SWA Standard: ~$9/mo flat.
- Function App (Flex Consumption): pay-per-GB-s + per-invocation, essentially $0 at low volume.
- Storage (LRS, <1GB): ~$0.02/mo.
- App Insights / Log Analytics: free tier covers the first 5GB/mo.
