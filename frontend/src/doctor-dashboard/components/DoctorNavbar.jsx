import React, { useState, useRef, useEffect } from "react";
import "../styles/DoctorLayout.css"; 
import { useNavigate } from "react-router-dom";

export default function DoctorNavbar({ onToggle, open }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: "Doctor", avatar: "" });
  const menuRef = useRef();
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const userId = authUser?.id;

  // Fetch doctor profile on mount
  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:3001/doctors/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || "Doctor",
          avatar: data.avatar || "",
        });
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Logout logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  // Get first letter for avatar fallback
  const letter = profileData.name?.trim()?.charAt(0)?.toUpperCase() || "D";

  return (
    <div className="doctor-navbar" ref={menuRef}>
      {/* Left Section */}
      <div className="doctor-nav-left">
        <button
          className="doctor-hamburger"
          onClick={onToggle}
          aria-label="toggle sidebar"
        >
          ☰
        </button>

        <h4 className="text-white fw-bold mb-0">One Care Doctor</h4>
      </div>

      {/* Right Section (Profile + Dropdown) */}
      <div className="doctor-nav-right">
        <div
          className="doctor-profile"
          style={{ cursor: "pointer" }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {profileData.avatar ? (
            <img 
              src={profileData.avatar} 
              alt="doctor" 
              className="doctor-avatar"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className="doctor-avatar"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "600",
                fontSize: "18px",
              }}
            >
              {letter}
            </div>
          )}
          <span className="doctor-name">{profileData.name}</span>
        </div>

        {dropdownOpen && (
          <div
            className="doctor-dropdown shadow"
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
                navigate("/doctor/profile");
                setDropdownOpen(false);
              }}
            >
              <i className="fa fa-user"></i> My Profile
            </button>

            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => {
                navigate("/doctor/change-password");
                setDropdownOpen(false);
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
    </div>
  );
}
