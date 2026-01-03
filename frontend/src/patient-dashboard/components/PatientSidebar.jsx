import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaFileInvoice,
  FaChartBar
} from "react-icons/fa";
import logo from "../images/Logo.png";
import "../../shared/styles/ModernUI.css";
import "../styles/PatientSidebar.css";

export default function PatientSidebar({ isOpen = true }) {
  return (
    <aside className={`patient-sidebar modern-sidebar ${isOpen ? "open" : "closed"} d-flex flex-column vh-100`}>
      {/* Logo + Title */}
      <div className="modern-sidebar-logo">
        <img src={logo} alt="Logo" style={{ borderRadius: 10 }} />
        {isOpen && <h4>One Care</h4>}
      </div>

      {/* Menu */}
      <ul className="modern-nav" style={{ overflowY: "auto", flex: 1 }}>
        <li className="modern-nav-item">
          <NavLink
            to="/patient-dashboard"
            className={({ isActive }) => `modern-nav-link ${isActive ? "active" : ""}`}
            end
          >
            <span className="modern-nav-icon"><FaTachometerAlt /></span>
            <span className={`link-text ${isOpen ? "show" : "hide"}`}>Dashboard</span>
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink
            to="/patient/appointments"
            className={({ isActive }) => `modern-nav-link ${isActive ? "active" : ""}`}
          >
            <span className="modern-nav-icon"><FaCalendarAlt /></span>
            <span className={`link-text ${isOpen ? "show" : "hide"}`}>Appointments</span>
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink
            to="/patient/encounters"
            className={({ isActive }) => `modern-nav-link ${isActive ? "active" : ""}`}
          >
            <span className="modern-nav-icon"><FaClipboardList /></span>
            <span className={`link-text ${isOpen ? "show" : "hide"}`}>Encounters</span>
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink
            to="/patient/billing"
            className={({ isActive }) => `modern-nav-link ${isActive ? "active" : ""}`}
          >
            <span className="modern-nav-icon"><FaFileInvoice /></span>
            <span className={`link-text ${isOpen ? "show" : "hide"}`}>Billing Records</span>
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink
            to="/patient/reports"
            className={({ isActive }) => `modern-nav-link ${isActive ? "active" : ""}`}
          >
            <span className="modern-nav-icon"><FaChartBar /></span>
            <span className={`link-text ${isOpen ? "show" : "hide"}`}>Reports</span>
          </NavLink>
        </li>
      </ul>

      {/* Footer */}
      <div className="modern-sidebar-footer">
        {isOpen ? "© 2024 One Care" : "©"}
      </div>
    </aside>
  );
}
