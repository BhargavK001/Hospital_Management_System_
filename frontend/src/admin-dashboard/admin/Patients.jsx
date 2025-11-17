import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch, FaFileImport, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
import { RiDeleteBinFill } from "react-icons/ri";
import { MdEdit } from "react-icons/md";

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
 
const handleEdit = (id) => {
  alert(`📝 Edit patient with ID: ${id}`);
  // Later you can navigate to `/edit-patient/${id}`
};

const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this patient?")) {
    try {
      await axios.delete(`http://localhost:3001/patients/${id}`);
      alert("🗑️ Patient deleted successfully!");
      window.location.reload();
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
      console.log("✅ Patients fetched:", res.data);
    })
    .catch((err) => console.error("❌ Error fetching patients:", err));
}, []);

  const filteredPatients = patients.filter((p) =>
  `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
);


  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary m-0">Patients List</h4>
        <div>
         

       
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => navigate("/AddPatient")}
          >
            <FaPlus /> Add Patient
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card shadow-sm p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search patient by ID, name, email, or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}

          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="card shadow-sm p-3">
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
  {patients.map((p, index) => (
    <tr key={p._id}>
      <td>{index + 1}</td>
      <td>{p.firstName} {p.lastName}</td>
      <td>{p.clinic}</td>
      <td>{p.email}</td>
      <td>{p.phone}</td>
      <td>{new Date(p.createdAt).toISOString().split("T")[0]}</td>

      {/* ✅ STATUS COLUMN */}
      <td>
        <span
          className={`badge px-3 py-2 ${
            p.isActive ? "bg-success" : "bg-secondary"
          }`}
        >
          {p.isActive ? "Active" : "Inactive"}
        </span>
      </td>

      {/* ✅ ACTION COLUMN */}
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
  ))}
</tbody>


        </table>

        {/* Pagination */}
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
    </AdminLayout>
  );
};

export default Patients;
