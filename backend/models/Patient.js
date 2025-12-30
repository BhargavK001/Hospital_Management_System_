const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({

  // Link to User collection (the account used to login)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Must exist now
  },

  clinic: String,
  // Removed redundant fields (firstName, lastName, email, phone, dob, bloodGroup, gender, address, city, country, postalCode)
  // These are now fetched from User via populating userId

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Database Indexes for improved query performance
PatientSchema.index({ email: 1 });
PatientSchema.index({ userId: 1 });
PatientSchema.index({ phone: 1 }); // Optimize phone lookups
PatientSchema.index({ clinic: 1 });
PatientSchema.index({ isActive: 1 });

const PatientModel = mongoose.model("Patient", PatientSchema);
module.exports = PatientModel;
