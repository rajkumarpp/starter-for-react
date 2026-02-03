# React App Deployment Guide

This is a **client-side React application** that connects to Appwrite Cloud for authentication and backend services.

## ⚠️ Important: This is NOT an Appwrite Function

This app should be deployed as a **static website**, not as an Appwrite serverless function.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_APPWRITE_ENDPOINT` = `https://sgp.cloud.appwrite.io/v1`
   - `VITE_APPWRITE_PROJECT_ID` = `698163a6002fd5de9211`
   - `VITE_APPWRITE_PROJECT_NAME` = `The Royal Ledger`
6. Click Deploy

**After deployment:**
- Add your Vercel domain to Appwrite Console → Settings → Platforms → Web App

### Option 2: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables (same as above)
7. Deploy

**After deployment:**
- Add your Netlify domain to Appwrite Console → Settings → Platforms → Web App

### Option 3: Build and Host Manually

1. **Build the app:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Upload the `dist` folder** to any static hosting service:
   - AWS S3 + CloudFront
   - Azure Static Web Apps
   - Google Cloud Storage
   - Any web server (Apache, Nginx)

## Environment Variables Required

Make sure to set these on your hosting platform:

\`\`\`env
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=698163a6002fd5de9211
VITE_APPWRITE_PROJECT_NAME=The Royal Ledger
\`\`\`

## Post-Deployment Steps

After deploying, you MUST update Appwrite Console:

1. Go to Appwrite Console: https://cloud.appwrite.io
2. Select your project (ID: `698163a6002fd5de9211`)
3. Go to **Settings** → **Platforms**
4. Click **Add Platform** → **Web App**
5. Add your deployment domain:
   - **Name**: `Production`
   - **Hostname**: Your deployed domain (e.g., `myapp.vercel.app`)
   - Do NOT include `https://` or paths

This allows Appwrite to set session cookies for your production domain.

## Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

App will run at `http://localhost:5173`

## Why Not Appwrite Functions?

Appwrite Functions are for **backend serverless functions** (Node.js/Python code that runs on the server).

This React app is a **frontend application** that:
- Runs in the browser
- Already connects to Appwrite Cloud for backend
- Doesn't need server-side rendering
- Should be deployed as static files

## Architecture

\`\`\`
Frontend (This App)          Appwrite Cloud
┌─────────────────┐         ┌──────────────────┐
│  React App      │────────>│  Authentication  │
│  (Static HTML/  │  API    │  Database        │
│   JS/CSS)       │ Calls   │  Storage         │
└─────────────────┘         └──────────────────┘
     Hosted on                  Backend as a
  Vercel/Netlify                   Service
\`\`\`

You don't need a custom backend - Appwrite Cloud IS your backend!
