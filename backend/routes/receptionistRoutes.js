// routes/receptionistRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  addReceptionist,
  getReceptionists,
  getReceptionistById,
  updateReceptionist,
  deleteReceptionist,
  toggleReceptionistStatus,
  resendCredentials,
  importReceptionists,
  changePassword,
} = require("../controllers/receptionistController");

// Multer setup for CSV import
const upload = multer({ dest: "uploads/" });

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

// List all receptionists
router.get("/", getReceptionists);

// Get single receptionist
router.get("/:id", getReceptionistById);

// Add receptionist
router.post("/", addReceptionist);

// Update receptionist
router.put("/:id", updateReceptionist);

// Delete receptionist
router.delete("/:id", deleteReceptionist);

// Toggle status
router.patch("/:id/status", toggleReceptionistStatus);

// Resend login credentials
router.post("/:id/resend-credentials", resendCredentials);

// Change password
router.put("/change-password/:id", changePassword);

// Import CSV
router.post("/import", upload.single("file"), importReceptionists);

module.exports = router;
