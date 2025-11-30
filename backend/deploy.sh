#!/bin/bash

# OTAssist Backend - Google Cloud Run Deployment Script
# This script helps you deploy your backend to Google Cloud Run

set -e  # Exit on error

echo "🚀 OTAssist Backend - Cloud Run Deployment"
echo "=========================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI (gcloud) is not installed."
    echo "📥 Please install it from: https://cloud.google.com/sdk/docs/install"
    echo "💡 Or use Cloud Shell at: https://console.cloud.google.com"
    exit 1
fi

echo "✅ Google Cloud CLI found"
echo ""

# Get project ID
echo "📋 Please enter your Google Cloud Project ID:"
read -r PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID cannot be empty"
    exit 1
fi

echo "🔧 Setting project to: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

echo ""
echo "🔑 Please enter your BETTER_AUTH_SECRET (32+ characters):"
echo "💡 Generate one with: openssl rand -hex 32"
read -r BETTER_AUTH_SECRET

if [ ${#BETTER_AUTH_SECRET} -lt 32 ]; then
    echo "❌ BETTER_AUTH_SECRET must be at least 32 characters"
    exit 1
fi

echo ""
echo "🗄️  Choose your database option:"
echo "1) SQLite (simple, good for testing)"
echo "2) Cloud SQL PostgreSQL (recommended for production)"
read -r DB_CHOICE

if [ "$DB_CHOICE" == "2" ]; then
    echo "📋 Enter your Cloud SQL connection string:"
    echo "Format: postgresql://user:password@/dbname?host=/cloudsql/PROJECT_ID:REGION:INSTANCE"
    read -r DATABASE_URL
else
    DATABASE_URL="file:/data/production.db"
fi

echo ""
echo "🔨 Building Docker image..."
gcloud builds submit --tag "gcr.io/$PROJECT_ID/otassist-backend"

echo ""
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy otassist-backend \
  --image "gcr.io/$PROJECT_ID/otassist-backend" \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "NODE_ENV=production,DATABASE_URL=$DATABASE_URL,BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Getting your service URL..."
SERVICE_URL=$(gcloud run services describe otassist-backend --region us-central1 --format='value(status.url)')

echo ""
echo "🎉 Your backend is live at:"
echo "   $SERVICE_URL"
echo ""
echo "📋 Next steps:"
echo "   1. Test your backend: curl $SERVICE_URL/health"
echo "   2. Update eas.json with: EXPO_PUBLIC_VIBECODE_BACKEND_URL=$SERVICE_URL"
echo "   3. Add your API keys to eas.json"
echo "   4. Build for TestFlight: eas build --platform ios --profile production"
echo ""
echo "📊 View logs: gcloud run services logs tail otassist-backend --region us-central1"
echo "📈 View metrics: https://console.cloud.google.com/run/detail/us-central1/otassist-backend"
echo ""
