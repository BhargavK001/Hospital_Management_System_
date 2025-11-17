// src/doctor/DoctorAppointments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorLayout from "../layouts/DoctorLayout";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setErr(null);
      try {
        // reuse admin endpoint (adjust if admin uses different path)
        const res = await axios.get("http://localhost:3001/appointments");
        if (!mounted) return;
        setAppointments(Array.isArray(res.data) ? res.data : res.data.data ?? []);
      } catch (error) {
        console.error(error);
        if (mounted) setErr("Failed to load appointments");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  return (
    <DoctorLayout>
      <div className="container-fluid py-4">
        <h3 className="fw-bold text-primary mb-4">Appointments</h3>

        {err && <div className="alert alert-warning">{err}</div>}

        {loading ? (
          <div>Loading appointments…</div>
        ) : (
          <div className="card p-3">
            {appointments.length === 0 ? (
              <div>No appointments found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a._id || a.id}>
                        <td>{a.patientName || a.patient?.name || "-"}</td>
                        <td>{new Date(a.date).toLocaleDateString()}</td>
                        <td>{a.time || a.slot || "-"}</td>
                        <td>{a.serviceName || a.service || "-"}</td>
                        <td>{a.status || "scheduled"}</td>
                        <td>
                          <a href={`/doctor/appointments/${a._id || a.id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
