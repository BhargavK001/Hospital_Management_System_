import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import "bootstrap/dist/css/bootstrap.min.css";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all doctors from MongoDB
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost:3001/doctors");
        setDoctors(res.data);
      } catch (error) {
        console.error(" Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // Delete a doctor
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(`http://localhost:3001/doctors/${id}`);
        setDoctors(doctors.filter((doc) => doc._id !== id));
        alert("Doctor deleted successfully!");
      } catch (error) {
        console.error("❌ Error deleting doctor:", error);
        alert("Error deleting doctor. Check console for details.");
      }
    }
  };

  

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-primary m-0">Doctors List</h4>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => navigate("/AddDoctor")}
          >
            <FaPlus /> Add Doctor
          </button>
        </div>

        {/* Search Bar */}
        <div className="card shadow-sm p-3 mb-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch />
            </span>
            <input
                type="text"
                className="form-control"
                placeholder="Search doctor by name, email, clinic or specialization"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
/>

          </div>
        </div>

        {/* Doctors Table */}
        <div className="card shadow-sm p-3">
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
              {doctors.length > 0 ? (
                doctors
                
                .filter((doctor) => {
    if (!searchTerm) return true;
    const text = searchTerm.toLowerCase();
    return (
      doctor.firstName.toLowerCase().includes(text) ||
      doctor.lastName.toLowerCase().includes(text) ||
      doctor.email.toLowerCase().includes(text) ||
      doctor.clinic.toLowerCase().includes(text) ||
      (doctor.specialization || "").toLowerCase().includes(text)
    );
  })

                .map((doctor, index) => (
                  <tr key={doctor._id}>
                    <td>{index + 1}</td>
                    <td>
                      {doctor.firstName} {doctor.lastName}
                    </td>
                    <td>{doctor.clinic}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.specialization || "—"}</td>
                    <td>
                      <span className={`badge ${doctor.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                            {doctor.status === "Active" ? "Active" : "Inactive"}
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-muted">
                    No doctors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
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
    </AdminLayout>
  );
};

export default Doctors;
