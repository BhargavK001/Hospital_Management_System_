import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaDownload } from "react-icons/fa";
import "../styles/appointments.css";
import toast from "react-hot-toast";

const SLOT_OPTIONS = [
  "09:00 - 09:30 AM",
  "09:30 - 10:00 AM",
  "10:00 - 10:30 AM",
  "11:00 - 11:30 AM",
  "02:00 - 02:30 PM",
  "03:00 - 03:30 PM",
];

const Appointments = ({ sidebarCollapsed = false, toggleSidebar }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // panels
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false); // add/edit panel

  // tabs
  const [tab, setTab] = useState("all"); // all | upcoming | past

  // search
  const [searchTerm, setSearchTerm] = useState("");

  // filters
  const [filters, setFilters] = useState({
    date: "",
    clinic: "",
    patient: "",
    status: "",
    doctor: "",
  });

  // dropdown data
  const [doctors, setDoctors] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [patients, setPatients] = useState([]);

  // add/edit form
  const [form, setForm] = useState({
    clinic: "",
    doctor: "",
    service: "",
    date: "",
    patient: "",
    status: "booked",
    servicesDetail: "",
    slot: "",
  });

  const [editId, setEditId] = useState(null); // null = add, otherwise edit

  // import modal
  const [importOpen, setImportOpen] = useState(false);
  const [importType, setImportType] = useState("csv");
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // ------------------ FETCH APPOINTMENTS ------------------
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (query = {}) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/appointments", {
        params: query,
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------ FETCH DROPDOWN DATA ------------------
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [docRes, servRes, patRes] = await Promise.all([
          axios.get("http://localhost:3001/doctors"),
          axios.get("http://localhost:3001/api/services"),
          axios.get("http://localhost:3001/patients"),
        ]);

        setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
        setServicesList(Array.isArray(servRes.data) ? servRes.data : []);
        setPatients(Array.isArray(patRes.data) ? patRes.data : []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  // close panels when tab changes
  useEffect(() => {
    setFiltersOpen(false);
    setPanelOpen(false);
  }, [tab]);

  // ------------------ FILTERS ------------------
  const applyFilters = () => {
    const q = {};
    if (filters.date) q.date = filters.date;
    if (filters.clinic) q.clinic = filters.clinic;
    if (filters.patient) q.patient = filters.patient;
    if (filters.doctor) q.doctor = filters.doctor;
    if (filters.status) q.status = filters.status;
    fetchAppointments(q);
  };

  const clearFilters = () => {
    setFilters({ date: "", clinic: "", patient: "", status: "", doctor: "" });
    fetchAppointments();
  };

  // ------------------ SEARCH + TAB FILTERING ------------------
  const filteredAppointments = useMemo(() => {
    let list = [...appointments];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tab === "upcoming") {
      list = list.filter(
        (a) => a.date && new Date(a.date).setHours(0, 0, 0, 0) > today
      );
    } else if (tab === "past") {
      list = list.filter(
        (a) => a.date && new Date(a.date).setHours(0, 0, 0, 0) < today
      );
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((a) => {
        return (
          (a.patientName || "").toLowerCase().includes(q) ||
          (a.clinic || "").toLowerCase().includes(q) ||
          (a.doctorName || "").toLowerCase().includes(q) ||
          (a.services || "").toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [appointments, tab, searchTerm]);

  // ------------------ FORM HANDLERS ------------------
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const openAddForm = () => {
    setEditId(null);
    setForm({
      clinic: "",
      doctor: "",
      service: "",
      date: "",
      patient: "",
      status: "booked",
      servicesDetail: "",
      slot: "",
    });
    setPanelOpen(true);
    setFiltersOpen(false);
  };

  const openEditForm = (item) => {
    setEditId(item._id);
    setForm({
      clinic: item.clinic || "",
      doctor: item.doctorName || "",
      service: item.services || "",
      date: item.date ? item.date.substring(0, 10) : "",
      patient: item.patientName || "",
      status: item.status || "booked",
      servicesDetail: item.servicesDetail || "",
      slot: item.slot || "",
    });
    setPanelOpen(true);
    setFiltersOpen(false);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        clinic: form.clinic,
        doctorName: form.doctor,
        patientName: form.patient,
        services: form.service,
        date: form.date,
        status: form.status,
        servicesDetail: form.servicesDetail,
        slot: form.slot,
      };

      if (editId) {
        await toast.promise(
          axios.put(`http://localhost:3001/appointments/${editId}`, payload),
          {
            loading: "Updating appointment...",
            success: "Appointment updated",
            error: "Failed to update appointment",
          }
        );
      } else {
        await toast.promise(
          axios.post("http://localhost:3001/appointments", payload),
          {
            loading: "Saving appointment...",
            success: "Appointment added",
            error: "Failed to add appointment",
          }
        );
      }

      fetchAppointments();
      closePanel();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Error saving appointment. Check console.");
    }
  };

  // ------------------ DELETE / CANCEL / PDF ------------------
  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this?");
    if (!ok) return;
    try {
      await axios.delete(`http://localhost:3001/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting");
    }
  };

  const handlePdf = (id) => {
    window.open(`http://localhost:3001/appointments/${id}/pdf`, "_blank");
  };
  // ------------------ IMPORT MODAL HANDLERS ------------------
  const openImportModal = () => {
    setImportOpen(true);
    setImportFile(null);
    setImportType("csv");
  };

  const closeImportModal = () => {
    if (importing) return;
    setImportOpen(false);
    setImportFile(null);
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0] || null);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      alert("Please choose a CSV file first.");
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("type", importType);

      const res = await axios.post(
        "http://localhost:3001/appointments/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(`Imported ${res.data?.count || 0} appointments`);
      closeImportModal();
      fetchAppointments();
    } catch (err) {
      console.error("Error importing appointments:", err);
      alert("Error importing appointments. Check backend logs.");
    } finally {
      setImporting(false);
    }
  };

  // ------------------ AVAILABLE SLOTS LOGIC ------------------
  const isSunday =
    form.date && !Number.isNaN(new Date(form.date).getTime())
      ? new Date(form.date).getDay() === 0
      : false;

  const showSlots = form.service && form.date && !isSunday; // only show slots if service selected, date selected and not Sunday

  // ------------------ JSX ------------------
  return (
    <div className="d-flex">
      {/* LEFT SIDEBAR */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* MAIN CONTENT */}
      <div
        className="flex-grow-1 main-content-transition"
        style={{
          marginLeft: sidebarCollapsed ? 64 : 250,
          minHeight: "100vh",
        }}
      >
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="container-fluid py-3">
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="text-primary fw-bold mb-1">Appointment</h4>

              <div className="btn-group btn-sm">
                <button
                  className={`btn btn-outline-primary btn-sm ${
                    tab === "all" ? "active" : ""
                  }`}
                  onClick={() => setTab("all")}
                >
                  ALL
                </button>
                <button
                  className={`btn btn-outline-primary btn-sm ${
                    tab === "upcoming" ? "active" : ""
                  }`}
                  onClick={() => setTab("upcoming")}
                >
                  UPCOMING
                </button>
                <button
                  className={`btn btn-outline-primary btn-sm ${
                    tab === "past" ? "active" : ""
                  }`}
                  onClick={() => setTab("past")}
                >
                  PAST
                </button>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={openAddForm}>
                Add Appointment
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setFiltersOpen((s) => !s)}
              >
                Filters
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setImportOpen(true)}
              >
                <FaDownload /> Import Data
              </button>
            </div>
          </div>

          {/* REST OF YOUR FILE REMAINS SAME (filters, tables, modals...) */}
          {/* ---------- YOUR ORIGINAL CONTENT BELOW ---------- */}

          {/* FILTER PANEL */}
          <div className={`filter-panel ${filtersOpen ? "open" : ""}`}>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Select Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.date}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Clinic</label>
                  <input
                    className="form-control"
                    value={filters.clinic}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, clinic: e.target.value }))
                    }
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Patient</label>
                  <input
                    className="form-control"
                    value={filters.patient}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, patient: e.target.value }))
                    }
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Doctor</label>
                  <input
                    className="form-control"
                    value={filters.doctor}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, doctor: e.target.value }))
                    }
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option value="">All</option>
                    <option value="booked">Booked</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 d-flex justify-content-end gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
                >
                  Reset
                </button>
                <button className="btn btn-primary" onClick={applyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* ADD/EDIT PANEL */}
          <div
            className={`form-panel appointments-form ${
              panelOpen ? "open" : ""
            }`}
          >
            <div className="p-3">
              <form onSubmit={handleSave}>
                <h5 className="fw-bold">
                  {editId ? "Edit Appointment" : "Add Appointment"}
                </h5>

                <div className="row g-3 mt-2">
                  {/* LEFT */}
                  <div className="col-md-6">
                    <label className="form-label">Clinic</label>
                    <select
                      name="clinic"
                      className="form-select"
                      value={form.clinic}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      <option value="Valley Clinic">Valley Clinic</option>
                      <option value="City Care">City Care</option>
                    </select>

                    <label className="form-label mt-3">Doctor</label>
                    <select
                      name="doctor"
                      className="form-select"
                      value={form.doctor}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      {doctors.map((d) => (
                        <option
                          key={d._id}
                          value={`${d.firstName} ${d.lastName}`}
                        >
                          {d.firstName} {d.lastName}
                        </option>
                      ))}
                    </select>

                    <label className="form-label mt-3">Service</label>
                    <select
                      name="service"
                      className="form-select"
                      value={form.service}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      {servicesList.map((s) => (
                        <option key={s._id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <label className="form-label mt-3">Appointment Date</label>
                    <input
                      name="date"
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleFormChange}
                    />

                    <label className="form-label mt-3">Patient</label>
                    <select
                      name="patient"
                      className="form-select"
                      value={form.patient}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      {patients.map((p) => (
                        <option
                          key={p._id}
                          value={`${p.firstName} ${p.lastName}`}
                        >
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </select>

                    <label className="form-label mt-3">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={form.status}
                      onChange={handleFormChange}
                    >
                      <option value="booked">Booked</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* RIGHT */}
                  <div className="col-md-6">
                    <label className="form-label">Available Slot</label>
                    <div className="border rounded p-3 mb-3">
                      {!form.service || !form.date ? (
                        <div className="text-muted small">
                          Select service & date
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {SLOT_OPTIONS.map((slot) => (
                            <button
                              type="button"
                              key={slot}
                              className={`btn btn-sm ${
                                form.slot === slot
                                  ? "btn-primary"
                                  : "btn-outline-primary"
                              }`}
                              onClick={() =>
                                setForm((p) => ({ ...p, slot: slot }))
                              }
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="form-label">Service Detail</label>
                    <input
                      name="servicesDetail"
                      className="form-control"
                      placeholder="Type here..."
                      value={form.servicesDetail}
                      onChange={handleFormChange}
                    />

                    <label className="form-label mt-3">Tax</label>
                    <input
                      className="form-control"
                      value="Tax not available"
                      disabled
                    />
                  </div>
                </div>

                <div className="text-end mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closePanel}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary ms-2">
                    {editId ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* MAIN TABLE CARD */}
          <div className="card shadow-sm p-3 mt-3">
            <div className="d-flex justify-content-between mb-3">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: 380 }}
                placeholder="Search by patient, clinic, doctor, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-5">Loading...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No appointments found
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Patient</th>
                      <th>Services</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAppointments.map((a) => (
                      <tr key={a._id}>
                        <td>{a.patientName}</td>
                        <td>{a.services}</td>
                        <td>{a.doctorName}</td>
                        <td>{a.date}</td>
                        <td>
                          <span className={`badge bg-secondary`}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEditForm(a)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => handlePdf(a._id)}
                            >
                              PDF
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(a._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* IMPORT MODAL */}
          {importOpen && (
            <>
              <div className="modal-backdrop fade show" />
              <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title text-primary">
                        Import Appointments
                      </h5>
                      <button
                        className="btn-close"
                        onClick={() => setImportOpen(false)}
                      ></button>
                    </div>

                    <form onSubmit={handleImportSubmit}>
                      <div className="modal-body">
                        <label className="form-label">Upload CSV File</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".csv"
                          onChange={(e) => setImportFile(e.target.files[0])}
                        />
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setImportOpen(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Import
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
