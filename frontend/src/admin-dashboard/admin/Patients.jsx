import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/services.css"; // using the Services layout styling
import { FaSearch, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { RiDeleteBinFill } from "react-icons/ri";
import { MdEdit } from "react-icons/md";

const Patients = ({ sidebarCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const handleEdit = (id) => {
    alert(`📝 Edit patient with ID: ${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await axios.delete(`http://localhost:3001/patients/${id}`);
        alert("🗑️ Patient deleted successfully!");
        setPatients((prev) => prev.filter((p) => p._id !== id));
      } catch (error) {
        console.error("Error deleting patient:", error);
        alert("❌ Failed to delete patient.");
      }
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/patients")
      .then((res) => {
        setPatients(res.data);
      })
      .catch((err) => console.error("❌ Error fetching patients:", err));
  }, []);

  const filteredPatients = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* SIDEBAR */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* MAIN CONTENT */}
      <div
        className="main-content-transition"
        style={{
          marginLeft: sidebarCollapsed ? "64px" : "250px",
          minHeight: "100vh",
          background: "#f5f6fa",
        }}
      >
        {/* NAVBAR */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* PAGE CONTENT */}
        <div className="container-fluid mt-3">
          {/* TOP BLUE BAR */}
          <div className="services-topbar services-card d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-white mb-0">Patients List</h5>

            <button
              className="btn btn-light btn-sm d-flex align-items-center gap-2"
              onClick={() => navigate("/AddPatient")}
            >
              <FaPlus /> Add Patient
            </button>
          </div>

          {/* SEARCH CARD */}
          <div className="card p-3 mt-3 services-card">
            <div className="input-group" style={{ maxWidth: 400 }}>
              <span className="input-group-text bg-white border-end-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search patient by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* PATIENT TABLE */}
          <div className="card p-3 mt-3 services-card">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Clinic</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Registered On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p, index) => (
                    <tr key={p._id}>
                      <td>{index + 1}</td>
                      <td>
                        {p.firstName} {p.lastName}
                      </td>
                      <td>{p.clinic}</td>
                      <td>{p.email}</td>
                      <td>{p.phone}</td>
                      <td>{new Date(p.createdAt).toISOString().split("T")[0]}</td>
                      <td>
                        <span
                          className={`badge px-3 py-2 ${
                            p.isActive ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(p._id)}
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(p._id)}
                          >
                            <RiDeleteBinFill />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* SIMPLE PAGINATION MOCKUP */}
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
      </div>
    </div>
  );
};

export default Patients;
