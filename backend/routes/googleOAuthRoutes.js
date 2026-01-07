const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const DoctorModel = require("../models/Doctor");
const { verifyToken } = require("../middleware/auth");
const logger = require("../utils/logger");

// OAuth2 Client Configuration
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/google/doctor/callback`
  );
};

// Scopes needed for Google Calendar + Meet
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// ==========================================
// GET OAuth URL for Doctor
// ==========================================
router.get("/url", verifyToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const oauth2Client = getOAuth2Client();
    
    // State parameter to verify callback
    const state = Buffer.from(JSON.stringify({ doctorId })).toString('base64');
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: state,
      prompt: 'consent' // Force consent to get refresh token
    });
    
    res.json({ url: authUrl });
  } catch (err) {
    logger.error("Error generating Google OAuth URL", { error: err.message });
    res.status(500).json({ message: "Failed to generate OAuth URL" });
  }
});

// ==========================================
// OAuth Callback Handler
// ==========================================
router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/doctor/settings/integration?error=missing_params`);
    }
    
    // Decode state to get doctorId
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      return res.redirect(`${process.env.FRONTEND_URL}/doctor/settings/integration?error=invalid_state`);
    }
    
    const { doctorId } = stateData;
    
    const oauth2Client = getOAuth2Client();
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    
    // Update doctor with tokens
    await DoctorModel.findByIdAndUpdate(doctorId, {
      googleConnected: true,
      googleTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date),
        email: email
      }
    });
    
    logger.info("Doctor connected Google account", { doctorId, email });
    
    // Redirect back to settings with success
    res.redirect(`${process.env.FRONTEND_URL}/doctor/settings/integration?success=true`);
  } catch (err) {
    logger.error("Google OAuth callback error", { error: err.message });
    res.redirect(`${process.env.FRONTEND_URL}/doctor/settings/integration?error=oauth_failed`);
  }
});

// ==========================================
// Get Connection Status
// ==========================================
router.get("/status", verifyToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const doctor = await DoctorModel.findById(doctorId).select('googleConnected googleTokens.email');
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    res.json({
      connected: doctor.googleConnected || false,
      email: doctor.googleTokens?.email || null
    });
  } catch (err) {
    logger.error("Error checking Google status", { error: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// Disconnect Google Account
// ==========================================
router.post("/disconnect", verifyToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    await DoctorModel.findByIdAndUpdate(doctorId, {
      googleConnected: false,
      googleTokens: {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        email: null
      }
    });
    
    logger.info("Doctor disconnected Google account", { doctorId });
    
    res.json({ message: "Google account disconnected successfully" });
  } catch (err) {
    logger.error("Error disconnecting Google", { error: err.message });
    res.status(500).json({ message: "Failed to disconnect" });
  }
});

module.exports = router;
