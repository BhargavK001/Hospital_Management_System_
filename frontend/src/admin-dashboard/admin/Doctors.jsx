import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FaSearch, FaPlus, FaTrash, FaEdit, FaDownload, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/services.css";

const Doctors = ({ sidebarCollapsed, toggleSidebar }) => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Import modal
  const [importOpen, setImportOpen] = useState(false);
  const [importType, setImportType] = useState("csv");
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:3001/doctors");
      setDoctors(res.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Delete doctor
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(`http://localhost:3001/doctors/${id}`);
        setDoctors((prev) => prev.filter((doc) => doc._id !== id));
        alert("Doctor deleted successfully!");
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("Error deleting doctor");
      }
    }
  };

  // Resend Credentials
  const handleResendCredentials = async (id) => {
    if (window.confirm("Resend login credentials to this doctor? This will reset their password.")) {
      try {
        await axios.post(`http://localhost:3001/doctors/${id}/resend-credentials`);
        alert("Credentials resent successfully!");
      } catch (error) {
        console.error("Error resending credentials:", error);
        alert("Failed to resend credentials.");
      }
    }
  };

  // Import modal handlers
  const openImportModal = () => {
    setImportOpen(true);
    setImportFile(null);
  };

  const closeImportModal = () => {
    if (!importing) setImportOpen(false);
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0] || null);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return alert("Select a CSV file");

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("type", importType);

      const res = await axios.post(
        "http://localhost:3001/doctors/import",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(`Imported ${res.data?.count || 0} doctors`);
      setImportOpen(false);
      fetchDoctors();
    } catch (err) {
      console.error(err);
      alert("Error importing doctors");
    } finally {
      setImporting(false);
    }
  };

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const text = searchTerm.toLowerCase();
    return (
      (doc.firstName || "").toLowerCase().includes(text) ||
      (doc.lastName || "").toLowerCase().includes(text) ||
      (doc.email || "").toLowerCase().includes(text) ||
      (doc.clinic || "").toLowerCase().includes(text) ||
      (doc.specialization || "").toLowerCase().includes(text)
    );
  });

  return (
    <div>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main container */}
      <div
        className="main-content-transition"
        style={{
          marginLeft: sidebarCollapsed ? "64px" : "250px",
          minHeight: "100vh",
          background: "#f5f6fa",
        }}
      >
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* PAGE CONTENT */}
        <div className="container-fluid mt-3">

          {/* TOP BLUE HEADER */}
          <div className="services-topbar services-card d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-white mb-0">Doctors List</h5>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                onClick={openImportModal}
              >
                <FaDownload /> Import Doctors
              </button>

              <button
                className="btn btn-light btn-sm d-flex align-items-center gap-2"
                onClick={() => navigate("/AddDoctor")}
              >
                <FaPlus /> Add Doctor
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="card p-3 mt-3 services-card">
            <div className="input-group" style={{ maxWidth: 400 }}>
              <span className="input-group-text bg-white border-end-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search doctor by name, email, clinic or specialization"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* DOCTORS TABLE */}
          <div className="card p-3 mt-3 services-card">
            <table className="table table-hover align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Clinic</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor, index) => (
                    <tr key={doctor._id}>
                      <td>{index + 1}</td>
                      <td>{doctor.firstName} {doctor.lastName}</td>
                      <td>{doctor.clinic}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.specialization || "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            doctor.status === "Active" ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {doctor.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-sm btn-outline-primary">
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(doctor._id)}
                          >
                            <FaTrash />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            title="Resend Credentials"
                            onClick={() => handleResendCredentials(doctor._id)}
                          >
                            <FaEnvelope />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-muted py-3">
                      No doctors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span>Rows per page: 10</span>
              <nav>
                <ul className="pagination pagination-sm m-0">
                  <li className="page-item disabled">
                    <button className="page-link">Prev</button>
                  </li>
                  <li className="page-item active">
                    <button className="page-link">1</button>
                  </li>
                  <li className="page-item disabled">
                    <button className="page-link">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* IMPORT MODAL */}
        {importOpen && (
          <>
            <div className="modal-backdrop fade show" />

            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5 className="modal-title text-primary">Doctors Import</h5>
                    <button className="btn-close" onClick={closeImportModal}></button>
                  </div>

                  <form onSubmit={handleImportSubmit}>
                    <div className="modal-body">

                      <div className="row g-3 mb-3">
                        <div className="col-md-4">
                          <label className="form-label">Select Type</label>
                          <select
                            className="form-select"
                            value={importType}
                            onChange={(e) => setImportType(e.target.value)}
                          >
                            <option value="csv">CSV</option>
                          </select>
                        </div>

                        <div className="col-md-8">
                          <label className="form-label">Upload CSV File</label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".csv"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>

                      <p className="fw-semibold mb-2">CSV Required Fields:</p>
                      <ul className="small mb-0">
                        <li>firstName</li>
                        <li>lastName</li>
                        <li>clinic</li>
                        <li>email</li>
                        <li>phone</li>
                        <li>dob</li>
                        <li>specialization</li>
                        <li>gender</li>
                        <li>status</li>
                      </ul>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={closeImportModal}
                        disabled={importing}
                      >
                        Cancel
                      </button>

                      <button type="submit" className="btn btn-primary" disabled={importing}>
                        {importing ? "Saving…" : "Save"}
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
  );
};

export default Doctors;
