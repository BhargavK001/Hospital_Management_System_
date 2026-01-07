// src/doctor-dashboard/doctor/DoctorAppointmentDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DoctorLayout from "../layouts/DoctorLayout";
import API_BASE from "../../config";

export default function DoctorAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppt = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${API_BASE}/appointments/${id}`);
        setAppointment(res.data);
      } catch (err) {
        console.error("Failed to load appointment", err);
        if (err.response?.status === 404) {
          setError("Appointment not found (maybe deleted).");
        } else {
          setError("Failed to load appointment details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAppt();
  }, [id]);

  if (loading) {
    return (
      <DoctorLayout>
        <div className="p-4">Loading appointment…</div>
      </DoctorLayout>
    );
  }

  if (error || !appointment) {
    return (
      <DoctorLayout>
        <div className="p-4">
          <p className="text-danger mb-3">{error || "Appointment not found"}</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </DoctorLayout>
    );
  }

  const a = appointment;
  const getPatientInfo = () => {
    if (a._patientInfo) return a._patientInfo;
    if (a.patientId && typeof a.patientId === 'object') {
      return {
        name: `${a.patientId.firstName || ''} ${a.patientId.lastName || ''}`.trim() || a.patientId.name,
        email: a.patientId.email,
        phone: a.patientId.phone || a.patientId.mobile
      };
    }

    // 3. Fallback to root level fields
    return {
      name: a.patientName,
      email: a.patientEmail,
      phone: a.patientPhone
    };
  };

  const patient = getPatientInfo();

  return (
    <DoctorLayout>
      <div className="container py-4">
        <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>
          ← Back to calendar
        </button>

        <h3 className="mb-4">Appointment Details</h3>

        {/* Patient info card */}
        <div className="card p-3 mb-3 shadow-sm border-0">
          <h5 className="mb-3 border-bottom pb-2 text-primary">Patient Information</h5>
          <div className="row g-2">
            <div className="col-md-4">
              <p className="mb-1 text-muted small">Name</p>
              <p className="fw-medium">{patient.name || "N/A"}</p>
            </div>
            <div className="col-md-4">
              <p className="mb-1 text-muted small">Email</p>
              <p className="fw-medium">{patient.email || "N/A"}</p>
            </div>
            <div className="col-md-4">
              <p className="mb-1 text-muted small">Phone</p>
              <p className="fw-medium">{patient.phone || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Appointment info card */}
        <div className="card p-3 mb-3 shadow-sm border-0">
          <h5 className="mb-3 border-bottom pb-2 text-primary">Appointment Details</h5>
          
          <div className="row g-3">
            <div className="col-md-6">
                <p className="mb-1 text-muted small">Doctor</p>
                <strong>{a.doctorName || "N/A"}</strong>
            </div>
            <div className="col-md-6">
                <p className="mb-1 text-muted small">Clinic</p>
                <strong>{a.clinic || "N/A"}</strong>
            </div>
            <div className="col-md-6">
                <p className="mb-1 text-muted small">Date</p>
                <strong>{a.date ? new Date(a.date).toLocaleDateString("en-GB") : "N/A"}</strong>
            </div>
            <div className="col-md-6">
                <p className="mb-1 text-muted small">Time</p>
                <strong>{a.time || "N/A"}</strong>
            </div>
            <div className="col-md-6">
                <p className="mb-1 text-muted small">Service</p>
                <strong>{a.serviceName || a.service || "Appointment"}</strong>
            </div>
            <div className="col-md-6">
                <p className="mb-1 text-muted small">Status</p>
                <span className={`badge ${a.status === 'booked' ? 'bg-primary' : 'bg-secondary'}`}>
                    {a.status || "Scheduled"}
                </span>
            </div>
            
            {/* 🆕 Appointment Mode */}
            {a.appointmentMode && (
              <div className="col-12">
                <p className="mb-1 text-muted small">Mode</p>
                <div className="p-3 rounded" style={{ 
                  background: a.appointmentMode === 'online' ? '#e7f5ff' : '#f8f9fa',
                  border: `1px solid ${a.appointmentMode === 'online' ? '#74c0fc' : '#dee2e6'}`
                }}>
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <span className={`badge ${a.appointmentMode === 'online' ? 'bg-info' : 'bg-secondary'} me-2`}>
                        {a.appointmentMode === 'online' ? '🖥️ Online' : '🏥 In-Clinic'}
                      </span>
                      {a.onlinePlatform && (
                        <span className="small text-muted">
                          via {a.onlinePlatform === 'google_meet' ? 'Google Meet' : 'Zoom'}
                        </span>
                      )}
                    </div>
                    {a.meetingLink && (
                      <div className="d-flex gap-2">
                        <a href={a.meetingLink} target="_blank" rel="noopener noreferrer" 
                           className="btn btn-primary btn-sm">
                          📹 Join Meeting
                        </a>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => { navigator.clipboard.writeText(a.meetingLink); alert('Link copied!'); }}
                        >
                          📋 Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="col-12">
                <p className="mb-1 text-muted small">Notes</p>
                <div className="p-2 bg-light rounded">
                    {a.notes || "No additional notes."}
                </div>
            </div>

          </div>
        </div>

      </div>
    </DoctorLayout>
  );
}