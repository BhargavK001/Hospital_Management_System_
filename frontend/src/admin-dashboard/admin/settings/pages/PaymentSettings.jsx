import React, { useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { FaSave } from "react-icons/fa";
import toast from "react-hot-toast";

const PaymentSettings = () => {
  const [razorpayStatus, setRazorpayStatus] = useState(true);
  const [apiKey, setApiKey] = useState("Enter ApI Key Here");
  const [apiSecret, setApiSecret] = useState("Enter API Secret Here");
  const [currency, setCurrency] = useState("INR");

  const handleSave = () => {
    toast.success("Payment settings saved successfully!");
  };

  return (
    <div className="p-2">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white py-3">
            <h5 className="fw-bold text-secondary mb-0">Razorpay Settings</h5>
        </Card.Header>
        <Card.Body>
            <div className="mb-4">
                <Form.Check 
                    type="switch"
                    id="razorpay-status-switch"
                    label={<span className="fw-bold text-secondary">Razorpay Status</span>}
                    checked={razorpayStatus}
                    onChange={(e) => setRazorpayStatus(e.target.checked)}
                    className="fs-5"
                />
            </div>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-muted">API key</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)}
                            disabled={!razorpayStatus}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-muted">API secret</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={apiSecret} 
                            onChange={(e) => setApiSecret(e.target.value)}
                            disabled={!razorpayStatus}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={12}>
                    <Form.Group>
                        <Form.Label className="fw-bold small text-muted">Currency <span className="text-danger">*</span></Form.Label>
                        <Form.Select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)}
                            disabled={!razorpayStatus}
                        >
                            <option value="INR">Indian Rupees</option>
                            <option value="USD">US Dollar</option>
                            <option value="EUR">Euro</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <p className="text-muted small mb-0">
                Note: The Razorpay currency must be the same as the service price currency
            </p>

            <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={handleSave} disabled={!razorpayStatus}>
                    <FaSave className="me-2" /> Save
                </Button>
            </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentSettings;
