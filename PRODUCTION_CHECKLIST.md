# Production Readiness Checklist

## 1. Environment Configuration

- [ ] **Environment Variables**: Ensure all variables in `.env` are set for production.
  - `NODE_ENV=production`
  - `MONGO_URI` (Use production database)
  - `JWT_SECRET` (Use a strong, long secret)
  - `CORS_ORIGIN` (Set to specific frontend domain, e.g., `https://onecare.app`, NOT `*`)
  - `FRONTEND_URL` & `BACKEND_URL` (Correct public URLs)
  - `PORT` (e.g., 10000 on Render)
- [ ] **Secrets Management**: Ensure `.env` is NOT committed to git.

## 2. Security

- [ ] **HTTPS**: Ensure the application runs over HTTPS (Render/Heroku handles this automatically).
- [ ] **Secure Headers**: `helmet` middleware is enabled in `backend/index.js`.
- [ ] **CORS**: Verify strictly allowed origins only.
- [ ] **MongoDB**: Whitelist IP addresses for MongoDB Access (e.g., MongoDB Atlas Network Access).

## 3. Performance & Reliability

- [ ] **Logging**: `winston` is used for logging. `console.log` should be minimal or removed.
- [ ] **Compression**: `compression` middleware is enabled.
- [ ] **Database Indexes**: Ensure frequently queried fields (e.g., `email`, `date`, `patientId`) are indexed in MongoDB.
- [ ] **Keep-Alive**: If using Render Free Tier, ensure `utils/keepAlive.js` mechanism is active or upgrade service plan.

## 4. Frontend Optimization

- [ ] **Build**: Run `npm run build` locally to verify no errors.
- [ ] **Compression**: Verify `vite-plugin-compression` is active (check for `.gz` files in `dist/`).
- [ ] **Console Logs**: Remove `console.log` from frontend code (use a linter or search).

## 5. Third-Party Integrations

- [ ] **Razorpay**: Switch keys to Production mode.
- [ ] **Google OAuth**: Add production domain to "Authorized JavaScript origins" and "Authorized redirect URIs" in Google Cloud Console.
- [ ] **Zoom/WhatsApp**: Update webhooks/callbacks if environment URLs change.

## 6. Deployment

- [ ] **Build Command**: `npm install` (backend) / `npm install && npm run build` (frontend).
- [ ] **Start Command**: `node index.js` (backend).
