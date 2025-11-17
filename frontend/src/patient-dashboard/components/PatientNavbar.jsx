// src/components/PatientNavbar.jsx
import React from "react";
import "../styles/PatientNavbar.css";

export default function PatientNavbar() {
  return (
    <nav className="patient-navbar">
      <div className="left">
        
        <div style={{ width: 36 }} /> 
      </div>

      <div className="right">
        <img
          src={localStorage.getItem("patientAvatar") || "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"}
          className="profile-img"
          alt="user"
        />
        <span className="username">{localStorage.getItem("patientName") || "Patient"}</span>
      </div>
    </nav>
  );
}
