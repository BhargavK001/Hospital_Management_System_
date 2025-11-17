// src/layouts/DoctorLayout.jsx
import React, { useState } from "react";
import DoctorSidebar from "../components/DoctorSidebar";
import DoctorNavbar from "../components/DoctorNavbar";
import "../styles/DoctorLayout.css";

export default function DoctorLayout({ children }) {
  const [open, setOpen] = useState(true); 

  return (
    <div className="doctor-layout">
      <DoctorSidebar open={open} />
      <div className={open ? "doctor-main open" : "doctor-main closed"}>
        <DoctorNavbar onToggle={() => setOpen((v) => !v)} open={open} />
        <div className="doctor-content">{children}</div>
      </div>
    </div>
  );
}
