import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaBell, FaUserMd, FaUserNurse, FaUser, FaLock, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../../config";
import "../styles/ClinicModern.css";
import "../../shared/styles/ModernUI.css";

const Navbar = ({ toggleSidebar }) => {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const menuRef = useRef();
  const notificationRef = useRef();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({ name: "Clinic Admin", avatar: "" });

  // Get authUser from localStorage
  const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const userId = authUser?.id;

  // Fetch profile on mount
  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setProfileData({
        name: authUser?.name || authUser?.clinicName || "Clinic Admin",
        avatar: ""
      });
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || "Clinic Admin",
          avatar: data.avatar || "",
        });
      }
    } catch (err) {
      console.error("Error fetching clinic profile:", err);
    }
  };

  // Get first letter for avatar fallback
  const letter = profileData.name?.trim()?.charAt(0)?.toUpperCase() || "C";

  // Fetch pending approvals for notifications
  const fetchPendingApprovals = async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/approvals/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const requests = res.data.pendingRequests || [];
      setPendingApprovals(requests);
      setNotificationCount(requests.length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setPendingApprovals([]);
      setNotificationCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
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

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <nav className="clinic-navbar">
      {/* Left section */}
      <div className="clinic-navbar-left">
        <button className="clinic-menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h1 className="clinic-navbar-title">Clinic Dashboard</h1>
      </div>

      {/* Right section */}
      <div className="clinic-navbar-right">
        {/* Notification Bell */}
        <div style={{ position: "relative" }} ref={notificationRef}>
          <button
            className="clinic-notification-btn"
            onClick={() => setNotificationOpen(!notificationOpen)}
            title="Notifications"
          >
            <FaBell size={18} />
            {notificationCount > 0 && (
              <span className="clinic-notification-badge">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="clinic-dropdown" style={{ minWidth: 340, right: 0 }}>
              {/* Notification Header */}
              <div style={{
                background: "linear-gradient(135deg, #0d6efd 0%, #3d8bfd 100%)",
                padding: "14px 16px",
                borderRadius: "12px 12px 0 0",
                margin: "-8px -8px 8px -8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Notifications</span>
                {notificationCount > 0 && (
                  <span style={{
                    background: "rgba(255,255,255,0.2)",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    color: "#fff",
                    fontWeight: 600
                  }}>
                    {notificationCount} pending
                  </span>
                )}
              </div>

              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {loadingNotifications ? (
                  <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
                    Loading...
                  </div>
                ) : pendingApprovals.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <div style={{ color: "#334155", fontWeight: 600, fontSize: 14 }}>All caught up!</div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>No pending approvals</div>
                  </div>
                ) : (
                  pendingApprovals.slice(0, 5).map((request, index) => (
                    <div
                      key={request._id}
                      style={{
                        padding: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        borderRadius: 10,
                        transition: "background 0.2s",
                        marginBottom: 4
                      }}
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/clinic-dashboard/pending-approvals");
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"}
                      onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: request.role === "doctor"
                          ? "linear-gradient(135deg, #0d6efd 0%, #3d8bfd 100%)"
                          : "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        {request.role === "doctor" ? (
                          <FaUserMd style={{ color: "#fff", fontSize: 16 }} />
                        ) : (
                          <FaUserNurse style={{ color: "#fff", fontSize: 16 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{request.name}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: request.role === "doctor" ? "rgba(13, 110, 253, 0.1)" : "rgba(16, 185, 129, 0.1)",
                            color: request.role === "doctor" ? "#0d6efd" : "#10b981"
                          }}>
                            {request.role === "doctor" ? "Doctor" : "Staff"}
                          </span>
                          <span style={{ color: "#94a3b8", fontSize: 10 }}>{formatTimeAgo(request.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {pendingApprovals.length > 0 && (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderTop: "1px solid #f1f5f9",
                    marginTop: 4,
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setNotificationOpen(false);
                    navigate("/clinic-dashboard/pending-approvals");
                  }}
                >
                  <span style={{
                    background: "linear-gradient(135deg, #0d6efd 0%, #3d8bfd 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 600,
                    fontSize: 12
                  }}>
                    View All Pending Approvals →
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button className="clinic-profile-btn" onClick={() => setOpen(!open)}>
            {profileData.avatar ? (
              <img
                src={profileData.avatar}
                alt="Avatar"
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div className="clinic-profile-avatar">{letter}</div>
            )}
            <span className="clinic-profile-name">{profileData.name}</span>
          </button>

          {open && (
            <div className="clinic-dropdown">
              <button
                className="clinic-dropdown-item"
                onClick={() => {
                  navigate("/clinic-dashboard/profile");
                  setOpen(false);
                }}
              >
                <FaUser />
                My Profile
              </button>

              <button
                className="clinic-dropdown-item"
                onClick={() => {
                  navigate("/clinic-dashboard/change-password");
                  setOpen(false);
                }}
              >
                <FaLock />
                Change Password
              </button>

              <button
                className="clinic-dropdown-item danger"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
