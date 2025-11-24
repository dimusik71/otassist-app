# Alternative Deployment Options

This guide covers deploying OTAssist backend to various platforms besides Railway.

---

## 🚀 Option 1: Render (Easiest - Recommended)

### Why Render?
- ✅ **Free tier**: 750 hours/month (enough for small apps)
- ✅ **Zero config**: Detects Bun automatically
- ✅ **Persistent disk**: SQLite data persists across deploys
- ✅ **Auto HTTPS**: SSL certificates included
- ⚠️ **Cold starts**: Free tier spins down after 15 mins inactivity

### Quick Deploy to Render

1. **Sign up**: Go to [render.com](https://render.com) and create account

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Set root directory: `backend`
   - Render auto-detects settings

3. **Configure Service**:
   - Name: `otassist-backend`
   - Region: Choose closest to users
   - Branch: `main`
   - Build Command: `bun install && bunx prisma generate && bunx prisma migrate deploy`
   - Start Command: `bun run start`

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=file:/data/production.db
   BETTER_AUTH_SECRET=<generate-64-char-secret>
   BACKEND_URL=<your-render-url>
   ```

5. **Add Persistent Disk**:
   - Go to service → Settings → Disks
   - Click "Add Disk"
   - Name: `sqlite-data`
   - Mount Path: `/data`
   - Size: 1 GB

6. **Deploy**: Render will build and deploy automatically

**Your URL**: `https://otassist-backend.onrender.com`

### Cost
- **Free**: 750 hours/month
- **Paid**: $7/month (no sleep, faster)

---

## 🪁 Option 2: Fly.io (Best for SQLite)

### Why Fly.io?
- ✅ **SQLite optimized**: Excellent persistent volume support
- ✅ **Edge deployment**: Fast globally
- ✅ **$5 free credit/month**: Good for small apps
- ✅ **Always on**: No cold starts on free tier
- ⚠️ **CLI required**: Needs command-line setup

### Deploy to Fly.io

1. **Install Fly CLI**:
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh

   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Navigate to backend**:
   ```bash
   cd backend
   ```

4. **Launch app**:
   ```bash
   fly launch
   ```

   When prompted:
   - Use existing `fly.toml`? **Yes**
   - Deploy now? **No** (we need to set secrets first)

5. **Create persistent volume**:
   ```bash
   fly volumes create sqlite_data --size 1 --region syd
   ```

6. **Set secrets**:
   ```bash
   fly secrets set BETTER_AUTH_SECRET=$(openssl rand -hex 32)
   fly secrets set BACKEND_URL=https://otassist-backend.fly.dev
   ```

7. **Deploy**:
   ```bash
   fly deploy
   ```

8. **Check status**:
   ```bash
   fly status
   fly logs
   ```

**Your URL**: `https://otassist-backend.fly.dev`

### Cost
- **Free**: $5 credit/month (enough for 1-2 small apps)
- **Paid**: ~$3-5/month for small backend

---

## 🌊 Option 3: Digital Ocean App Platform

### Why Digital Ocean?
- ✅ **Predictable pricing**: $5/month flat rate
- ✅ **Reliable**: Enterprise-grade infrastructure
- ✅ **Good docs**: Excellent documentation
- ⚠️ **No free tier**: Costs $5/month minimum

### Deploy to Digital Ocean

1. **Sign up**: [digitalocean.com](https://digitalocean.com)

2. **Create App**:
   - Apps → Create App
   - Connect GitHub repo
   - Select `backend` directory

3. **Configure**:
   - Type: Web Service
   - Build Command: `bun install && bunx prisma generate && bunx prisma migrate deploy && bun run build`
   - Run Command: `bun run start`
   - HTTP Port: 3000

4. **Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=file:/data/production.db
   BETTER_AUTH_SECRET=<generate-secret>
   BACKEND_URL=${APP_URL}
   ```

5. **Add Volume**:
   - Storage → Add Volume
   - Mount Path: `/data`
   - Size: 1 GB

**Your URL**: `https://otassist-backend-xxxxx.ondigitalocean.app`

### Cost
- **Basic**: $5/month
- **Professional**: $12/month (2x resources)

---

## 📊 Comparison Table

| Platform | Free Tier | SQLite Support | Ease of Setup | Cold Starts | Best For |
|----------|-----------|----------------|---------------|-------------|----------|
| **Render** | 750h/month | ✅ Yes | ⭐⭐⭐⭐⭐ | Yes (free) | Beginners |
| **Railway** | $5 credit | ✅ Yes | ⭐⭐⭐⭐⭐ | No | Quick start |
| **Fly.io** | $5 credit | ✅ Excellent | ⭐⭐⭐ | No | SQLite apps |
| **Digital Ocean** | No | ✅ Yes | ⭐⭐⭐⭐ | No | Production |

---

## 🔐 Security Checklist (All Platforms)

After deployment:

✅ Generate strong BETTER_AUTH_SECRET (32+ chars)
✅ Set BACKEND_URL to your actual domain
✅ Use HTTPS only (all platforms do this by default)
✅ Set NODE_ENV=production
✅ Add real API keys (not placeholders)
✅ Configure persistent volumes for database
✅ Test health endpoint: `curl https://your-url/health`

---

## 🧪 Testing Your Deployment

After deploying to any platform:

1. **Test health check**:
   ```bash
   curl https://your-backend-url/health
   # Should return: {"status":"ok"}
   ```

2. **Test authentication** (from mobile app):
   - Update `eas.json` with your backend URL
   - Rebuild app: `eas build --platform ios --profile production`
   - Install via TestFlight
   - Try creating account and logging in

3. **Monitor logs**:
   - **Render**: Dashboard → Logs
   - **Railway**: Dashboard → Deployments → Logs
   - **Fly.io**: `fly logs`
   - **Digital Ocean**: Apps → Runtime Logs

---

## 💡 Recommendation

**For your use case (TestFlight testing):**

1. **Start with Render** - Easiest setup, free tier, good for testing
2. **Or use Railway** - Already configured, very simple
3. **Upgrade to Fly.io** - If you need better SQLite performance later
4. **Move to Digital Ocean** - When ready for production at scale

---

## 🆘 Troubleshooting

### Database not persisting?
- Ensure volume is mounted at `/data`
- Check `DATABASE_URL` points to `/data/production.db`

### Authentication failing?
- Verify `BACKEND_URL` matches your actual URL
- Check `BETTER_AUTH_SECRET` is set and >= 32 chars

### App not starting?
- Check build logs for errors
- Verify Prisma migrations ran: `bunx prisma migrate deploy`
- Ensure all environment variables are set

### Cold starts too slow (Render)?
- Upgrade to paid plan ($7/month)
- Or switch to Railway/Fly.io (no cold starts)

---

## 📞 Support

- **Render**: [render.com/docs](https://render.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Fly.io**: [fly.io/docs](https://fly.io/docs)
- **Digital Ocean**: [docs.digitalocean.com](https://docs.digitalocean.com)
