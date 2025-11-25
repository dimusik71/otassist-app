# 🚀 Render Deployment - Quick Start

**Deploy your OTAssist backend in 3 easy steps!**

---

## 🎯 Option 1: Manual Setup (Recommended for first-timers)

### Step 1: Create Service
1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +" → "Web Service"**
3. Connect GitHub repo → Select `backend` directory
4. Click **"Create Web Service"**

### Step 2: Configure
- **Root Directory:** `backend` ⚠️
- **Build:** Docker
- **Dockerfile:** `backend/Dockerfile.render`
- **Plan:** Free

### Step 3: Add Environment Variables
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/data/production.db
BETTER_AUTH_SECRET=<run: openssl rand -hex 32>
BACKEND_URL=<your-render-url>
```

### Step 4: Add Disk
- Mount Path: `/data`
- Size: 1 GB

### ✅ Done! Test: `https://your-url.onrender.com/health`

---

## 🪄 Option 2: Blueprint Deploy (One-click!)

### Step 1: Push render.yaml
```bash
git add backend/render.yaml
git commit -m "Add Render blueprint"
git push
```

### Step 2: Deploy via Blueprint
1. Go to: [render.com/select-repo?type=blueprint](https://dashboard.render.com/select-repo?type=blueprint)
2. Connect your repo
3. Click **"Apply"**
4. Render auto-creates everything!

### Step 3: Add Manual Variables
After deployment, add these in dashboard:
- `BACKEND_URL` = Your Render URL
- Any API keys you're using

### ✅ Done! Blueprint handles the rest!

---

## 📝 Files You Need

Already created for you:
- ✅ `backend/Dockerfile.render` - Docker config
- ✅ `backend/render.yaml` - Blueprint config
- ✅ `backend/RENDER_DEPLOYMENT_GUIDE.md` - Full guide
- ✅ `backend/RENDER_CHECKLIST.md` - Step checklist

---

## 🔗 Quick Links

- **Render Dashboard:** [dashboard.render.com](https://dashboard.render.com)
- **Deploy Blueprint:** [render.com/select-repo?type=blueprint](https://dashboard.render.com/select-repo?type=blueprint)
- **Render Docs:** [render.com/docs](https://render.com/docs)

---

## ⚡ After Deployment

### Update Your Mobile App:

Edit `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_VIBECODE_BACKEND_URL": "https://your-app.onrender.com"
      }
    }
  }
}
```

### Build for TestFlight:
```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 750h/month, cold starts |
| **Starter** | $7/mo | Always-on, faster |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database lost | Check disk at `/data` |
| 502 errors | Check logs tab |
| Can't connect | Verify `BACKEND_URL` |
| Auth fails | Check `BETTER_AUTH_SECRET` |

---

## 📚 More Help?

- **Full Guide:** `RENDER_DEPLOYMENT_GUIDE.md` (detailed)
- **Checklist:** `RENDER_CHECKLIST.md` (step-by-step)
- **Alternatives:** `DEPLOYMENT_ALTERNATIVES.md` (other platforms)

---

**That's it! Your backend is live! 🎉**
