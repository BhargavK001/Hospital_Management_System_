import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FaSearch, FaPlus, FaTrash, FaEdit, FaFilePdf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BASE = "http://localhost:3001";

/* ---------- SCOPED CSS ---------- */
const billingStyles = `
  .billing-scope { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f7fb; }
  .billing-scope .main-content { min-height: 100vh; transition: margin-left 0.3s; }
  
  /* --- Top Bar --- */
  .billing-scope .page-title-bar {
    background-color: #fff;
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
  }
  .billing-scope .page-title {
    color: #333;
    font-weight: 700;
    font-size: 1.2rem;
    margin: 0;
  }

  /* --- Main Card --- */
  .billing-scope .table-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin: 20px 30px;
    padding: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  }

  /* --- Search Container --- */
  .billing-scope .search-container {
    margin-bottom: 20px;
  }
  .billing-scope .search-input-group {
    border: 1px solid #dee2e6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #fff;
    max-width: 100%;
  }
  .billing-scope .search-input {
    border: none;
    margin-left: 10px;
    width: 100%;
    outline: none;
    color: #495057;
    font-size: 0.95rem;
  }

  /* --- Table Structure --- */
  .billing-scope .table-responsive {
    overflow-x: auto;
  }
  .billing-scope .custom-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    color: #212529;
    min-width: 1200px; /* Ensure table doesn't squish on small screens */
  }

  /* Table Headers */
  .billing-scope .custom-table thead th {
    font-weight: 700;
    border-bottom: 2px solid #dee2e6;
    padding: 12px 10px;
    text-align: left;
    white-space: nowrap; /* Prevent wrapping */
    vertical-align: middle;
    color: #000;
  }

  /* Table Body */
  .billing-scope .custom-table tbody td {
    padding: 12px 10px;
    border-bottom: 1px solid #dee2e6;
    vertical-align: middle;
    color: #444;
  }

  /* Filter Inputs */
  .billing-scope .filter-row td {
    padding: 5px 10px;
    background-color: #fff;
    border-bottom: 1px solid #dee2e6;
  }
  .billing-scope .filter-input {
    width: 100%;
    padding: 6px 10px;
    font-size: 0.85rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    outline: none;
    transition: border-color 0.15s;
  }
  .billing-scope .filter-input:focus {
    border-color: #86b7fe;
  }

  /* Badges & IDs */
  .billing-scope .enc-badge {
    color: #0d6efd;
    background-color: #f0f9ff;
    border: 1px solid #cce5ff;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.8rem;
    font-family: monospace;
  }

  .billing-scope .badge-status {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    display: inline-block;
  }
  .billing-scope .status-paid { background-color: #d1e7dd; color: #0f5132; }
  .billing-scope .status-unpaid { background-color: #f8d7da; color: #dc3545; }
  .billing-scope .status-partial { background-color: #fff3cd; color: #664d03; }

  /* Actions */
  .billing-scope .action-group {
    display: flex;
    align-items: center;
    justify-content: flex-end; /* Align actions to right */
    gap: 8px;
  }
  .billing-scope .btn-icon {
    border: none;
    background: transparent;
    padding: 4px;
    cursor: pointer;
    transition: transform 0.1s;
  }
  .billing-scope .btn-icon:hover { transform: scale(1.1); }
  .billing-scope .text-edit { color: #0d6efd; }
  .billing-scope .text-delete { color: #dc3545; }
  .billing-scope .pdf-link { 
    color: #198754; 
    text-decoration: none; 
    font-weight: 600; 
    font-size: 0.85rem; 
    display: flex; 
    align-items: center; 
    gap: 3px; 
  }

  /* Footer */
  .billing-scope .table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    color: #6c757d;
    font-size: 0.9rem;
  }
  .billing-scope .rows-selector {
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 4px 8px;
    margin-left: 5px;
    outline: none;
  }
  .billing-scope .pagination-btn {
    border: none;
    background: none;
    color: #6c757d;
    cursor: pointer;
    font-weight: 500;
    margin-left: 15px;
  }
  .billing-scope .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function BillingRecords({ sidebarCollapsed = false, toggleSidebar }) {
  const navigate = useNavigate();

  // Data
  const [bills, setBills] = useState([]);
  const [encountersList, setEncountersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [filter, setFilter] = useState({
    id: "",
    encounterId: "",
    doctor: "",
    clinic: "",
    patient: "",
    date: "",
    status: "",
  });

  // --- FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [billsRes, encRes] = await Promise.all([
          axios.get(`${BASE}/bills`),
          axios.get(`${BASE}/encounters`),
        ]);
        setBills(billsRes.data || []);
        setEncountersList(Array.isArray(encRes.data) ? encRes.data : encRes.data.encounters || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load records.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await axios.delete(`${BASE}/bills/${id}`);
      setBills((p) => p.filter((b) => b._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  // --- HELPERS ---
  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const lookupCustomId = (bill) => {
    if (bill.encounterId && bill.encounterId.startsWith("ENC-")) return bill.encounterId;
    const mongoId = bill.encounterId || bill.encounter_id || bill.encounter;
    if (!mongoId) return "-";
    const found = encountersList.find((e) => e._id === mongoId);
    return (found && found.encounterId) ? found.encounterId : (typeof mongoId === "string" ? mongoId.substring(0, 8) + "..." : "-");
  };

  // --- FILTER LOGIC ---
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return bills.filter((bill) => {
      const customEncId = lookupCustomId(bill);
      const combined = `${bill._id} ${customEncId} ${bill.doctorName} ${bill.clinicName} ${bill.patientName} ${bill.status}`.toLowerCase();
      
      if (q && !combined.includes(q)) return false;

      // Column Filters
      if (filter.id && !bill._id?.toLowerCase().includes(filter.id.toLowerCase())) return false;
      if (filter.encounterId && !customEncId.toLowerCase().includes(filter.encounterId.toLowerCase())) return false;
      if (filter.doctor && !bill.doctorName?.toLowerCase().includes(filter.doctor.toLowerCase())) return false;
      if (filter.clinic && !bill.clinicName?.toLowerCase().includes(filter.clinic.toLowerCase())) return false;
      if (filter.patient && !bill.patientName?.toLowerCase().includes(filter.patient.toLowerCase())) return false;
      if (filter.date && bill.date !== filter.date) return false;
      if (filter.status && filter.status !== "Filter" && bill.status?.toLowerCase() !== filter.status.toLowerCase()) return false;

      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [bills, encountersList, searchTerm, filter]);

  // --- PAGINATION ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="d-flex billing-scope">
      <style>{billingStyles}</style>
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="flex-grow-1 main-content" style={{ marginLeft: sidebarCollapsed ? 64 : 250 }}>
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="page-title-bar">
          <h5 className="page-title">Billing Records</h5>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => navigate("/AddBill")}>
            <FaPlus /> Add Bill
          </button>
        </div>

        <div className="table-card">
          {/* Global Search */}
          <div className="search-container">
            <div className="search-input-group">
              <FaSearch className="text-muted" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search bills data..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                {/* Header Titles */}
                <tr>
                  <th style={{width: '50px'}}>ID</th>
                  <th>Encounter ID</th>
                  <th>Doctor Name</th>
                  <th>Clinic Name</th>
                  <th>Patient Name</th>
                  <th>Services</th>
                  <th>Total</th>
                  <th style={{textAlign: 'center'}}>Discount</th>
                  <th style={{textAlign: 'center'}}>Amount due</th>
                  <th style={{textAlign: 'center'}}>Date</th>
                  <th style={{textAlign: 'center'}}>Status</th>
                  <th style={{textAlign: 'center'}}>Action</th>
                </tr>
                {/* Header Filters - Matched to Screenshot */}
                <tr className="filter-row">
                  <td><input className="filter-input" placeholder="ID" style={{width: '40px'}} onChange={(e) => handleFilterChange("id", e.target.value)}/></td>
                  <td><input className="filter-input" placeholder="Enc ID" onChange={(e) => handleFilterChange("encounterId", e.target.value)}/></td>
                  <td><input className="filter-input" placeholder="Doctor" onChange={(e) => handleFilterChange("doctor", e.target.value)}/></td>
                  <td><input className="filter-input" placeholder="Clinic" onChange={(e) => handleFilterChange("clinic", e.target.value)}/></td>
                  <td><input className="filter-input" placeholder="Patient" onChange={(e) => handleFilterChange("patient", e.target.value)}/></td>
                  {/* Empty cells for columns that don't need filtering as per image */}
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td> 
                  <td>
                    <input type="date" className="filter-input" style={{width: '130px'}} onChange={(e) => handleFilterChange("date", e.target.value)}/>
                  </td>
                  <td>
                    <select className="filter-input" onChange={(e) => handleFilterChange("status", e.target.value)}>
                      <option value="">Filter</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="12" className="text-center py-5">Loading...</td></tr>
                ) : pageItems.length === 0 ? (
                  <tr><td colSpan="12" className="text-center py-5 text-muted">No records found</td></tr>
                ) : (
                  pageItems.map((bill, i) => (
                    <tr key={bill._id || i}>
                      {/* 1. Sequential ID */}
                      <td style={{fontWeight: 'bold', color: '#6c757d'}}>
                        {(page - 1) * rowsPerPage + i + 1}
                      </td>
                      
                      {/* 2. Encounter ID */}
                      <td>
                        <span className="enc-badge">{lookupCustomId(bill)}</span>
                      </td>

                      <td>{bill.doctorName}</td>
                      <td >{bill.clinicName}</td>
                      <td>{bill.patientName}</td>
                      <td style={{textAlign: 'center'}}>{Array.isArray(bill.services) ? bill.services[0] : (bill.services || "-")}</td>
                      
                      {/* Numbers Right Aligned */}
                      <td style={{textAlign: 'center'}}>{bill.totalAmount}</td>
                      <td style={{textAlign: 'center'}}>{bill.discount}</td>
                      <td style={{textAlign: 'center'}}>{bill.amountDue}</td>
                      
                      <td style={{textAlign: 'center'}}>{bill.date ? new Date(bill.date).toLocaleDateString() : "-"}</td>
                      
                      <td style={{textAlign: 'center'}}>
                        <span className={bill.status === 'paid' ? "badge-status status-paid" : "badge-status status-unpaid"}>
                          {bill.status.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div className="action-group">
                          <button className="btn-icon text-edit" onClick={() => navigate(`/EditBill/${bill._id}`)}>
                            <FaEdit size={16}/>
                          </button>
                          <button className="btn-icon text-delete" onClick={() => handleDelete(bill._id)}>
                            <FaTrash size={14}/>
                          </button>
                          <a href={`${BASE}/bills/${bill._id}/pdf`} target="_blank" rel="noopener noreferrer" className="pdf-link">
                            <FaFilePdf /> PDF
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="d-flex align-items-center">
              Rows per page: 
              <select className="rows-selector" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <span className="me-3">Page {page} of {totalPages}</span>
              <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>

        </div>
        <div className="px-4 text-muted small">© Western State Pain Institute</div>
      </div>
    </div>
  );
}