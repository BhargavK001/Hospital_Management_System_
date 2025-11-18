
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Patient = require('./models/Patient');
const DoctorModel = require("./models/Doctor");
const BillingModel = require("./models/Billing");
const AppointmentModel = require("./models/Appointment");
const Service = require("./Models/Service");
const ADMIN_EMAIL = "admin@onecare.com";
const ADMIN_PASSWORD = "admin123";


const app = express();


app.use(cors());            
app.use(express.json());    
// connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/hospital_auth")
  .then(() => {
    console.log("✅ Connected to MongoDB (hospital_auth)");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });


app.post("/login", async(req, res) => {
  try {
    
    const { email, password } = req.body;


    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.json({
        id: "admin-id",
        name: "System Admin",
        email: ADMIN_EMAIL,
        role: "admin",
      });
    }
    
   
    const user = await User.findOne({ email });



    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

   
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});



app.post("/signup", async(req, res) => {
  try {
    
    const { name, email, password } = req.body;
   
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    
    const newUser = await User.create({
      email,
      password,         
      role: "patient",   
      name
    });

   
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});


//         PATIENT APIs


const PatientModel = require("./models/Patient");

// Add Patient
app.post("/patients", async (req, res) => {
  try {
    const patient = await PatientModel.create(req.body);
    res.json({ message: "Patient added", data: patient });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get Patients
app.get("/patients", (req, res) => {
  PatientModel.find()
    .then((patients) => res.json(patients))
    .catch((err) => res.status(500).json(err));
});

// Delete Patient
app.delete("/patients/:id", async (req, res) => {
  try {
    await PatientModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ===============================
//     DASHBOARD STATISTICS
// ===============================

app.get("/dashboard-stats", async (req, res) => {
  try {
    const [totalPatients , totalDoctors] = await Promise.all([
      PatientModel.countDocuments(),
      DoctorModel.countDocuments()
    ]);

    res.json({totalDoctors , totalPatients});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ===============================
//         DOCTOR APIs
// ===============================

app.post("/doctors", async (req, res) => {
  try {
    const doctor = await DoctorModel.create(req.body);
    res.json({ message: "Doctor added", data: doctor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/doctors", async (req, res) => {
  try {
    const doctors = await DoctorModel.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.delete("/doctors/:id", async (req, res) => {
  try {
    await DoctorModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting doctor", error: err.message });
  }
});


// ===============================
//          APPOINTMENTS
// ===============================

// Create appointment
app.post("/appointments", async (req, res) => {
  try {
    const doc = await AppointmentModel.create(req.body);
    res.json({ message: "Appointment created", data: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get appointments
app.get("/appointments", async (req, res) => {
  try {
    const list = await AppointmentModel.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===============================
//         SERVICE APIs
// ===============================

// GET all services
app.get("/api/services", async (req, res) => {
  try {
    const all = await Service.find();
    console.log("GET /api/services ->", all.length, "items");  // 👈 log how many
    res.json(all);
  } catch (err) {
    console.error("GET /api/services error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ADD service
app.post("/api/services", async (req, res) => {
  try {
    console.log("POST /api/services body:", req.body);   // 👈 log incoming data
    const data = new Service(req.body);
    const saved = await data.save();
    console.log("Saved service:", saved);                // 👈 log saved doc
    res.json(saved);
  } catch (err) {
    console.error("Error saving service:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// DELETE service
app.delete("/api/services/:id", async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// TOGGLE Active status
app.put("/api/services/toggle/:id", async (req, res) => {
  const service = await Service.findById(req.params.id);
  service.active = !service.active;
  await service.save();
  res.json(service);
});

// UPDATE service (very simple)
app.put("/api/services/:id", async (req, res) => {
  try {
    // find and update, return the updated document
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Update service error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===============================
//         BILL APIs
// ===============================

// Create Bill
app.post("/bills", async (req, res) => {
  try {
    const bill = await BillingModel.create(req.body);
    res.json({ message: "Bill created successfully", data: bill });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// Get All Bills
app.get("/bills", async (req, res) => {
  try {
    const bills = await BillingModel.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching bills", error: err.message });
  }
});

// Get Single Bill
app.get("/bills/:id", async (req, res) => {
  try {
    const bill = await BillingModel.findById(req.params.id);
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bill" });
  }
});

// Update Bill
app.put("/bills/:id", async (req, res) => {
  try {
    const updated = await BillingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: "Bill updated", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating bill" });
  }
});

// Delete Bill
app.delete("/bills/:id", async (req, res) => {
  try {
    await BillingModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting bill" });
  }
});

// Docotor Related stuff here
app.post("/doctors", async (req, res) => {
  try {
    console.log(" Incoming doctor data:", req.body);
    const doctor = await DoctorModel.create(req.body);
    res.json({ message: "Doctor added", data: doctor });
  } catch (err) {
    console.error(" Error saving doctor:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Get All Doctors
app.get("/doctors", async (req, res) => {
  try {
    const doctors = await DoctorModel.find();
    res.json(doctors);
  } catch (err) {
    console.error(" Error fetching doctors:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Delete Doctor
app.delete("/doctors/:id", async (req, res) => {
  try {
    await DoctorModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting doctor", error: err.message });
  }
});

// -------------------------Appointment----------------

// create appointment
app.post("/appointments", async (req, res) => {
  try {
    const doc = await AppointmentModel.create(req.body);
    res.json({ message: "Appointment created", data: doc });
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// list appointments with optional filters (query params)
app.get("/appointments", async (req, res) => {
  try {
    const q = {};
    // simple filtering - treat date as YYYY-MM-DD string
    if (req.query.date) q.date = req.query.date;
    if (req.query.clinic) q.clinic = { $regex: req.query.clinic, $options: "i" };
    if (req.query.patient) q.patientName = { $regex: req.query.patient, $options: "i" };
    if (req.query.doctor) q.doctorName = { $regex: req.query.doctor, $options: "i" };
    if (req.query.status) q.status = req.query.status;

    // add pagination later (limit/skip) if needed
    const list = await AppointmentModel.find(q).sort({ createdAt: -1 }).limit(500);
    res.json(list);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE appointment
app.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AppointmentModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Cancel appointment (mark status Cancelled)
app.put("/appointments/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    const appt = await AppointmentModel.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: "Appointment cancelled", data: appt });
  } catch (err) {
    console.error("Cancel error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 6. Start the server on port 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log("Backend server running on http://localhost:" + PORT);
});
