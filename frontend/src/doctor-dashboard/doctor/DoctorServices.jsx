import React, { useEffect, useState } from "react";
import Navbar from "../components/DoctorNavbar"; 
import Sidebar from "../components/DoctorSidebar"; 
import SharedServices from "../../components/Shared/SharedServices";

/* ---------- Main Doctor Services Component ---------- */
export default function DoctorServices({ sidebarCollapsed = false, toggleSidebar }) {
  const [currentDoctor, setCurrentDoctor] = useState({ firstName: "", lastName: "", clinic: "" });

  useEffect(() => {
    const stored = localStorage.getItem("doctor");
    if (stored) {
      setCurrentDoctor(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="d-flex">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-grow-1 main-content-transition" style={{ marginLeft: sidebarCollapsed ? 64 : 250, transition: "margin-left 0.3s ease", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <Navbar toggleSidebar={toggleSidebar} />
        {/* Pass isDoctor=true and the doctor info */}
        <SharedServices isDoctor={true} doctorInfo={currentDoctor} />
      </div>
    </div>
  );
}