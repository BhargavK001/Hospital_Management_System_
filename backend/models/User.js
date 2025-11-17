// backend/models/User.js

const mongoose = require("mongoose");

// 1) Define structure (schema) of User document
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,       // no two users with same email
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,       // "patient", "doctor", "receptionist"
    required: true,
  },
   name: {
    type: String,
    required: true,     // must be provided
  }
});

// 2) Create model from schema
const User = mongoose.model("User", userSchema);

// 3) Export model so index.js can use it
module.exports = User;
