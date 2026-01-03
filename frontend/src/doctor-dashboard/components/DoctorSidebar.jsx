import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import logo from "../images/Logo.png";
import { IoMdSettings } from "react-icons/io";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaCalendarCheck,
  FaUserInjured,
  FaListAlt,
  FaFileInvoice,
  FaChevronDown
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "../../shared/styles/ModernUI.css";
import "../styles/DoctorSidebar.css";

export default function DoctorSidebar({ open = true }) {
  const [isEncountersOpen, setIsEncountersOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `modern-nav-link ${isActive ? "active" : ""}`;

  return (
    <div className={`doctor-sidebar modern-sidebar d-flex flex-column ${!open ? 'closed' : ''}`}>
      {/* Logo */}
      <div className="modern-sidebar-logo">
        <img src={logo} alt="Logo" style={{ borderRadius: 10 }} />
        {open && <h4>One Care</h4>}
      </div>

      <ul className="modern-nav" style={{ overflowY: "auto", flex: 1 }}>
        <li className="modern-nav-item">
          <NavLink to="/doctor-dashboard" className={linkClass} end>
            <span className="modern-nav-icon"><FaTachometerAlt /></span>
            {open && <span>Dashboard</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/doctor/appointments" className={linkClass}>
            <span className="modern-nav-icon"><FaCalendarAlt /></span>
            {open && <span>Appointments</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <div
            className={`modern-nav-link modern-nav-toggle ${isEncountersOpen ? 'open' : ''}`}
            onClick={() => setIsEncountersOpen(!isEncountersOpen)}
          >
            <span className="modern-nav-icon"><FaCalendarCheck /></span>
            {open && (
              <>
                <span>Encounters</span>
                <span className="toggle-icon"><FaChevronDown /></span>
              </>
            )}
          </div>

          {open && (
            <Collapse in={isEncountersOpen}>
              <ul className="modern-submenu">
                <li className="modern-nav-item">
                  <NavLink to="/doctor/encounters" className={linkClass}>
                    <span className="modern-nav-icon"><FaListAlt /></span>
                    <span>Encounter List</span>
                  </NavLink>
                </li>
                <li className="modern-nav-item">
                  <NavLink to="/doctor/encounter-templates" className={linkClass}>
                    <span className="modern-nav-icon"><FaCalendarAlt /></span>
                    <span>Templates</span>
                  </NavLink>
                </li>
              </ul>
            </Collapse>
          )}
        </li>

        <li className="modern-nav-item">
          <NavLink to="/doctor/patients" className={linkClass}>
            <span className="modern-nav-icon"><FaUserInjured /></span>
            {open && <span>Patients</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/doctor/services" className={linkClass}>
            <span className="modern-nav-icon"><FaListAlt /></span>
            {open && <span>Services</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/doctor/billing" className={linkClass}>
            <span className="modern-nav-icon"><FaFileInvoice /></span>
            {open && <span>Billing Records</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/doctor/settings" className={linkClass}>
            <span className="modern-nav-icon"><IoMdSettings /></span>
            {open && <span>Settings</span>}
          </NavLink>
        </li>
      </ul>

      {/* Footer */}
      <div className="modern-sidebar-footer">
        {open ? "© 2024 One Care" : "©"}
      </div>
    </div>
  );
}
