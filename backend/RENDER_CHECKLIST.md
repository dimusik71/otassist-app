# 🚀 Render Deployment Quick Checklist

Use this checklist to deploy your OTAssist backend to Render in under 15 minutes!

---

## ✅ Pre-Deployment Checklist

Before you start:

- [ ] GitHub account with your code pushed
- [ ] Render account created ([render.com](https://render.com))
- [ ] Code is committed and pushed to `main` branch
- [ ] You have your production API keys ready

---

## 📝 Step-by-Step Deployment

### 1️⃣ Create Render Service (5 minutes)

- [ ] Go to [render.com/dashboard](https://dashboard.render.com)
- [ ] Click **"New +"** → **"Web Service"**
- [ ] Connect your GitHub repository
- [ ] Service name: `otassist-backend`
- [ ] Region: **Oregon** (or closest to users)
- [ ] Root Directory: **`backend`** ⚠️ CRITICAL
- [ ] Runtime: **Docker**
- [ ] Dockerfile Path: **`backend/Dockerfile.render`**
- [ ] Plan: **Free** (or Starter for $7/mo)

### 2️⃣ Add Environment Variables (3 minutes)

Required variables:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `DATABASE_URL` = `file:/data/production.db`
- [ ] `BETTER_AUTH_SECRET` = Generate using:
  ```bash
  openssl rand -hex 32
  ```

Optional API keys (only add if you have them):

- [ ] `ANTHROPIC_API_KEY` = Your Anthropic key
- [ ] `OPENAI_API_KEY` = Your OpenAI key
- [ ] `GOOGLE_API_KEY` = Your Google key
- [ ] `XAI_API_KEY` = Your Grok/xAI key
- [ ] `ELEVENLABS_API_KEY` = Your ElevenLabs key

### 3️⃣ Add Persistent Disk (2 minutes)

- [ ] Scroll to **"Disks"** section
- [ ] Click **"Add Disk"**
- [ ] Name: `sqlite-data`
- [ ] Mount Path: **`/data`** ⚠️ MUST BE EXACTLY `/data`
- [ ] Size: `1 GB`
- [ ] Click **"Add Disk"**

### 4️⃣ Deploy (2 minutes)

- [ ] Review all settings
- [ ] Click **"Create Web Service"**
- [ ] Wait for build to complete (2-5 mins)
- [ ] Watch for **"Live"** status

### 5️⃣ Get Your URL & Update Config (2 minutes)

- [ ] Copy your Render URL (e.g., `https://otassist-backend.onrender.com`)
- [ ] Go to **"Environment"** tab
- [ ] Add new variable: `BACKEND_URL` = Your Render URL
- [ ] Click **"Save Changes"** (will redeploy)

### 6️⃣ Test Deployment (1 minute)

- [ ] Test health endpoint in browser:
  ```
  https://your-backend-url.onrender.com/health
  ```
- [ ] Should return: `{"status":"ok"}`
- [ ] Check **"Logs"** tab for any errors

---

## 📱 Update Mobile App Config

### Update eas.json:

- [ ] Open `/home/user/workspace/eas.json`
- [ ] In `production` → `env` section, add/update:
  ```json
  "EXPO_PUBLIC_VIBECODE_BACKEND_URL": "https://your-backend-url.onrender.com"
  ```
- [ ] Replace with YOUR actual Render URL
- [ ] Update any placeholder API keys with real ones

### Build for TestFlight:

- [ ] Run: `eas build --platform ios --profile production`
- [ ] Wait for build to complete (15-30 mins)
- [ ] Run: `eas submit --platform ios --profile production`
- [ ] Check TestFlight for your app

---

## ✅ Post-Deployment Verification

Test everything works:

- [ ] Install app from TestFlight
- [ ] Create a new account
- [ ] Log in successfully
- [ ] Add a new client
- [ ] Create an assessment
- [ ] Upload a photo/video
- [ ] Try AI features (if configured)
- [ ] Check Render logs for errors

---

## 🔧 Common Issues & Quick Fixes

### Issue: Database data disappears after redeploy
**Fix:**
- [ ] Check disk is mounted at `/data`
- [ ] Verify `DATABASE_URL=file:/data/production.db`

### Issue: 502/503 Backend errors
**Fix:**
- [ ] Check Logs tab for specific errors
- [ ] Verify all env variables are set
- [ ] Try manual deploy

### Issue: Mobile app can't connect
**Fix:**
- [ ] Verify `EXPO_PUBLIC_VIBECODE_BACKEND_URL` in eas.json
- [ ] Make sure URL has `https://`
- [ ] Test health endpoint in browser first

### Issue: Authentication fails
**Fix:**
- [ ] Check `BACKEND_URL` env var is set
- [ ] Verify `BETTER_AUTH_SECRET` is 32+ chars
- [ ] Check backend logs for auth errors

### Issue: Cold starts are slow (free tier)
**Solutions:**
- [ ] Upgrade to Starter ($7/mo) for always-on
- [ ] Use [UptimeRobot](https://uptimerobot.com) to ping every 5 mins
- [ ] Accept 30s first-request delay on free tier

---

## 💰 Cost Calculator

### Free Tier (Great for testing):
- ✅ 750 hours/month runtime
- ✅ 1GB disk storage
- ✅ 100GB bandwidth/month
- ⚠️ Cold starts after 15 mins idle
- **Cost:** $0/month

### Starter Tier (Better for production):
- ✅ Always on - no cold starts
- ✅ Faster dedicated resources
- ✅ 1GB disk included
- ✅ Better performance
- **Cost:** $7/month

---

## 🎯 Success Indicators

You're good to go when:

- ✅ Health endpoint returns `{"status":"ok"}`
- ✅ Backend logs show no errors
- ✅ Mobile app connects successfully
- ✅ Can create account and log in
- ✅ Database persists across redeploys
- ✅ All features work as expected

---

## 📚 Resources

- **Full Guide:** See `RENDER_DEPLOYMENT_GUIDE.md` for detailed instructions
- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Render Status:** [status.render.com](https://status.render.com)
- **Support:** [community.render.com](https://community.render.com)

---

## 🆘 Need Help?

If you get stuck:

1. Check Render Logs tab for specific errors
2. Review `RENDER_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
3. Verify all checkboxes above are completed
4. Test health endpoint: `https://your-url/health`

---

## ⏱️ Estimated Time

- **First time:** ~15-20 minutes
- **Subsequent deploys:** Auto-deploy on git push
- **Build time:** 2-5 minutes per deploy

---

**Good luck with your deployment! 🚀**
