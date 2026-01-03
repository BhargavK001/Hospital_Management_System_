import React, { useState, useRef, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/AdminNavbar.css";
import { useNavigate } from "react-router-dom";
import API_BASE from "../../config";

const Navbar = ({ toggleSidebar }) => {
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: "Admin", avatar: "" });
  const menuRef = useRef();
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const userId = authUser?.id;

  // Fetch admin profile on mount
  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      // Fallback to authUser name if no userId
      setProfileData({
        name: authUser?.name || "System Admin",
        avatar: ""
      });
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || "Admin",
          avatar: data.avatar || "",
        });
      }
    } catch (err) {
      console.error("Error fetching admin profile:", err);
    }
  };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  // Get first letter for avatar fallback
  const letter = profileData.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  return (
    <nav className="navbar navbar-dark bg-primary px-3 d-flex justify-content-between align-items-center">
      {/* left */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-outline-light border-0"
          onClick={toggleSidebar}
        >
          <FaBars size={22} />
        </button>
        <h4 className="text-white fw-bold mb-0">One Care Admin</h4>
      </div>

      {/* right (profile + dropdown) */}
      <div className="position-relative" ref={menuRef}>
        <div
          className="d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => setOpen(!open)}
        >
          {profileData.avatar ? (
            <img
              src={profileData.avatar}
              alt="User Avatar"
              width="35"
              height="35"
              className="rounded-circle"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              {letter}
            </div>
          )}
          <span className="text-white ms-2 fw-semibold username">{profileData.name}</span>
        </div>

        {open && (
          <div className="admin-dropdown">
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => {
                navigate("/admin/profile");
                setOpen(false);
              }}
            >
              <i className="fa fa-user"></i>
              My Profile
            </button>

            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => {
                navigate("/admin/change-password");
                setOpen(false);
              }}
            >
              <i className="fa fa-lock"></i>
              Change Password
            </button>

            <button
              className="dropdown-item text-danger d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              <i className="fa fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

