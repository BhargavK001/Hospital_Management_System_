const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "patients", required: false },
  patientName: String,
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "doctors", required: false },
  doctorName: String,
  clinic: String,
  date: String, // store as ISO date string (yyyy-mm-dd) or Date if preferred
  time: String,
  services: String,
  charges: Number,
  paymentMode: String,
  status: { type: String, default: "upcoming" }, // upcoming, completed, cancelled
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("appointments", AppointmentSchema);
