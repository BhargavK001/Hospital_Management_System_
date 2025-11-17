import React, { useEffect, useState } from "react";
import axios from "axios";
import PatientLayout from "../layouts/PatientLayout";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = "http://localhost:3001";

// fallback services (if /services API is not ready)
const FALLBACK_SERVICES = [
  { id: "telemed", name: "Telemed", price: 100 },
  { id: "checkup", name: "Checkup", price: 100 },
];

// static time slots (like your screenshot)
const DEFAULT_SLOTS = [
  "11:30 am", "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm",
  "2:00 pm", "2:30 pm", "3:00 pm", "3:30 pm", "4:30 pm", "5:00 pm",
  "5:30 pm", "6:00 pm", "6:30 pm", "7:00 pm", "7:30 pm", "8:00 pm",
  "8:30 pm", "9:00 pm", "9:30 pm", "10:00 pm", "10:30 pm", "11:00 pm",
];

export default function PatientBookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();

  // read patient from localStorage (same style as other patient pages)
  const storedPatient = (() => {
    try {
      return JSON.parse(localStorage.getItem("patient") || "null");
    } catch {
      return null;
    }
  })();

  const patientName =
    storedPatient?.name ||
    (storedPatient?.firstName
      ? `${storedPatient.firstName} ${storedPatient.lastName || ""}`
      : "") ||
    "";

  // get preselected date from query (?date=...)
  const params = new URLSearchParams(location.search);
  const preselectedDate = params.get("date") || "";

  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [services, setServices] = useState(FALLBACK_SERVICES);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  const [selectedServices, setSelectedServices] = useState([]); // ids
  const [selectedSlot, setSelectedSlot] = useState("");

  const [form, setForm] = useState({
  clinic: "",
  doctor: "",
  date: preselectedDate,
  // auto-fill, fallback to "Patient"
  patient: patientName || "Patient",
  status: "booked",
  servicesDetail: "",
});


  const [submitting, setSubmitting] = useState(false);

  // Fetch doctors and derive clinics from them
  useEffect(() => {
    let mounted = true;

    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/doctors`);
        if (!mounted) return;
        const docs = Array.isArray(res.data) ? res.data : [];
        setDoctors(docs);

        // derive unique clinic names from doctors
        const clinicNames = Array.from(
          new Set(
            docs
              .map((d) => d.clinic)
              .filter((c) => typeof c === "string" && c.trim() !== "")
          )
        );
        setClinics(clinicNames);
      } catch (err) {
        console.error("Error loading doctors:", err);
        if (mounted) {
          setDoctors([]);
          setClinics([]);
        }
      } finally {
        if (mounted) setLoadingDoctors(false);
      }
    };

    // optional: fetch services from backend
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_BASE}/services`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (!mounted) return;
        if (data.length) {
          const mapped = data.map((s) => ({
            id: s._id || s.id || s.name,
            name: s.name || s.serviceName || "Service",
            price: s.price || s.amount || s.fee || 0,
          }));
          setServices(mapped);
        }
      } catch (err) {
        // use fallback if API not ready
        console.warn("Using fallback services, /services not available.");
        setServices(FALLBACK_SERVICES);
      } finally {
        if (mounted) setLoadingServices(false);
      }
    };

    fetchDoctors();
    fetchServices();

    return () => {
      mounted = false;
    };
  }, []);

  // filter doctors by selected clinic
  const filteredDoctors = form.clinic
    ? doctors.filter((d) => d.clinic === form.clinic)
    : doctors;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
  };

  // compute current selected services + total
  const selectedServiceDetails = selectedServices
    .map((id) => services.find((s) => s.id === id))
    .filter(Boolean);

  const totalAmount = selectedServiceDetails.reduce(
    (sum, s) => sum + (s.price || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.clinic || !form.doctor || !form.date) {
  alert("Please fill all required fields (*)");
  return;
    }
    if (!selectedSlot) {
      alert("Please select an available time slot.");
      return;
    }
    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    setSubmitting(true);
    try {
      const servicesNames = selectedServiceDetails
        .map((s) => s.name)
        .join(", ");

      const servicesDetailText = selectedServiceDetails
        .map((s) => `${s.name} - $${s.price || 0}/-`)
        .join(" | ");

      // keep compatible with Admin Appointments table
      const payload = {
        patientName: form.patient,
        doctorName: form.doctor,
        clinic: form.clinic,
        date: form.date,
        time: selectedSlot,
        services: servicesNames,
        status: form.status,
        servicesDetail: servicesDetailText,
        charges: totalAmount,
        paymentMode: "Manual", // or "Online" in future
        createdAt: new Date(),
      };

      const res = await axios.post(`${API_BASE}/appointments`, payload);
      if (res.data && (res.data.message || res.data.data)) {
        alert("Appointment booked successfully!");
        navigate("/patient/appointments");
      } else {
        alert("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PatientLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold text-primary mb-1">Appointment</h4>
            <span className="badge bg-primary me-2">UPCOMING</span>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/patient/appointments")}
          >
            Close form
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* LEFT COLUMN: clinic / doctor / service / date */}
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Select Clinic <span className="text-danger">*</span>
                </label>
                <select
                  name="clinic"
                  className="form-select"
                  value={form.clinic}
                  onChange={(e) => {
                    handleChange(e);
                    // reset doctor when clinic changes
                    setForm((prev) => ({ ...prev, doctor: "" }));
                  }}
                  required
                >
                  <option value="">Select clinic</option>
                  {loadingDoctors ? (
                    <option>Loading clinics…</option>
                  ) : clinics.length === 0 ? (
                    <option>No clinics found</option>
                  ) : (
                    clinics.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Doctor <span className="text-danger">*</span>
                </label>
                <select
                  name="doctor"
                  className="form-select"
                  value={form.doctor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select doctor</option>
                  {loadingDoctors ? (
                    <option>Loading doctors…</option>
                  ) : filteredDoctors.length === 0 ? (
                    <option>No doctors found</option>
                  ) : (
                    filteredDoctors.map((d) => {
                      const label = d.firstName
                        ? `${d.firstName} ${d.lastName || ""} ${
                            d.specialization
                              ? `(${d.specialization})`
                              : ""
                          }`
                        : d.name || d.email;

                      return (
                        <option key={d._id} value={label}>
                          {label}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Service <span className="text-danger">*</span>
                </label>
                <div className="border rounded p-2 d-flex flex-wrap gap-2">
                  {loadingServices ? (
                    <span className="text-muted small">Loading services…</span>
                  ) : services.length === 0 ? (
                    <span className="text-muted small">No services found.</span>
                  ) : (
                    services.map((s) => {
                      const active = selectedServices.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className={
                            active
                              ? "btn btn-sm btn-primary"
                              : "btn btn-sm btn-outline-primary"
                          }
                          onClick={() => toggleService(s.id)}
                        >
                          {s.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Appointment Date <span className="text-danger">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  className="form-control"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* RIGHT COLUMN: slots + service detail + tax */}
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Available Slot <span className="text-danger">*</span>
                </label>
                <div className="border rounded p-3">
                  <div className="text-center mb-2 fw-semibold">Session 1</div>
                  <div className="d-flex flex-wrap gap-2">
                    {DEFAULT_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={
                          selectedSlot === slot
                            ? "btn btn-sm btn-primary"
                            : "btn btn-sm btn-outline-primary"
                        }
                        onClick={() => handleSlotClick(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Service Detail</label>
                <div className="border rounded p-3">
                  {selectedServiceDetails.length === 0 ? (
                    <div className="text-muted small">
                      No service selected yet.
                    </div>
                  ) : (
                    <>
                      <ul className="small mb-2">
                        {selectedServiceDetails.map((s) => (
                          <li key={s.id}>
                            <strong>{s.name}</strong> – ${s.price || 0}/-
                          </li>
                        ))}
                      </ul>
                      <div className="fw-semibold">
                        Total: ₹{totalAmount || 0}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Tax</label>
                <div className="border rounded p-3 text-muted small">
                  No tax found.
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM BUTTONS */}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/patient/appointments")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </PatientLayout>
  );
}
