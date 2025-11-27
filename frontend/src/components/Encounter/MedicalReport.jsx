import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlus, FaTimes, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import "../../admin-dashboard/styles/services.css";

export default function MedicalReport({ role }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicalReports, setMedicalReports] = useState([]);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [reportData, setReportData] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0],
    file: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEncounterDetails();
  }, [id]);

  const fetchEncounterDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/encounters`);
      const found = res.data.find(e => e._id === id);
      if (found) {
        setMedicalReports(found.medicalReports || []);
      }
    } catch (err) {
      console.error("Error fetching encounter details:", err);
      toast.error("Failed to load medical reports");
    } finally {
      setLoading(false);
    }
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setReportData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!reportData.name || !reportData.date) {
        toast.error("Please fill all required fields");
        return;
    }

    if (!editingReportId && !reportData.file) {
        toast.error("Please upload a file");
        return;
    }

    const formData = new FormData();
    formData.append("name", reportData.name);
    formData.append("date", reportData.date);
    if (reportData.file) {
        formData.append("report", reportData.file);
    }

    try {
      let res;
      if (editingReportId) {
         res = await axios.put(`http://localhost:3001/encounters/${id}/reports/${editingReportId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
         });
         toast.success("Report updated successfully");
      } else {
         res = await axios.post(`http://localhost:3001/encounters/${id}/reports`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
         });
         toast.success("Report added successfully");
      }
      
      setMedicalReports(res.data.medicalReports);
      setIsReportFormOpen(false);
      setEditingReportId(null);
      setReportData({ name: "", date: new Date().toISOString().split('T')[0], file: null });
    } catch (err) {
      console.error("Error saving report:", err);
      toast.error("Failed to save report");
    }
  };

  const handleEditReport = (report) => {
    setReportData({
        name: report.name,
        date: new Date(report.date).toISOString().split('T')[0],
        file: null 
    });
    setEditingReportId(report._id);
    setIsReportFormOpen(true);
  };

  const handleCancelReport = () => {
    setIsReportFormOpen(false);
    setEditingReportId(null);
    setReportData({ name: "", date: new Date().toISOString().split('T')[0], file: null });
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await axios.delete(`http://localhost:3001/encounters/${id}/reports/${reportId}`);
      setMedicalReports(res.data.medicalReports);
      toast.success("Report deleted");
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error("Failed to delete report");
    }
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="container-fluid mt-3">
       <div className="services-topbar services-card d-flex justify-content-between align-items-center mb-3">
         <h5 className="fw-bold text-white mb-0">Medical Report</h5>
         <div className="d-flex gap-2">
             {!isReportFormOpen ? (
                <button 
                  className="btn btn-light btn-sm d-flex align-items-center gap-1 text-primary"
                  onClick={() => {
                    setEditingReportId(null);
                    setReportData({ name: "", date: new Date().toISOString().split('T')[0], file: null });
                    setIsReportFormOpen(true);
                  }}
                >
                  <FaPlus /> Add Medical Report
                </button>
             ) : (
                <button 
                  className="btn btn-light btn-sm d-flex align-items-center gap-1 text-danger"
                  onClick={handleCancelReport}
                >
                  <FaTimes /> Close form
                </button>
             )}
              <button 
                className="btn btn-light btn-sm d-flex align-items-center gap-1 text-dark"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
         </div>
       </div>

       <div className="bg-white shadow-sm rounded p-3">
         {isReportFormOpen && (
            <div className="mb-4 p-3 border rounded bg-light fade show">
              <h6 className="fw-bold text-primary mb-3">
                {editingReportId ? "Edit Medical Report" : "Add Medical Report"}
              </h6>
              <form onSubmit={handleSaveReport}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter report name"
                      name="name"
                      value={reportData.name}
                      onChange={handleReportChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">Date <span className="text-danger">*</span></label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="date"
                      value={reportData.date}
                      onChange={handleReportChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">
                        Upload Report {editingReportId ? "" : <span className="text-danger">*</span>}
                    </label>
                    <div className="input-group">
                      <input 
                        type="file" 
                        className="form-control" 
                        onChange={handleFileChange}
                        required={!editingReportId}
                      />
                    </div>
                    {editingReportId && <small className="text-muted">Leave empty to keep existing file</small>}
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                   <button 
                     type="button" 
                     className="btn btn-outline-secondary btn-sm"
                     onClick={handleCancelReport}
                   >
                     Cancel
                   </button>
                   <button type="submit" className="btn btn-primary btn-sm">
                     <FaPlus className="me-1" /> {editingReportId ? "Update" : "Save"}
                   </button>
                </div>
              </form>
            </div>
         )}

         <div className="table-responsive">
           <table className="table align-middle">
             <thead className="table-light">
               <tr>
                 <th className="text-muted small fw-bold text-uppercase">Name</th>
                 <th className="text-muted small fw-bold text-uppercase text-center">Date</th>
                 <th className="text-muted small fw-bold text-uppercase text-center">Action</th>
               </tr>
             </thead>
             <tbody>
               {medicalReports.length === 0 ? (
                 <tr>
                   <td colSpan="3" className="text-center text-danger py-4">No patient report found</td>
                 </tr>
               ) : (
                 medicalReports.map((report, index) => (
                   <tr key={index}>
                     <td className="fw-semibold text-primary">{report.name}</td>
                     <td className="text-center">
                        {new Date(report.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                     </td>
                     <td className="text-center">
                       <div className="d-flex justify-content-center gap-2">
                         <button 
                           className="btn btn-sm btn-outline-primary"
                           onClick={() => handleEditReport(report)}
                         >
                           <FaEdit />
                         </button>
                         <a 
                           href={`http://localhost:3001${report.file}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="btn btn-sm btn-outline-primary"
                         >
                           <FaEye />
                         </a>
                         <button 
                           className="btn btn-sm btn-outline-danger"
                           onClick={() => handleDeleteReport(report._id)}
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
       </div>
    </div>
  );
}
