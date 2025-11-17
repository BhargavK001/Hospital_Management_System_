const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  clinic: String,
  email: String,
  phone: String,
  dob: String,
  bloodGroup: String,
  gender: String,
  address: String,
  city: String,
  country: String,
  postalCode: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const PatientModel = mongoose.model("patients", PatientSchema);
module.exports = PatientModel;
