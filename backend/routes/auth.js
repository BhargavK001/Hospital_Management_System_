// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Models
const User = require("../models/User");
const Receptionist = require("../models/Receptionist");
const PatientModel = require("../models/Patient");

// Static admin credentials (simple built-in admin)
const ADMIN_EMAIL = "admin@onecare.com";
const ADMIN_PASSWORD = "admin123";

// Helper to check password for both hashed and plain text cases
async function checkPassword(inputPassword, storedPassword) {
  // Try bcrypt compare first
  try {
    const match = await bcrypt.compare(inputPassword, storedPassword);
    if (match) return true;
  } catch (err) {
    console.log("bcrypt compare error, will try plain compare");
  }

  // Fallback: plain string compare (for old records)
  if (inputPassword === storedPassword) {
    return true;
  }

  return false;
}

// Login route (admin, receptionist, patient, doctor)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN ATTEMPT:", email);

    // 1) Check static admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log("ADMIN LOGIN SUCCESS");
      return res.json({
        id: "admin-id",
        name: "System Admin",
        email: ADMIN_EMAIL,
        role: "admin",
        profileCompleted: true,
      });
    }

    // 2) Check receptionist collection first
    const receptionist = await Receptionist.findOne({ email });

    if (receptionist) {
      console.log("FOUND IN RECEPTIONIST COLLECTION");

      const match = await checkPassword(password, receptionist.password);
      console.log("Receptionist password valid:", match);

      if (!match) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      return res.json({
        id: receptionist._id,
        email: receptionist.email,
        role: "receptionist",
        name: receptionist.name,
        mustChangePassword: receptionist.mustChangePassword,
        profileCompleted: true,
      });
    }

    // 3) If not receptionist, check User collection (patients + doctors)
    const user = await User.findOne({ email });

    if (user) {
      console.log("FOUND IN USER COLLECTION:", user.role);

      const match = await checkPassword(password, user.password);
      console.log("User password valid:", match);

      if (!match) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      return res.json({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileCompleted: user.profileCompleted,
        mustChangePassword:
          typeof user.mustChangePassword === "boolean"
            ? user.mustChangePassword
            : false,
      });
    }

    console.log("NO USER FOUND — INVALID LOGIN");
    return res.status(401).json({ message: "Invalid email or password" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Signup for normal patient user
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "patient",
      name,
      profileCompleted: false,
    });

    // Create basic patient record linked with this user
    await PatientModel.create({
      userId: newUser._id,
      firstName: name,
      email,
    });

    res.status(201).json({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      profileCompleted: newUser.profileCompleted,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Change password for receptionist on first login
router.put("/receptionists/change-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const receptionist = await Receptionist.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
        mustChangePassword: false,
      },
      { new: true }
    );

    if (!receptionist) {
      return res.status(404).json({ message: "Receptionist not found" });
    }

    return res.json({
      message: "Password updated successfully",
      id: receptionist._id,
      email: receptionist.email,
      role: "receptionist",
      name: receptionist.name,
      mustChangePassword: receptionist.mustChangePassword,
    });
  } catch (err) {
    console.error("Receptionist change password error:", err);
    res.status(500).json({
      message: "Server error while updating password",
    });
  }
});

module.exports = router;
