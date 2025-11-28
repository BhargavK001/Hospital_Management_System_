const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/emailService");

// POST /api/email/test-email
router.post("/test-email", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ message: "Email and message are required." });
  }

  try {
    await sendEmail({
      to,
      subject: "Test Email from OneCare",
      html: `<p>${message}</p>`,
    });

    res.status(200).json({ message: "Test email sent successfully." });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ message: "Failed to send test email." });
  }
});

module.exports = router;
