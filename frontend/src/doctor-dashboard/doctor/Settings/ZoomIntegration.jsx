import React, { useState, useEffect } from "react";
import { SiZoom } from "react-icons/si";
import { FaQuestionCircle, FaCheck, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import API_BASE from "../../../config";

const ZoomIntegration = () => {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
    
    // Check URL params for OAuth callback result
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success("Zoom account connected successfully!");
      window.history.replaceState({}, '', window.location.pathname);
      checkStatus();
    } else if (params.get('error')) {
      toast.error("Failed to connect Zoom account. Please try again.");
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/auth/zoom/doctor/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnected(res.data.connected);
      setAccountId(res.data.accountId);
    } catch (err) {
      console.error("Error checking Zoom status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/auth/zoom/doctor/url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Redirect to Zoom OAuth
      window.location.href = res.data.url;
    } catch (err) {
      toast.error("Failed to initiate Zoom connection");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/api/auth/zoom/doctor/disconnect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnected(false);
      setAccountId(null);
      toast.success("Zoom account disconnected");
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  const styles = `
    .blue-header-bar {
      background: linear-gradient(90deg, #2d8cff, #0b5cff);
      color: #fff;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .connected-badge {
      background: #d3f9d8;
      color: #2b8a3e;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
  `;

  return (
    <div className="container-fluid mt-3">
      <style>{styles}</style>

      {/* Blue Header */}
      <div className="blue-header-bar mb-4">
        <SiZoom size={24} />
        <h5 className="mb-0 fw-bold">Zoom</h5>
        <FaQuestionCircle className="opacity-75" size={14} style={{ cursor: "pointer" }} />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded shadow-sm p-4 border">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : connected ? (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <div className="connected-badge mb-2">
                <FaCheck size={14} />
                <span>Connected</span>
              </div>
              <p className="text-muted mb-0 small">
                Your Zoom account is connected.
              </p>
              <p className="text-muted mb-0 small mt-1">
                Online appointments will automatically create Zoom meeting links.
              </p>
            </div>
            <button 
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={handleDisconnect}
            >
              <FaSignOutAlt />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                Connect your Zoom account to enable Zoom meetings for online appointments.
              </p>
              <p className="text-muted mb-0 small mt-1">
                Meeting links will be automatically generated for online appointments.
              </p>
            </div>
            <button 
              className="btn d-flex align-items-center gap-2 px-3 py-2 fw-medium"
              onClick={handleConnect}
              disabled={connecting}
              style={{ backgroundColor: '#2d8cff', borderColor: '#2d8cff', color: '#fff' }}
            >
              <SiZoom size={20} />
              <span>{connecting ? "Connecting..." : "Connect with Zoom"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-light rounded p-3 mt-3 border">
        <h6 className="fw-bold text-secondary mb-2">How it works</h6>
        <ul className="mb-0 small text-muted">
          <li>Connect your Zoom account securely via OAuth</li>
          <li>When patients book online appointments with Zoom, a meeting link is automatically generated</li>
          <li>Both you and the patient receive the meeting link via email/WhatsApp</li>
        </ul>
      </div>
    </div>
  );
};

export default ZoomIntegration;
