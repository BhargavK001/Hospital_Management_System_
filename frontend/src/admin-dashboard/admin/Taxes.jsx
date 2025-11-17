// src/admin/Taxes.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/services.css"; // reuse same styles as Services page
import { FaEdit, FaTrash } from "react-icons/fa";

function Taxes({ sidebarCollapsed = false, toggleSidebar }) {
    // TEMP dummy data so we can see the row + action buttons
    const [taxes] = useState([
        {
            _id: "1",
            name: "Kiran patil",
            taxRate: "5.00",
            clinicName: "Valley Clinic",
            doctor: "doctortechnical056",
            serviceName: "All service",
            active: true,
        },
    ]);

    const [searchTerm, setSearchTerm] = useState("");

    const filtered = taxes.filter((t) =>
        (t.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} />

            {/* Right side content */}
            <div
                className="flex-grow-1 main-content-transition"
                style={{
                    marginLeft: sidebarCollapsed ? 64 : 250,
                    minHeight: "100vh",
                }}
            >
                {/* Navbar */}
                <Navbar toggleSidebar={toggleSidebar} />

                <div className="container-fluid mt-3">
                    {/* Blue header bar */}
                    <div className="services-topbar mb-2 services-card">
                        <div style={{ fontWeight: 600 }}>Tax List</div>
                        <div className="services-actions">
                            <button className="btn btn-outline-light btn-sm">
                                <i className="bi bi-upload me-1"></i> Import data
                            </button>
                            <button
                                className="btn btn-light btn-sm"
                                onClick={() => {
                                    // Next step: open Add Tax form here
                                    alert("Next step: show Add Tax form here");
                                }}
                            >
                                <i className="bi bi-plus-lg me-1"></i> New Tax
                            </button>
                        </div>
                    </div>

                    {/* White card with table */}
                    <div className="card services-card">
                        <div className="card-body">
                            {/* Search row */}
                            <div className="d-flex align-items-center mb-2">
                                <div className="search-input me-2" style={{ flex: 1 }}>
                                    <i className="bi bi-search"></i>
                                    <input
                                        className="form-control"
                                        placeholder="Search by Name, Service Name, Tax Rate, Clinic Name, Doctor, Status (:active or :inactive)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="table-responsive">
                                <table className="table table-borderless align-middle">
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid #e9eef6" }}>
                                            <th style={{ width: 36 }}>
                                                <input type="checkbox" />
                                            </th>
                                            <th style={{ width: 70 }}>ID</th>
                                            <th>Name</th>
                                            <th>Tax Rate</th>
                                            <th>Clinic Name</th>
                                            <th>Doctor</th>
                                            <th>Service Name</th>
                                            <th>Status</th>
                                            <th style={{ width: 120 }}>Action</th>
                                        </tr>

                                        {/* Filter row – just UI for now */}
                                        <tr className="table-filter-row">
                                            <th></th>
                                            <th>
                                                <input className="form-control" placeholder="ID" />
                                            </th>
                                            <th>
                                                <input className="form-control" placeholder="Name" />
                                            </th>
                                            <th>
                                                <input className="form-control" placeholder="Tax Rate" />
                                            </th>
                                            <th>
                                                <input className="form-control" placeholder="Filter clinic" />
                                            </th>
                                            <th>
                                                <input className="form-control" placeholder="Filter doctor" />
                                            </th>
                                            <th>
                                                <input className="form-control" placeholder="Filter service" />
                                            </th>
                                            <th>
                                                <select className="form-select">
                                                    <option>Filter by status</option>
                                                    <option>Active</option>
                                                    <option>Inactive</option>
                                                </select>
                                            </th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="text-center text-muted py-4">
                                                    No Data Found
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((t, index) => (
                                                <tr key={t._id}>
                                                    <td>
                                                        <input type="checkbox" />
                                                    </td>
                                                    <td>{index + 1}</td>
                                                    <td>{t.name}</td>
                                                    <td>${t.taxRate}/-</td>
                                                    <td>{t.clinicName}</td>
                                                    <td>{t.doctor}</td>
                                                    <td>{t.serviceName}</td>
                                                    <td>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={!!t.active}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <span className="status-pill">
                                                                {t.active ? "ACTIVE" : "INACTIVE"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: 8 }}>
                                                            <button
                                                                className="icon-btn bg-white"
                                                                title="Edit"
                                                                onClick={() => alert("Edit tax (later)")}
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                className="icon-btn bg-white"
                                                                title="Delete"
                                                                onClick={() => alert("Delete tax (later)")}
                                                            >
                                                                <FaTrash style={{ color: "red" }} />
                                                            </button>
                                                        </div>
                                                    </td>

                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* footer */}
                            <div className="table-footer">
                                <div>
                                    Rows per page:{" "}
                                    <select
                                        className="form-select d-inline-block"
                                        style={{ width: 80, marginLeft: 8 }}
                                    >
                                        <option>10</option>
                                        <option>25</option>
                                        <option>50</option>
                                    </select>
                                </div>

                                <div>
                                    Page{" "}
                                    <input
                                        value={1}
                                        readOnly
                                        style={{ width: 34, textAlign: "center" }}
                                    />{" "}
                                    of 1 &nbsp;
                                    <button className="btn btn-sm btn-outline-secondary ms-2" disabled>
                                        Prev
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary ms-1" disabled>
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Taxes;
