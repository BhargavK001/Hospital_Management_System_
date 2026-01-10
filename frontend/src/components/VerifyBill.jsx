import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FiFileText, FiCalendar, FiClock, FiUser, FiMapPin, FiCheckCircle, FiXCircle, FiAlertCircle, FiDollarSign } from "react-icons/fi";
import API_BASE from "../config";

const VerifyBill = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await axios.get(`${API_BASE}/bills/${id}/verify`);
        setBill(response.data);
      } catch (err) {
        console.error("Error fetching bill:", err);
        setError(err.response?.data?.message || "Bill not found or invalid");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBill();
    }
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return (
          <span className="status-badge paid">
            <FiCheckCircle /> Paid
          </span>
        );
      case "partial":
        return (
          <span className="status-badge partial">
            <FiAlertCircle /> Partial
          </span>
        );
      case "unpaid":
      default:
        return (
          <span className="status-badge unpaid">
            <FiXCircle /> Unpaid
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="verify-container">
        <div className="verify-card loading">
          <div className="spinner"></div>
          <p>Verifying Bill...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verify-container">
        <div className="verify-card error">
          <FiXCircle className="error-icon" />
          <h2>Verification Failed</h2>
          <p>{error}</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <style>{`
        .verify-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .verify-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          max-width: 600px;
          width: 100%;
          overflow: hidden;
        }
        
        .verify-card.loading,
        .verify-card.error {
          padding: 60px 40px;
          text-align: center;
        }
        
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-icon {
          font-size: 48px;
          color: #dc2626;
          margin-bottom: 16px;
        }
        
        .verify-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          color: white;
          padding: 32px;
          text-align: center;
          position: relative;
        }
        
        .verify-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px;
        }
        
        .verify-header p {
          font-size: 14px;
          opacity: 0.8;
          margin: 0;
        }

        .bill-number {
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 12px;
            border-radius: 4px;
            font-family: monospace;
            letter-spacing: 1px;
            margin-top: 8px;
            display: inline-block;
        }
        
        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #10b981;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .verify-body {
          padding: 32px;
        }
        
        .info-section {
          margin-bottom: 24px;
        }
        
        .info-section h3 {
          font-size: 13px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        @media (max-width: 500px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .info-icon {
          width: 32px;
          height: 32px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .info-icon svg {
            font-size: 16px;
        }
        
        .info-content {
            flex: 1;
        }

        .info-item .label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 2px;
        }
        
        .info-item .value {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        
        .status-badge.paid {
          background: #d1fae5;
          color: #059669;
        }
        
        .status-badge.partial {
          background: #fef3c7;
          color: #d97706;
        }
        
        .status-badge.unpaid {
          background: #fee2e2;
          color: #dc2626;
        }

        .amount-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-top: 10px;
        }

        .amount-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
        }

        .amount-row.total {
            margin-bottom: 0;
            padding-top: 12px;
            border-top: 1px dashed #cbd5e1;
            font-weight: 700;
            font-size: 18px;
            color: #1e293b;
        }

        .btn-primary {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 16px;
          transition: background 0.2s;
        }
        
        .btn-primary:hover {
          background: #1d4ed8;
        }
        
        .footer-note {
          text-align: center;
          font-size: 13px;
          color: #64748b;
          padding: 20px 32px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-note b {
          color: #2563eb;
        }
      `}</style>

      <div className="verify-card">
        <div className="verify-header">
          <h1>Bill Verified</h1>
          <div className="bill-number">{bill?.billNumber || "N/A"}</div>
          <div className="verified-badge">
            <FiCheckCircle /> Authentic Receipt
          </div>
        </div>

        <div className="verify-body">
          <div className="info-section">
            <h3>Bill Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon"><FiCalendar /></div>
                <div className="info-content">
                  <div className="label">Date</div>
                  <div className="value">
                    {bill?.date 
                      ? new Date(bill.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
                      : "N/A"}
                  </div>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><FiClock /></div>
                <div className="info-content">
                    <div className="label">Time</div>
                    <div className="value">{bill?.time || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Patient & Provider</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon"><FiUser /></div>
                <div className="info-content">
                    <div className="label">Patient</div>
                    <div className="value">{bill?.patientName || "N/A"}</div>
                    <div className="label" style={{marginTop: 4, fontSize: 11}}>ID: {bill?.patientPid}</div>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><FiMapPin /></div>
                <div className="info-content">
                    <div className="label">Clinic</div>
                    <div className="value">{bill?.clinicName || "OneCare Clinic"}</div>
                    <div className="label" style={{marginTop: 4, fontSize: 11}}>{bill?.doctorName}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Payment Status</h3>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                {getStatusBadge(bill?.status)}
            </div>
            
            <div className="amount-box">
                 <div className="amount-row total">
                    <span>Total Amount</span>
                    <span>Rs. {(bill?.totalAmount || 0).toFixed(2)}</span>
                 </div>
            </div>
          </div>
        </div>

        <div className="footer-note">
          Generated via <b>OneCare</b> Hospital Management System
        </div>
      </div>
    </div>
  );
};

export default VerifyBill;
