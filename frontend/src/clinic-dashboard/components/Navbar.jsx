import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaBell, FaUserMd, FaUserNurse } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../admin-dashboard/styles/AdminNavbar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../../config";

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
    <nav className="navbar navbar-dark bg-primary px-3 d-flex justify-content-between align-items-center">
      {/* left */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-outline-light border-0"
          onClick={toggleSidebar}
        >
          <FaBars size={22} />
        </button>
        <h4 className="text-white fw-bold mb-0">Clinic Dashboard</h4>
      </div>

      {/* right (notifications + profile + dropdown) */}
      <div className="d-flex align-items-center gap-3">
        {/* Notification Bell */}
        <div className="position-relative" ref={notificationRef}>
          <button
            className="btn btn-outline-light border-0 position-relative"
            onClick={() => setNotificationOpen(!notificationOpen)}
            title="Notifications"
          >
            <FaBell size={20} />
            {/* Red dot indicator */}
            {notificationCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#dc3545",
                  borderRadius: "50%",
                  border: "2px solid #0d6efd"
                }}
              />
            )}
          </button>

          {notificationOpen && (
            <div
              className="position-absolute"
              style={{
                right: 0,
                top: "100%",
                marginTop: "12px",
                minWidth: "360px",
                maxWidth: "400px",
                zIndex: 1050,
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
              }}
            >
              {/* Header with gradient */}
              <div
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h6 style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: "16px" }}>
                  Notifications
                </h6>
                {notificationCount > 0 && (
                  <span
                    style={{
                      background: "rgba(255, 255, 255, 0.25)",
                      backdropFilter: "blur(10px)",
                      padding: "4px 12px",
                      borderRadius: "50px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {notificationCount} pending
                  </span>
                )}
              </div>

              <div style={{ maxHeight: "340px", overflowY: "auto" }}>
                {loadingNotifications ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        margin: "0 auto 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaBell style={{ color: "#fff", animation: "pulse 1s infinite" }} />
                    </div>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Loading...</span>
                  </div>
                ) : pendingApprovals.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                        margin: "0 auto 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                      }}
                    >
                      ✅
                    </div>
                    <div style={{ color: "#1a1f36", fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>
                      All caught up!
                    </div>
                    <span style={{ color: "#64748b", fontSize: "13px" }}>No pending approvals</span>
                  </div>
                ) : (
                  pendingApprovals.slice(0, 5).map((request, index) => (
                    <div
                      key={request._id}
                      style={{
                        padding: "14px 20px",
                        borderBottom: index < Math.min(pendingApprovals.length, 5) - 1 ? "1px solid #f1f5f9" : "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/clinic-dashboard/pending-approvals");
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: request.role === "doctor"
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {request.role === "doctor" ? (
                          <FaUserMd style={{ color: "#fff", fontSize: "18px" }} />
                        ) : (
                          <FaUserNurse style={{ color: "#fff", fontSize: "18px" }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "#1a1f36", fontSize: "14px", marginBottom: "4px" }}>
                          {request.name}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.3px",
                              padding: "3px 10px",
                              borderRadius: "50px",
                              background: request.role === "doctor"
                                ? "rgba(102, 126, 234, 0.1)"
                                : "rgba(17, 153, 142, 0.1)",
                              color: request.role === "doctor" ? "#667eea" : "#11998e",
                            }}
                          >
                            {request.role === "doctor" ? "Doctor" : "Staff"}
                          </span>
                          <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                            {formatTimeAgo(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {pendingApprovals.length > 0 && (
                <div
                  style={{
                    padding: "14px 20px",
                    textAlign: "center",
                    borderTop: "1px solid #f1f5f9",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    setNotificationOpen(false);
                    navigate("/clinic-dashboard/pending-approvals");
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    View All Pending Approvals →
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
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
                  navigate("/clinic-dashboard/profile");
                  setOpen(false);
                }}
              >
                <i className="fa fa-user"></i>
                My Profile
              </button>

              <button
                className="dropdown-item d-flex align-items-center gap-2"
                onClick={() => {
                  navigate("/clinic-dashboard/change-password");
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
      </div>
    </nav>
  );
};

export default Navbar;

