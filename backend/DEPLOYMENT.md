# Railway Deployment Guide for OTAssist Backend

## Prerequisites
1. Create a free account at [Railway.app](https://railway.app)
2. Install Railway CLI (optional): `npm i -g @railway/cli`
3. Have your API keys ready for production

## Step 1: Deploy to Railway

### Option A: Deploy via Railway Dashboard (Easiest)

1. **Login to Railway**: Go to [railway.app](https://railway.app) and sign in
2. **Create New Project**: Click "New Project"
3. **Deploy from GitHub**:
   - Click "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select your repository
   - Railway will auto-detect the backend folder

4. **Set Root Directory** (Important!):
   - In project settings, set the root directory to: `backend`

### Option B: Deploy via Railway CLI

```bash
# From the backend directory
cd backend

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Step 2: Configure Environment Variables

In Railway Dashboard → Your Project → Variables tab, add:

### Required Variables:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/data/production.db
BETTER_AUTH_SECRET=<generate-a-secure-32-char-string>
BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### Optional AI API Keys (for AI features):
```
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

### How to Generate BETTER_AUTH_SECRET:
Run this command to generate a secure secret:
```bash
openai rand -hex 32
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Configure Persistent Storage for SQLite

Railway provides ephemeral storage by default. For SQLite persistence:

1. Go to Railway Dashboard → Your Service → Settings
2. Scroll to "Volumes"
3. Click "Add Volume"
4. Set mount path to: `/data`
5. Update `DATABASE_URL` to: `file:/data/production.db`

This ensures your database persists across deployments.

## Step 4: Get Your Production URL

After deployment:
1. Railway will generate a public URL like: `https://your-app.railway.app`
2. Find it in: Project → Service → Settings → "Public Networking"
3. Copy this URL - you'll need it for the mobile app

**Your production backend URL will look like:**
```
https://otassist-backend-production.up.railway.app
```

## Step 5: Update Mobile App Configuration

1. Open `/home/user/workspace/eas.json`
2. Update the `production` environment:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_VIBECODE_BACKEND_URL": "https://your-app.railway.app",
        "EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY": "your-real-openai-key",
        "EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY": "your-real-anthropic-key",
        "EXPO_PUBLIC_VIBECODE_GROK_API_KEY": "your-real-grok-key",
        "EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY": "your-real-google-key",
        "EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY": "your-real-elevenlabs-key"
      }
    }
  }
}
```

## Step 6: Rebuild for TestFlight

```bash
# Build for iOS production
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --profile production
```

## Troubleshooting

### Database Issues
- Ensure `/data` volume is mounted
- Check DATABASE_URL points to `/data/production.db`
- Run migrations: Add `bunx prisma migrate deploy` to build command

### Authentication Issues
- Verify BACKEND_URL matches Railway public domain
- Check BETTER_AUTH_SECRET is set and >= 32 characters
- Ensure cors/trusted origins include your Railway URL

### API Connection Issues
- Test backend health: `curl https://your-app.railway.app/health`
- Check Railway logs for errors
- Verify environment variables are set correctly

## Cost Estimate

Railway offers:
- **Free Plan**: $5 credit/month (enough for hobby projects)
- **Developer Plan**: $5/month + usage
- Typical backend costs: $3-10/month for small apps

## Security Checklist

✅ Generate unique BETTER_AUTH_SECRET (never use the dev one)
✅ Use real API keys (not placeholder ones)
✅ Set NODE_ENV=production
✅ Enable HTTPS only (Railway does this by default)
✅ Keep DATABASE_URL in environment variables (never commit)

## Monitoring

- **Logs**: Railway Dashboard → Service → Deployments → View Logs
- **Metrics**: Railway Dashboard → Service → Metrics
- **Health Check**: GET https://your-app.railway.app/health

## Next Steps After Deployment

1. Test backend health endpoint
2. Create a test user via the mobile app
3. Verify authentication works
4. Test core features (clients, assessments, equipment)
5. Monitor Railway logs for any errors
6. Set up Railway notifications for deployment failures

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- OTAssist Issues: Check app logs in Railway dashboard
