# Render Deployment Guide

Deploy OneCare Hospital Management System on **Render.com** with separate backend (Web Service) and frontend (Static Site).

---

## 📋 Prerequisites

- [Render.com](https://render.com) account (free tier works)
- MongoDB Atlas account (free tier works)
- GitHub repository connected to Render

---

## 🖥️ Backend Deployment (Web Service)

### Step 1: Create a New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting            | Value                              |
| ------------------ | ---------------------------------- |
| **Name**           | `onecare-backend` (or your choice) |
| **Root Directory** | `backend`                          |
| **Runtime**        | Node                               |
| **Build Command**  | `npm install`                      |
| **Start Command**  | `npm start`                        |
| **Instance Type**  | Free (or paid for production)      |

### Step 2: Configure Environment Variables

In the **Environment** tab, add these variables:

```env
# Server
PORT=3001
NODE_ENV=production

# Database (MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hospital_db?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters

# URLs (Update after deployment)
CORS_ORIGIN=https://your-frontend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
BACKEND_URL=https://your-backend.onrender.com

# Email (SMTP - Brevo/Sendinblue)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/doctor/callback

# WhatsApp Business API (optional)
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

### Step 3: Deploy

Click **Create Web Service**. Render will automatically:

1. Clone your repository
2. Install dependencies
3. Start the server

> **Note**: Free tier instances spin down after 15 minutes of inactivity. First request after spin-down takes ~30 seconds.

### Step 4: Verify Deployment

Visit your backend URL + `/health`:

```
https://your-backend.onrender.com/health
```

Should return:

```json
{ "status": "ok", "timestamp": "2024-01-15T12:00:00.000Z" }
```

---

## 🌐 Frontend Deployment (Static Site)

### Step 1: Update Environment Variables

Before deploying, update `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Step 2: Create a New Static Site

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Static Site**
3. Connect your GitHub repository
4. Configure the site:

| Setting               | Value                               |
| --------------------- | ----------------------------------- |
| **Name**              | `onecare-frontend` (or your choice) |
| **Root Directory**    | `frontend`                          |
| **Build Command**     | `npm install && npm run build`      |
| **Publish Directory** | `dist`                              |

### Step 3: Configure Redirect Rules

Add a rewrite rule for SPA routing:

| Source | Destination   | Action  |
| ------ | ------------- | ------- |
| `/*`   | `/index.html` | Rewrite |

### Step 4: Deploy

Click **Create Static Site**. Render will build and deploy your frontend.

---

## 🔧 Post-Deployment Configuration

### Update CORS Origins

After both services are deployed, update the backend environment variables:

```env
CORS_ORIGIN=https://your-frontend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
```

### Update OAuth Redirect URIs

In Google Cloud Console, update the authorized redirect URI:

```
https://your-backend.onrender.com/api/auth/google/doctor/callback
```

### MongoDB Atlas Network Access

1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` to allow connections from Render's dynamic IPs
   - Or use Render's static outbound IPs (paid feature)

---

## 🌍 Custom Domain (Optional)

### Backend

1. Go to your Web Service → Settings → Custom Domains
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS with the provided CNAME

### Frontend

1. Go to your Static Site → Settings → Custom Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Update DNS with the provided CNAME

---

## ✅ Deployment Checklist

### Backend

- [ ] Web Service created on Render
- [ ] Environment variables configured
- [ ] Health check passing at `/health`
- [ ] MongoDB Atlas IP whitelist updated

### Frontend

- [ ] Static Site created on Render
- [ ] `.env.production` updated with backend URL
- [ ] SPA rewrite rule configured
- [ ] Build successful

### Integration

- [ ] CORS_ORIGIN updated with frontend URL
- [ ] OAuth redirect URIs updated
- [ ] Frontend can communicate with backend

---

## 🐛 Troubleshooting

| Issue             | Solution                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| Build fails       | Check build logs in Render dashboard                                     |
| CORS errors       | Verify `CORS_ORIGIN` includes frontend URL                               |
| MongoDB timeout   | Whitelist `0.0.0.0/0` in Atlas Network Access                            |
| 502 Bad Gateway   | Check if backend is running (`pm2 status` equivalent: check Render logs) |
| Slow first load   | Free tier spin-down; upgrade to paid for always-on                       |
| OAuth not working | Update redirect URIs in Google Cloud Console                             |

---

## 🔄 Automatic Deploys

Render automatically deploys when you push to your connected branch. To disable:

1. Go to Service Settings
2. Toggle off **Auto-Deploy**
