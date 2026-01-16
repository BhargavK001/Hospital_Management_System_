const nodemailer = require("nodemailer");
const logger = require("./logger");

// Log email configuration (without sensitive data)
logger.info("Email service configuration", {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : "NOT SET",
  from: process.env.EMAIL_FROM ? "SET" : "NOT SET",
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add timeouts to prevent indefinite hangs on cloud platforms
  connectionTimeout: 10000, // 10 seconds to establish connection
  greetingTimeout: 10000,   // 10 seconds for SMTP greeting
  socketTimeout: 30000,     // 30 seconds for socket operations
  // Enable debug logging in production to diagnose issues
  debug: process.env.NODE_ENV !== "production",
  logger: process.env.NODE_ENV !== "production",
});

// Verify transporter connection on startup
transporter.verify()
  .then(() => {
    logger.info("Email transporter verified successfully - SMTP connection is working");
  })
  .catch((error) => {
    logger.error("Email transporter verification failed", { 
      error: error.message,
      code: error.code,
      command: error.command 
    });
  });

async function sendEmail({ to, subject, html }) {
  try {
    logger.info("Sending email", { to, subject });

    const startTime = Date.now();
    
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    const duration = Date.now() - startTime;
    logger.info("Email sent successfully", { 
      to, 
      messageId: result.messageId,
      duration: `${duration}ms` 
    });
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error("Failed to send email", { 
      to, 
      error: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode
    });
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };
