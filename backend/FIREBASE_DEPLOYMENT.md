# Firebase / Google Cloud Run Deployment Guide

This guide will help you deploy your OTAssist backend to Google Cloud Run (part of the Firebase/Google Cloud ecosystem).

## Why Cloud Run?

- ✅ **Supports Bun** - Full Docker support
- ✅ **Auto-scaling** - Scales to zero when not in use (free tier!)
- ✅ **Pay-per-use** - Only pay for actual usage
- ✅ **Fast** - Global CDN and edge locations
- ✅ **Integrated with Firebase** - Same Google Cloud account
- ✅ **Free tier** - 2 million requests/month free

## Prerequisites

1. **Google Cloud Account** (free with $300 credit for new users)
   - Go to: https://cloud.google.com/
   - Sign up with your Google account

2. **Install Google Cloud CLI**
   - Visit: https://cloud.google.com/sdk/docs/install
   - Or use the web-based Cloud Shell (no installation needed)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project: `otassist-backend`
4. Click "Create"
5. **Copy your Project ID** (e.g., `otassist-backend-123456`)

## Step 2: Enable Required APIs

In Google Cloud Console, enable these APIs:

```bash
# Or run these commands in Cloud Shell:
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

Navigate to:
- Cloud Run API: https://console.cloud.google.com/apis/library/run.googleapis.com
- Cloud Build API: https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com
- Container Registry API: https://console.cloud.google.com/apis/library/containerregistry.googleapis.com

Click "Enable" for each.

## Step 3: Set Up Database

You have two options for the database:

### Option A: Cloud SQL (PostgreSQL) - **RECOMMENDED**
Best for production - more reliable than SQLite in containers.

1. Go to [Cloud SQL](https://console.cloud.google.com/sql)
2. Click "Create Instance" → "Choose PostgreSQL"
3. Instance ID: `otassist-db`
4. Password: Generate a strong password
5. Region: Choose closest to your users
6. Choose "Development" preset (cheaper)
7. Click "Create Instance"

**Update Prisma Schema:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Connection String Format:**
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@/otassist?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME"
```

### Option B: Cloud Storage + SQLite
Keep SQLite but persist to Cloud Storage bucket.

1. Create a bucket: https://console.cloud.google.com/storage
2. Name: `otassist-sqlite-data`
3. Region: Same as your Cloud Run service
4. Mount this bucket in your Cloud Run service

## Step 4: Deploy Using Cloud Shell (Easiest Method)

1. **Open Cloud Shell** in Google Cloud Console (top-right icon)

2. **Clone your repository** (or upload your code):
```bash
# If using GitHub:
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend

# Or upload files using the Cloud Shell upload button
```

3. **Set your project**:
```bash
gcloud config set project YOUR_PROJECT_ID
```

4. **Build and deploy**:
```bash
# Build the Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/otassist-backend

# Deploy to Cloud Run
gcloud run deploy otassist-backend \
  --image gcr.io/YOUR_PROJECT_ID/otassist-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0
```

5. **Set environment variables**:
```bash
gcloud run services update otassist-backend \
  --region us-central1 \
  --set-env-vars "NODE_ENV=production,\
DATABASE_URL=file:/data/production.db,\
BETTER_AUTH_SECRET=YOUR_32_CHAR_SECRET,\
ANTHROPIC_API_KEY=your-anthropic-key"
```

## Step 5: Generate Secure Secrets

**Generate BETTER_AUTH_SECRET:**
```bash
# In Cloud Shell or your terminal:
openssl rand -hex 32
```

Copy this value and use it in the environment variables above.

## Step 6: Get Your Production URL

After deployment, Cloud Run will give you a URL like:
```
https://otassist-backend-abc123-uc.a.run.app
```

**Copy this URL** - you'll need it for your mobile app!

## Step 7: Update Mobile App (eas.json)

Update `/home/user/workspace/eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_VIBECODE_BACKEND_URL": "https://otassist-backend-abc123-uc.a.run.app",
        "EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY": "your-real-key",
        "EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY": "your-real-key",
        "EXPO_PUBLIC_VIBECODE_GROK_API_KEY": "your-real-key",
        "EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY": "your-real-key",
        "EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY": "your-real-key"
      }
    }
  }
}
```

## Step 8: Test Your Deployment

```bash
# Test health endpoint
curl https://your-cloud-run-url.run.app/health

# Should return: {"status":"healthy","timestamp":"..."}
```

## Step 9: Monitor Your Backend

**View Logs:**
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your service: `otassist-backend`
3. Click "Logs" tab

**View Metrics:**
- Request count
- Response times
- Error rates
- Memory/CPU usage

## Pricing (Free Tier)

Cloud Run free tier includes:
- 2 million requests/month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds of compute time

**Your expected costs**: $0-5/month for small usage

## Alternative: Deploy Using GitHub Actions

If you want automated deployments on every push:

1. Set up a GitHub Actions workflow
2. Add Google Cloud credentials as GitHub secrets
3. Auto-deploy on push to `main` branch

I can create this setup if you want automated deployments!

## Security Checklist

✅ Generate unique BETTER_AUTH_SECRET (32+ characters)
✅ Use real API keys in production
✅ Set NODE_ENV=production
✅ Enable Cloud Run authentication if needed
✅ Set up CORS properly in your Hono app
✅ Use Cloud SQL for production database
✅ Enable Cloud Armor for DDoS protection
✅ Set up monitoring and alerts

## Troubleshooting

### "Permission Denied" Errors
```bash
# Grant yourself owner role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:your-email@gmail.com" \
  --role="roles/owner"
```

### "Cannot connect to Cloud SQL"
- Ensure Cloud SQL Proxy is enabled in Cloud Run
- Check connection string format
- Verify Cloud SQL instance is running

### "Build Failed"
- Check Dockerfile syntax
- Ensure all dependencies in package.json
- Check Cloud Build logs

### "Service Unavailable"
- Check Cloud Run logs for startup errors
- Verify environment variables are set
- Check database connection

## Next Steps

1. ✅ Deploy backend to Cloud Run
2. ✅ Get production URL
3. ✅ Update eas.json with production URL
4. ✅ Update Apple ID and App Store Connect info in eas.json
5. ✅ Build for TestFlight: `eas build --platform ios --profile production`
6. ✅ Submit to TestFlight: `eas submit --platform ios --profile production`

## Support Resources

- Google Cloud Run Docs: https://cloud.google.com/run/docs
- Cloud SQL Docs: https://cloud.google.com/sql/docs
- Cloud Console: https://console.cloud.google.com
- Pricing Calculator: https://cloud.google.com/products/calculator

## Quick Commands Reference

```bash
# Check deployment status
gcloud run services describe otassist-backend --region us-central1

# View logs in real-time
gcloud run services logs tail otassist-backend --region us-central1

# Update environment variables
gcloud run services update otassist-backend \
  --region us-central1 \
  --set-env-vars "KEY=value"

# Redeploy (after code changes)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/otassist-backend && \
gcloud run deploy otassist-backend \
  --image gcr.io/YOUR_PROJECT_ID/otassist-backend \
  --region us-central1
```

---

**Need help?** The easiest way is to use Cloud Shell - it has everything pre-installed and authenticated!
