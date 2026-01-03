// src/admin-dashboard/components/Sidebar.jsx
import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import logo from "../images/Logo.png";
import { IoMdSettings } from "react-icons/io";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaClinicMedical,
  FaUserInjured,
  FaUserMd,
  FaUsers,
  FaListAlt,
  FaCalendarCheck,
  FaMoneyBill,
  FaFileInvoice,
  FaChevronDown
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "../../shared/styles/ModernUI.css";

export default function Sidebar({ collapsed = false }) {
  const expandedWidth = 260;
  const collapsedWidth = 72;
  const [isEncountersOpen, setIsEncountersOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `modern-nav-link ${isActive ? "active" : ""}`;

  return (
    <div
      className="modern-sidebar d-flex flex-column vh-100"
      style={{
        width: collapsed ? collapsedWidth : expandedWidth,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        zIndex: 1000
      }}
    >
      {/* Logo / title */}
      <div className="modern-sidebar-logo">
        <img src={logo} alt="Logo" style={{ borderRadius: 10 }} />
        {!collapsed && <h4>One Care</h4>}
      </div>

      {/* Menu items */}
      <ul className="modern-nav" style={{ overflowY: "auto", flex: 1 }}>
        <li className="modern-nav-item">
          <NavLink to="/admin-dashboard" className={linkClass} end>
            <span className="modern-nav-icon"><FaTachometerAlt /></span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/appointments" className={linkClass}>
            <span className="modern-nav-icon"><FaCalendarAlt /></span>
            {!collapsed && <span>Appointments</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <div
            className={`modern-nav-link modern-nav-toggle ${isEncountersOpen ? 'open' : ''}`}
            onClick={() => setIsEncountersOpen(!isEncountersOpen)}
          >
            <span className="modern-nav-icon"><FaCalendarCheck /></span>
            {!collapsed && (
              <>
                <span>Encounters</span>
                <span className="toggle-icon"><FaChevronDown /></span>
              </>
            )}
          </div>

          {!collapsed && (
            <Collapse in={isEncountersOpen}>
              <ul className="modern-submenu">
                <li className="modern-nav-item">
                  <NavLink to="/encounter-list" className={linkClass}>
                    <span className="modern-nav-icon"><FaListAlt /></span>
                    <span>Encounter List</span>
                  </NavLink>
                </li>
                <li className="modern-nav-item">
                  <NavLink to="/encounter-templates" className={linkClass}>
                    <span className="modern-nav-icon"><FaCalendarAlt /></span>
                    <span>Templates</span>
                  </NavLink>
                </li>
              </ul>
            </Collapse>
          )}
        </li>

        <li className="modern-nav-item">
          <NavLink to="/clinic-list" className={linkClass}>
            <span className="modern-nav-icon"><FaClinicMedical /></span>
            {!collapsed && <span>Clinic</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/patients" className={linkClass}>
            <span className="modern-nav-icon"><FaUserInjured /></span>
            {!collapsed && <span>Patients</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/doctors" className={linkClass}>
            <span className="modern-nav-icon"><FaUserMd /></span>
            {!collapsed && <span>Doctors</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/receptionists" className={linkClass}>
            <span className="modern-nav-icon"><FaUsers /></span>
            {!collapsed && <span>Receptionist</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/services" className={linkClass}>
            <span className="modern-nav-icon"><FaListAlt /></span>
            {!collapsed && <span>Services</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/DoctorSession" className={linkClass}>
            <span className="modern-nav-icon"><FaCalendarCheck /></span>
            {!collapsed && <span>Doctor Sessions</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/taxes" className={linkClass}>
            <span className="modern-nav-icon"><FaMoneyBill /></span>
            {!collapsed && <span>Taxes</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/BillingRecords" className={linkClass}>
            <span className="modern-nav-icon"><FaFileInvoice /></span>
            {!collapsed && <span>Billing Records</span>}
          </NavLink>
        </li>

        <li className="modern-nav-item">
          <NavLink to="/settings" className={linkClass}>
            <span className="modern-nav-icon"><IoMdSettings /></span>
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </li>
      </ul>

      {/* Footer */}
      <div className="modern-sidebar-footer">
        {!collapsed ? "© 2024 One Care" : "©"}
      </div>
    </div>
  );
}
