import React, { useState, useRef, useEffect } from "react";
import "../styles/PatientNavbar.css";
import { useNavigate } from "react-router-dom";

export default function PatientNavbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const avatar =
    localStorage.getItem("patientAvatar") ||
    "frontend\src\patient-dashboard\images\Patient.png";

  const name = localStorage.getItem("patientName") || "Patient";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("patientName");
    localStorage.removeItem("patientAvatar");
    navigate("/");
  };

  return (
    <nav className="patient-navbar" ref={menuRef}>
      <div className="left">
        <div style={{ width: 36 }} /> 
      </div>

      <div className="right">
        {/* Profile trigger */}
        <div
          className="patient-profile"
          onClick={() => setOpen(!open)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <img src={avatar} className="profile-img" alt="user" />
          <span className="username">{name}</span>
        </div>

        {/* Dropdown */}
        {open && (
          <div
            className="patient-dropdown shadow"
            style={{
              position: "absolute",
              top: "60px",
              right: "20px",
              background: "white",
              borderRadius: "8px",
              width: "180px",
              zIndex: 1000,
            }}
          >
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => {
                navigate("/patient/profile");
                setOpen(false);
              }}
            >
              <i className="fa fa-user"></i> My Profile
            </button>

            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => {
                navigate("/patient/change-password");
                setOpen(false);
              }}
            >
              <i className="fa fa-lock"></i> Change Password
            </button>

            <button
              className="dropdown-item text-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              <i className="fa fa-sign-out-alt"></i> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
