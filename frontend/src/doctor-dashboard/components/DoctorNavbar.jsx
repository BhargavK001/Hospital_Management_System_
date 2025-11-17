
import React from "react";
import "../styles/DoctorLayout.css"; 
import Docimg from "../images/doctor.png";
export default function DoctorNavbar({ onToggle, open }) {
  return (
    <div className="doctor-navbar">
      <div className="doctor-nav-left">
        <button
          className="doctor-hamburger"
          onClick={onToggle}
          aria-label="toggle sidebar"
        >
          ☰
        </button>
        <div className="doctor-title">One Care Doctor</div>
      </div>

      <div className="doctor-nav-right">
        <div className="doctor-profile">
          <img
            src={Docimg}
            alt="doctor"
            className="doctor-avatar"
          />
          <span className="doctor-name">Doctor</span>
        </div>
      </div>
    </div>
  );
}
