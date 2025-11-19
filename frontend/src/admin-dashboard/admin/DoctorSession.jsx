// src/pages/DoctorSessions.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const DAYS_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || "0", 10);
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const formatRange = (start, end) => {
  if (!start || !end) return "-";
  return `${formatTime(start)} - ${formatTime(end)}`;
};

const DoctorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // search + filters (match screenshot)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterClinic, setFilterClinic] = useState("");
  const [filterDay, setFilterDay] = useState("");

  // rows per page - static UI like your other pages
  const rowsPerPage = 10;

  // form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    doctorId: "",
    doctorName: "",
    clinic: "",
    days: [],
    timeSlotMinutes: 30,
    morningStart: "",
    morningEnd: "",
    eveningStart: "",
    eveningEnd: "",
  });

  // ====== FETCH DATA ======
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/doctor-sessions");
      setSessions(res.data || []);
    } catch (err) {
      console.error("Error fetching doctor sessions:", err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:3001/doctors");
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchDoctors();
  }, []);

  // ====== FORM HANDLERS ======
  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      doctorId: "",
      doctorName: "",
      clinic: "",
      days: [],
      timeSlotMinutes: 30,
      morningStart: "",
      morningEnd: "",
      eveningStart: "",
      eveningEnd: "",
    });
    setFormOpen(true);
  };

  const openEditForm = (session) => {
    setEditingId(session._id);
    setForm({
      doctorId: session.doctorId || "",
      doctorName: session.doctorName || "",
      clinic: session.clinic || "",
      days: session.days || [],
      timeSlotMinutes: session.timeSlotMinutes || 30,
      morningStart: session.morningStart || "",
      morningEnd: session.morningEnd || "",
      eveningStart: session.eveningStart || "",
      eveningEnd: session.eveningEnd || "",
    });
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    const doc = doctors.find((d) => d._id === doctorId);
    setForm((prev) => ({
      ...prev,
      doctorId,
      doctorName: doc ? `${doc.firstName} ${doc.lastName}` : "",
      clinic: doc?.clinic || prev.clinic,
    }));
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.days.includes(day);
      return {
        ...prev,
        days: exists
          ? prev.days.filter((d) => d !== day)
          : [...prev.days, day],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };

      if (payload.doctorId && !payload.doctorName) {
        const doc = doctors.find((d) => d._id === payload.doctorId);
        if (doc) {
          payload.doctorName = `${doc.firstName} ${doc.lastName}`;
        }
      }

      let res;
      if (editingId) {
        res = await axios.put(
          `http://localhost:3001/doctor-sessions/${editingId}`,
          payload
        );
      } else {
        res = await axios.post(
          "http://localhost:3001/doctor-sessions",
          payload
        );
      }

      if (res.data?.message) {
        alert(editingId ? "Doctor session updated" : "Doctor session created");
        closeForm();
        fetchSessions();
      } else {
        alert("Unexpected response from server");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving doctor session. Check console.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this doctor session?")) return;
    try {
      await axios.delete(`http://localhost:3001/doctor-sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting doctor session. Check console.");
    }
  };

  // ====== FILTERED LIST (matches UI filters) ======
  const filteredSessions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return sessions.filter((s) => {
      if (q) {
        const merged =
          `${s.doctorName || ""} ${s.clinic || ""} ${(s.days || []).join(
            ", "
          )}`.toLowerCase();
        if (!merged.includes(q)) return false;
      }

      if (
        filterDoctor &&
        !(s.doctorName || "").toLowerCase().includes(filterDoctor.toLowerCase())
      )
        return false;

      if (
        filterClinic &&
        !(s.clinic || "").toLowerCase().includes(filterClinic.toLowerCase())
      )
        return false;

      if (filterDay && !(s.days || []).includes(filterDay)) return false;

      return true;
    });
  }, [sessions, searchTerm, filterDoctor, filterClinic, filterDay]);

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* BLUE HEADER BAR (like Tax List) */}
        <div className="card shadow-sm mb-3">
          <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
            <h5 className="mb-0">Doctor Sessions</h5>
            <button
              className="btn btn-light btn-sm d-flex align-items-center gap-2"
              onClick={openCreateForm}
            >
              <FaPlus /> Doctor Session
            </button>
          </div>

          {/* SEARCH ROW (top, full width) */}
          <div className="card-body pb-1 pt-3">
            <div className="input-group mb-3">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search table"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* TABLE */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "60px" }}>Sr.</th>
                    <th>Doctor</th>
                    <th>Clinic Name</th>
                    <th>Days</th>
                    <th style={{ width: "100px" }}>Time Slot</th>
                    <th>Morning Session</th>
                    <th>Evening Session</th>
                    <th style={{ width: "110px" }}>Action</th>
                  </tr>
                  {/* FILTER ROW (like screenshot) */}
                  <tr>
                    <th>
                      <input
                        className="form-control form-control-sm"
                        placeholder="ID"
                        disabled
                        style={{ backgroundColor: "#f9fafb" }}
                      />
                    </th>
                    <th>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Filter doctor session by name"
                        value={filterDoctor}
                        onChange={(e) => setFilterDoctor(e.target.value)}
                      />
                    </th>
                    <th>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Filter doctor session by clinic"
                        value={filterClinic}
                        onChange={(e) => setFilterClinic(e.target.value)}
                      />
                    </th>
                    <th>
                      <select
                        className="form-select form-select-sm"
                        value={filterDay}
                        onChange={(e) => setFilterDay(e.target.value)}
                      >
                        <option value="">Filter Days</option>
                        {DAYS_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </th>
                    <th />
                    <th />
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No data for table
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((s, index) => (
                      <tr key={s._id}>
                        <td>{index + 1}</td>
                        <td>{s.doctorName}</td>
                        <td>{s.clinic}</td>
                        <td>{(s.days || []).join(", ")}</td>
                        <td>{s.timeSlotMinutes || 30}</td>
                        <td>{formatRange(s.morningStart, s.morningEnd)}</td>
                        <td>{formatRange(s.eveningStart, s.eveningEnd)}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEditForm(s)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(s._id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER – rows per page, page 1 of 1 (static like your other tables) */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="d-flex align-items-center gap-2">
                <span>Rows per page:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "80px" }}
                  value={rowsPerPage}
                  disabled
                >
                  <option value={10}>10</option>
                </select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span>Page</span>
                <input
                  type="text"
                  className="form-control form-control-sm text-center"
                  style={{ width: "50px" }}
                  value="1"
                  readOnly
                />
                <span>of 1</span>
                <button className="btn btn-sm btn-outline-secondary" disabled>
                  Prev
                </button>
                <button className="btn btn-sm btn-outline-secondary" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL: ADD / EDIT SESSION */}
        {formOpen && (
          <>
            <div className="modal-backdrop fade show" />
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title text-primary">
                      {editingId ? "Edit Doctor Session" : "Add Doctor Session"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeForm}
                    />
                  </div>
                  <form onSubmit={handleSave}>
                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Doctor *</label>
                          <select
                            className="form-select"
                            name="doctorId"
                            value={form.doctorId}
                            onChange={handleDoctorChange}
                            required
                          >
                            <option value="">Select Doctor</option>
                            {doctors.map((d) => (
                              <option key={d._id} value={d._id}>
                                {d.firstName} {d.lastName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Clinic Name *</label>
                          <input
                            className="form-control"
                            name="clinic"
                            value={form.clinic}
                            onChange={handleFormChange}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Days *</label>
                          <div className="d-flex flex-wrap gap-2">
                            {DAYS_OPTIONS.map((d) => (
                              <div
                                key={d}
                                className="form-check form-check-inline"
                              >
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`day-${d}`}
                                  checked={form.days.includes(d)}
                                  onChange={() => toggleDay(d)}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`day-${d}`}
                                >
                                  {d}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">
                            Time Slot (minutes)
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="180"
                            className="form-control"
                            name="timeSlotMinutes"
                            value={form.timeSlotMinutes}
                            onChange={handleFormChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Morning Session</label>
                          <div className="d-flex gap-2">
                            <input
                              type="time"
                              className="form-control"
                              name="morningStart"
                              value={form.morningStart}
                              onChange={handleFormChange}
                            />
                            <span className="align-self-center">to</span>
                            <input
                              type="time"
                              className="form-control"
                              name="morningEnd"
                              value={form.morningEnd}
                              onChange={handleFormChange}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Evening Session</label>
                          <div className="d-flex gap-2">
                            <input
                              type="time"
                              className="form-control"
                              name="eveningStart"
                              value={form.eveningStart}
                              onChange={handleFormChange}
                            />
                            <span className="align-self-center">to</span>
                            <input
                              type="time"
                              className="form-control"
                              name="eveningEnd"
                              value={form.eveningEnd}
                              onChange={handleFormChange}
                            />
                          </div>
                          <small className="text-muted">
                            Leave blank if there is no evening session.
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={closeForm}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default DoctorSessions;
