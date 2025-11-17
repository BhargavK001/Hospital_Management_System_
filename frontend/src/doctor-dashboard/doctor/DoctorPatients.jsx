// src/doctor/DoctorPatients.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import DoctorLayout from "../layouts/DoctorLayout";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchPatients = async () => {
      setLoading(true);
      setErr(null);
      try {
        // reuse admin endpoint
        const res = await axios.get("http://localhost:3001/patients");
        if (!mounted) return;
        // expect res.data to be array of patients (adjust if your API wraps data)
        setPatients(Array.isArray(res.data) ? res.data : res.data.data ?? []);
      } catch (error) {
        console.error(error);
        if (mounted) setErr("Failed to load patients");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPatients();
    return () => (mounted = false);
  }, []);

  return (
    <DoctorLayout>
      <div className="container-fluid py-4">
        <h3 className="fw-bold text-primary mb-4">Patients</h3>

        {err && <div className="alert alert-warning">{err}</div>}

        {loading ? (
          <div>Loading patients…</div>
        ) : (
          <div className="card p-3">
            {patients.length === 0 ? (
              <div>No patients found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p._id || p.id}>
                        <td>{p.name || `${p.firstName ?? ""} ${p.lastName ?? ""}`}</td>
                        <td>{p.phone || p.contact || "-"}</td>
                        <td>{p.age ?? p.dob ?? "-"}</td>
                        <td>{p.gender ?? "-"}</td>
                        <td>
                          {/* doctor can view patient details */}
                          <a href={`/doctor/patients/${p._id || p.id}`} className="btn btn-sm btn-outline-primary">
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
