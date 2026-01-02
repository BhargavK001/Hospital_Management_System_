import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SharedServices from "../../components/Shared/SharedServices";

/* ---------- Main Services Component ---------- */
export default function Services({ sidebarCollapsed = false, toggleSidebar }) {
  return (
    <div className="d-flex">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-grow-1 main-content-transition" style={{ marginLeft: sidebarCollapsed ? 64 : 250, transition: "margin-left 0.3s ease", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <Navbar toggleSidebar={toggleSidebar} />
        <SharedServices isDoctor={false} />
      </div>
    </div>
  );
}