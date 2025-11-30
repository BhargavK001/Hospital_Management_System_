const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// --- DB Connection ---
const connectDB = require("./config/db");

// --- Model Registration (Ensure models are loaded) ---
require("./models/Doctor");
require("./models/Appointment");
// (Add other models here if they rely on being registered early)

console.log("🔧 Dotenv loaded. TWILIO_ACCOUNT_SID present:", !!process.env.TWILIO_ACCOUNT_SID);

// --- Route Imports ---
const authRoutes = require("./routes/auth");
const receptionistRoutes = require("./routes/receptionistRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const clinicRoutes = require("./routes/clinicRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorSessionRoutes = require("./routes/doctorSessionRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const taxRoutes = require("./routes/taxRoutes");
const billingRoutes = require("./routes/billingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const encounterRoutes = require("./routes/encounterRoutes");
const encounterTemplateRoutes = require("./routes/encounterTemplateRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const emailRoutes = require("./routes/emailRoutes");

// ✅ NEW: Import Listing Routes
const listingRoutes = require("./routes/listingRoutes");

const app = express();

// --- Connect to Database ---
connectDB();

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- Static Folder for Uploads ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Route Registration ---
app.use("/", authRoutes);
app.use("/doctors", doctorRoutes); 
app.use("/pdf", pdfRoutes);
app.use("/api", clinicRoutes); 
app.use("/api/receptionists", receptionistRoutes);

// Application Routes
app.use("/patients", patientRoutes);
app.use("/doctor-sessions", doctorSessionRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/services", serviceRoutes);
app.use("/taxes", taxRoutes);
app.use("/bills", billingRoutes);
app.use("/dashboard-stats", dashboardRoutes);
app.use("/", userRoutes); 
app.use("/encounters", encounterRoutes);
app.use("/encounter-templates", encounterTemplateRoutes);
app.use("/api/email", emailRoutes);
app.use("/holidays", holidayRoutes);

// ✅ NEW: Register Listing Routes
app.use("/listings", listingRoutes);

// --- Start Server ---
const PORT = 3001;
app.listen(PORT, () => {
  console.log("Backend server running on http://localhost:" + PORT);
});