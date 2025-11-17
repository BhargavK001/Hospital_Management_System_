const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: String,
  clinicName: String,
  doctor: String,
  charges: String,
  duration: String,
  category: String,
  active: Boolean
});

module.exports = mongoose.model("Service", ServiceSchema);
