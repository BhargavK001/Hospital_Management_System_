// src/layouts/PatientLayout.jsx
import React from "react";
import PatientSidebar from "../components/PatientSidebar";
import PatientNavbar from "../components/PatientNavbar";
import "../styles/PatientSidebar.css";
import "../styles/PatientNavbar.css";

export default function PatientLayout({ children }) {

  const isOpen = true;

  return (
    <div className="patient-layout d-flex">
      <PatientSidebar isOpen={isOpen} />

      <div className="patient-main" style={{ flex: 1 }}>
        <PatientNavbar />
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
