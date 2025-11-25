# 🚀 Complete Render Deployment Guide for OTAssist Backend

This guide will walk you through deploying your OTAssist backend to Render step-by-step.

## Why Render?

✅ **Free tier**: 750 hours/month (enough for testing & small apps)
✅ **Zero config**: Automatic deployment from GitHub
✅ **Persistent disk**: SQLite data persists across deploys
✅ **Auto HTTPS**: SSL certificates included
✅ **Easy setup**: No CLI required
⚠️ **Cold starts**: Free tier spins down after 15 mins of inactivity (first request takes ~30s)

---

## 📋 Prerequisites

Before you start, make sure you have:

1. ✅ GitHub account with your code pushed to a repository
2. ✅ Render account (sign up at [render.com](https://render.com))
3. ✅ All your production API keys ready (OpenAI, Anthropic, Google, etc.)

---

## 🎯 Step 1: Create Render Account & Connect GitHub

1. **Go to [render.com](https://render.com)** and click "Get Started"
2. **Sign up** using your GitHub account (recommended) or email
3. **Authorize Render** to access your GitHub repositories
4. You'll be taken to the Render dashboard

---

## 🛠️ Step 2: Create a New Web Service

1. **Click "New +"** in the top right corner
2. **Select "Web Service"** from the dropdown
3. **Connect your repository**:
   - If this is your first time, click "Configure Account" to give Render access
   - Select your GitHub organization/account
   - Find and select your OTAssist repository
   - Click "Connect"

---

## ⚙️ Step 3: Configure Your Web Service

Fill in the following settings:

### Basic Settings:
- **Name**: `otassist-backend` (or your preferred name)
- **Region**: Choose the region closest to your users (e.g., Oregon USA, Frankfurt EU, Singapore)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` ⚠️ **IMPORTANT: Must be set to `backend`**

### Build & Deploy Settings:
- **Runtime**: Render should auto-detect Docker
- **Build Command**: Leave blank (Docker handles this)
- **Start Command**: Leave blank (Docker handles this)
- **Dockerfile Path**: `backend/Dockerfile.render`

### Instance Settings:
- **Instance Type**:
  - **Free** (for testing - has cold starts after 15 mins inactivity)
  - **Starter** ($7/month - no cold starts, faster)

### Advanced Settings (expand this section):
- **Auto-Deploy**: Leave enabled (Yes) - deploys automatically on git push

---

## 🔐 Step 4: Add Environment Variables

Scroll down to "Environment Variables" section and click "Add Environment Variable" for each:

### Required Variables:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/data/production.db
BETTER_AUTH_SECRET=<generate-this-below>
```

### How to Generate BETTER_AUTH_SECRET:

Open your terminal and run:
```bash
openssl rand -hex 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `BETTER_AUTH_SECRET` value.

### Optional - AI API Keys (Add only if you're using AI features):

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-real-key
OPENAI_API_KEY=sk-proj-your-real-key
GOOGLE_API_KEY=your-real-google-key
XAI_API_KEY=xai-your-real-grok-key
ELEVENLABS_API_KEY=your-real-elevenlabs-key
```

⚠️ **DO NOT** use placeholder/fake API keys - only add keys you actually have.

---

## 💾 Step 5: Add Persistent Disk for SQLite

This is crucial for keeping your database data across deployments.

1. **Scroll down** to the "Disks" section
2. **Click "Add Disk"**
3. Configure the disk:
   - **Name**: `sqlite-data` (or any name you prefer)
   - **Mount Path**: `/data` ⚠️ **MUST BE EXACTLY `/data`**
   - **Size**: `1 GB` (free tier allows up to 1GB)
4. **Click "Add Disk"**

---

## 🚢 Step 6: Deploy!

1. **Review all your settings** to make sure everything is correct:
   - Root Directory = `backend`
   - DATABASE_URL = `file:/data/production.db`
   - Disk mounted at `/data`
   - BETTER_AUTH_SECRET is set

2. **Click "Create Web Service"** at the bottom

3. **Render will now**:
   - Build your Docker image
   - Run Prisma migrations
   - Start your backend server
   - Assign you a public URL

4. **Watch the build logs** - this takes about 2-5 minutes
   - You'll see: "Building...", "Deploying...", "Live"
   - If errors occur, check the logs for details

---

## 🌐 Step 7: Get Your Production URL

Once deployment is complete:

1. **Your backend URL** will be shown at the top:
   ```
   https://otassist-backend.onrender.com
   ```
   (The exact URL will be based on your service name)

2. **Copy this URL** - you'll need it for:
   - Setting `BACKEND_URL` environment variable
   - Configuring your mobile app

3. **Add BACKEND_URL**:
   - Go to "Environment" tab on the left
   - Click "Add Environment Variable"
   - Key: `BACKEND_URL`
   - Value: Your full Render URL (e.g., `https://otassist-backend.onrender.com`)
   - Click "Save Changes"

4. **Render will redeploy** with the new environment variable

---

## ✅ Step 8: Test Your Deployment

### Test 1: Health Check
Open your browser or use curl:
```bash
curl https://otassist-backend.onrender.com/health
```

**Expected response:**
```json
{"status":"ok"}
```

### Test 2: Check Logs
1. Go to your Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for:
   - ✅ "Server running on port 3000"
   - ✅ No error messages
   - ⚠️ If you see database errors, check your disk is mounted at `/data`

---

## 📱 Step 9: Update Mobile App Configuration

Now that your backend is deployed, update your mobile app to use it.

### Update `eas.json`:

1. **Open** `/home/user/workspace/eas.json`
2. **Add** `EXPO_PUBLIC_VIBECODE_BACKEND_URL` to the production env:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_VIBECODE_BACKEND_URL": "https://otassist-backend.onrender.com",
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

3. **Replace** `https://otassist-backend.onrender.com` with YOUR actual Render URL

---

## 🏗️ Step 10: Build & Deploy to TestFlight

Now rebuild your app with the production backend:

```bash
# Build for iOS TestFlight
eas build --platform ios --profile production

# After build completes, submit to TestFlight
eas submit --platform ios --profile production
```

Wait for the build to complete (15-30 minutes), then check TestFlight!

---

## 🎉 You're Done!

Your backend is now live on Render! Test it thoroughly:

1. ✅ Install app from TestFlight
2. ✅ Create a new account
3. ✅ Add a client
4. ✅ Create an assessment
5. ✅ Upload photos/videos
6. ✅ Generate AI recommendations

---

## 🔧 Troubleshooting

### Issue: Database data is lost after redeploy
**Solution**:
- Make sure disk is mounted at `/data`
- Check `DATABASE_URL=file:/data/production.db`
- Go to Settings → Disks → verify disk exists

### Issue: Backend returns 502/503 errors
**Solution**:
- Check Logs tab for error messages
- Verify all environment variables are set
- Try manual deploy: Settings → Manual Deploy

### Issue: "Failed to fetch" in mobile app
**Solution**:
- Verify `EXPO_PUBLIC_VIBECODE_BACKEND_URL` in eas.json
- Make sure URL starts with `https://`
- Test health endpoint in browser first

### Issue: Cold starts are too slow (free tier)
**Solution**:
- Upgrade to Starter plan ($7/month) for always-on service
- Or use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 5 minutes

### Issue: Authentication fails
**Solution**:
- Check `BACKEND_URL` environment variable is set correctly
- Verify `BETTER_AUTH_SECRET` is at least 32 characters
- Check backend logs for specific auth errors

### Issue: Prisma migrations fail
**Solution**:
- Check build logs for migration errors
- Verify `prisma/schema.prisma` is correct
- Try manual migration: Render Shell → `bunx prisma migrate deploy`

---

## 💰 Cost Breakdown

### Free Tier:
- **750 hours/month** of runtime
- **1GB disk** storage
- **100GB bandwidth/month**
- **Cold starts** after 15 minutes of inactivity
- **Perfect for**: Testing, demos, low-traffic apps

### Starter Tier ($7/month):
- **Always on** - no cold starts
- **Faster** - dedicated resources
- **Better for**: Production apps, real users

---

## 📊 Monitoring Your Backend

### View Logs:
- Dashboard → Your Service → Logs tab
- Shows real-time server logs
- Filter by log level (info, error, warn)

### View Metrics:
- Dashboard → Your Service → Metrics tab
- CPU, memory, bandwidth usage
- Response times and error rates

### Set Up Alerts:
- Settings → Notifications
- Get email alerts for:
  - Deploy failures
  - Service downtime
  - High error rates

---

## 🔄 Making Updates

When you make changes to your backend:

1. **Push to GitHub**: `git push origin main`
2. **Render auto-deploys** (if auto-deploy is enabled)
3. **Watch build logs** to ensure success
4. **No downtime** - Render does rolling deploys

To disable auto-deploy:
- Settings → Auto-Deploy → Toggle off
- Then manually deploy via "Manual Deploy" button

---

## 🆘 Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- **Render Status**: [status.render.com](https://status.render.com)
- **Check Logs**: Your Service → Logs tab

---

## 🎯 Next Steps After Deployment

1. ✅ Test all app features thoroughly
2. ✅ Monitor logs for any errors
3. ✅ Set up uptime monitoring (UptimeRobot, Pingdom)
4. ✅ Consider upgrading to Starter tier for production
5. ✅ Set up automated backups for your SQLite database
6. ✅ Document your production URLs for your team

---

## 🔒 Security Checklist

Before going to production:

✅ **BETTER_AUTH_SECRET** is strong (32+ chars) and unique
✅ **BACKEND_URL** is set to your actual Render URL
✅ **API keys** are real production keys (not placeholders)
✅ **NODE_ENV** is set to `production`
✅ **HTTPS** is enabled (Render does this automatically)
✅ **Disk** is mounted for database persistence
✅ **Logs** show no error messages
✅ **Health endpoint** returns 200 OK

---

## 🚀 Performance Tips

1. **Upgrade to Starter** if you need guaranteed uptime
2. **Use CDN** for media files (Cloudinary, etc.)
3. **Monitor logs** regularly for slow queries
4. **Set up alerts** for errors and downtime
5. **Keep dependencies updated** for security patches

---

## 📝 Summary

You've successfully:
- ✅ Deployed your backend to Render
- ✅ Set up persistent SQLite storage
- ✅ Configured environment variables
- ✅ Connected your mobile app
- ✅ Tested the deployment

Your OTAssist backend is now live and ready for TestFlight testing!
