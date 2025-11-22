#!/bin/bash

# Azure Deployment Script for Security SaaS Application
# Prerequisites: Azure CLI installed and logged in (az login)

set -e  # Exit on error

echo "🚀 Starting Azure Deployment Process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE VALUES
RESOURCE_GROUP="SecuritySaaS-RG"
LOCATION="eastus"
BACKEND_APP_NAME="security-saas-backend-$RANDOM"  # Random suffix to ensure uniqueness
FRONTEND_APP_NAME="security-saas-frontend"
APP_SERVICE_PLAN="SecuritySaaS-Plan"

echo "${YELLOW}Configuration:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Backend App: $BACKEND_APP_NAME"
echo "  Frontend App: $FRONTEND_APP_NAME"
echo ""

# Function to check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        echo "${RED}❌ Azure CLI is not installed${NC}"
        echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    echo "${GREEN}✓ Azure CLI found${NC}"
}

# Function to check if logged in to Azure
check_azure_login() {
    if ! az account show &> /dev/null; then
        echo "${RED}❌ Not logged in to Azure${NC}"
        echo "Run: az login"
        exit 1
    fi
    echo "${GREEN}✓ Logged in to Azure${NC}"
    SUBSCRIPTION=$(az account show --query name -o tsv)
    echo "  Subscription: $SUBSCRIPTION"
}

# Step 1: Prerequisites check
echo "${YELLOW}Step 1: Checking prerequisites...${NC}"
check_azure_cli
check_azure_login
echo ""

# Step 2: Create Resource Group
echo "${YELLOW}Step 2: Creating resource group...${NC}"
if az group exists --name $RESOURCE_GROUP | grep -q "true"; then
    echo "${GREEN}✓ Resource group already exists${NC}"
else
    az group create --name $RESOURCE_GROUP --location $LOCATION
    echo "${GREEN}✓ Resource group created${NC}"
fi
echo ""

# Step 3: Create App Service Plan
echo "${YELLOW}Step 3: Creating App Service Plan...${NC}"
if az appservice plan show --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "${GREEN}✓ App Service Plan already exists${NC}"
else
    az appservice plan create \
        --name $APP_SERVICE_PLAN \
        --resource-group $RESOURCE_GROUP \
        --sku B1 \
        --is-linux
    echo "${GREEN}✓ App Service Plan created (B1 tier with WebSocket support)${NC}"
fi
echo ""

# Step 4: Create Backend Web App
echo "${YELLOW}Step 4: Creating backend web app...${NC}"
if az webapp show --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "${GREEN}✓ Backend app already exists${NC}"
else
    az webapp create \
        --resource-group $RESOURCE_GROUP \
        --plan $APP_SERVICE_PLAN \
        --name $BACKEND_APP_NAME \
        --runtime "NODE:22-lts"
    echo "${GREEN}✓ Backend web app created${NC}"
fi
echo ""

# Step 5: Configure Backend
echo "${YELLOW}Step 5: Configuring backend...${NC}"

# Enable WebSocket
az webapp config set \
    --resource-group $RESOURCE_GROUP \
    --name $BACKEND_APP_NAME \
    --web-sockets-enabled true

# Set environment variables
JWT_SECRET=$(openssl rand -base64 32)
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $BACKEND_APP_NAME \
    --settings \
        NODE_ENV=production \
        USE_HTTPS=false \
        JWT_SECRET="$JWT_SECRET" \
        PORT=8080

echo "${GREEN}✓ Backend configured${NC}"
echo ""

# Step 6: Deploy Backend
echo "${YELLOW}Step 6: Deploying backend code...${NC}"
cd backend

# Create deployment zip (exclude node_modules)
echo "  Creating deployment package..."
zip -r ../deploy-backend.zip . -x "node_modules/*" -x ".env*" -x "*.log"

cd ..

# Deploy zip file
echo "  Uploading to Azure..."
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $BACKEND_APP_NAME \
    --src deploy-backend.zip

echo "${GREEN}✓ Backend deployed${NC}"
echo ""

# Step 7: Build Frontend
echo "${YELLOW}Step 7: Building frontend...${NC}"

# Update environment file with backend URL
BACKEND_URL="https://$BACKEND_APP_NAME.azurewebsites.net"
echo "VITE_API_URL=$BACKEND_URL" > .env.production

# Build
npm run build
echo "${GREEN}✓ Frontend built${NC}"
echo ""

# Step 8: Deploy Frontend (Manual step - requires GitHub or manual upload)
echo "${YELLOW}Step 8: Frontend Deployment${NC}"
echo "${YELLOW}⚠️  Frontend deployment requires additional steps:${NC}"
echo ""
echo "Option 1 - Azure Static Web Apps (Recommended):"
echo "  1. Go to https://portal.azure.com"
echo "  2. Create a new Static Web App"
echo "  3. Connect to your GitHub repository (or upload dist/ folder manually)"
echo "  4. Set build configuration:"
echo "     - App location: /"
echo "     - Output location: dist"
echo ""
echo "Option 2 - Deploy to another App Service:"
echo "  Run these commands:"
echo "  cd dist"
echo "  zip -r ../deploy-frontend.zip ."
echo "  cd .."
echo "  az webapp create --name security-saas-frontend --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN"
echo "  az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name security-saas-frontend --src deploy-frontend.zip"
echo ""

# Step 9: Summary
echo "${GREEN}========================================${NC}"
echo "${GREEN}✅ Deployment Complete!${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "${YELLOW}Backend URL:${NC} https://$BACKEND_APP_NAME.azurewebsites.net"
echo "${YELLOW}Backend Health Check:${NC} https://$BACKEND_APP_NAME.azurewebsites.net/api/health"
echo ""
echo "${YELLOW}Next Steps:${NC}"
echo "1. Test backend: curl https://$BACKEND_APP_NAME.azurewebsites.net/api/health"
echo "2. Deploy frontend using one of the options above"
echo "3. Update frontend .env.production with backend URL if needed"
echo "4. Configure custom domain (optional)"
echo "5. Set up monitoring in Azure Portal"
echo ""
echo "${YELLOW}Important Files Created:${NC}"
echo "  - .env.production (frontend config)"
echo "  - backend/.env.production (backend config)"
echo "  - deploy-backend.zip (backend deployment package)"
echo "  - dist/ (frontend build output)"
echo ""
echo "${YELLOW}Generated Secrets (SAVE THESE):${NC}"
echo "  JWT_SECRET: $JWT_SECRET"
echo ""
echo "${GREEN}🎉 Deployment script completed!${NC}"
