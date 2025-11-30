# Quick Start - Deploy Backend in 5 Minutes

## The Fastest Way: Use Google Cloud Shell

1. **Open Cloud Shell**
   - Go to: https://console.cloud.google.com
   - Click the terminal icon (top-right) - "Activate Cloud Shell"
   - No installation needed! Everything is pre-configured.

2. **Create a New Project**
   - In Cloud Shell, run:
   ```bash
   gcloud projects create otassist-backend --name="OTAssist Backend"
   gcloud config set project otassist-backend
   ```

3. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

4. **Upload Your Backend Folder**
   - Click the "More" (⋮) button in Cloud Shell
   - Select "Upload"
   - Upload your entire `/backend` folder as a ZIP

5. **Run the Deploy Script**
   ```bash
   cd backend
   chmod +x deploy.sh
   ./deploy.sh
   ```

6. **Follow the Prompts**
   - Enter your project ID: `otassist-backend`
   - Generate secret: `openssl rand -hex 32` (copy the output)
   - Choose database: `1` (SQLite for testing)

7. **Get Your Production URL**
   - Script will output: `https://otassist-backend-xxxxx.run.app`
   - Copy this URL!

8. **Test It**
   ```bash
   curl https://your-url.run.app/health
   ```

## That's It! 🎉

Now update your `eas.json` with the production URL and you're ready to build for TestFlight!

---

**Need help?** Check the full guide: `FIREBASE_DEPLOYMENT.md`
