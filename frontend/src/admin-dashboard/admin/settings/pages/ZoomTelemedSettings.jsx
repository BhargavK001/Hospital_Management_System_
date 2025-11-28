import React, { useState } from "react";
import { Form, Button, Row, Col, Card, InputGroup } from "react-bootstrap";
import { FaSave, FaCopy } from "react-icons/fa";
import toast from "react-hot-toast";

const ZoomTelemedSettings = () => {
  const [isConfigEnabled, setIsConfigEnabled] = useState(true);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [isServerOAuthEnabled, setIsServerOAuthEnabled] = useState(false);

  const handleSave = () => {
    toast.success("Zoom Telemed configuration saved!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(redirectUrl);
    toast.success("Redirect URL copied to clipboard!");
  };

  return (
    <div className="p-2">
      <h4 className="fw-bold text-primary mb-4">Zoom Telemed</h4>

      <Card className="border-0 shadow-sm">
        <Card.Body>
            <Row>
                <Col md={7}>
                    <div className="mb-4">
                        <Form.Check 
                            type="switch"
                            id="zoom-config-switch"
                            label={<span className="fw-bold text-secondary">Zoom Telemed Configuration</span>}
                            checked={isConfigEnabled}
                            onChange={(e) => setIsConfigEnabled(e.target.checked)}
                            className="fs-5 mb-3"
                        />
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-muted">Zoom Telemed Client ID <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            value={clientId} 
                            onChange={(e) => setClientId(e.target.value)}
                            disabled={!isConfigEnabled}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-muted">Zoom Telemed Client Secret <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            value={clientSecret} 
                            onChange={(e) => setClientSecret(e.target.value)}
                            disabled={!isConfigEnabled}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small text-muted">Redirect URL</Form.Label>
                        <InputGroup>
                            <Form.Control 
                                type="text" 
                                value={redirectUrl} 
                                readOnly
                                disabled={!isConfigEnabled}
                                className="bg-light"
                            />
                            <Button variant="outline-secondary" onClick={copyToClipboard} disabled={!isConfigEnabled}>
                                <FaCopy />
                            </Button>
                        </InputGroup>
                    </Form.Group>

                    <div className="d-flex justify-content-end mb-4">
                        <Button variant="primary" onClick={handleSave} disabled={!isConfigEnabled}>
                            <FaSave className="me-2" /> Save
                        </Button>
                    </div>
                </Col>

                <Col md={5}>
                    <div className="bg-white p-0">
                        <h6 className="fw-bold text-primary mb-3">Guide to setup Zoom.</h6>
                        <div className="border rounded">
                            <div className="p-3 border-bottom">
                                <span className="small text-muted">Step 1: Sign up or Sign in here </span>
                                <a href="https://marketplace.zoom.us/" className="text-decoration-none small">Zoom market Place portal</a>
                            </div>
                            <div className="p-3 border-bottom">
                                <span className="small text-muted">Step 2: Click/Hover on Develop button at the right in navigation bar and click on build app </span>
                                <a href="https://marketplace.zoom.us/develop/create" className="text-decoration-none small">Create app</a>
                            </div>
                            <div className="p-3 border-bottom">
                                <span className="small text-muted">Step 3: Select OAuth and click Create</span>
                            </div>
                            <div className="p-3 border-bottom">
                                <span className="small text-muted">Step 4: Fill the mandatory information and In the App credentials tag you can see Client ID,Client secret And Redirect URL for OAuth.</span>
                            </div>
                            <div className="p-3">
                                <span className="small text-muted">Step 5: Copy and Paste Client ID,Client secret And Redirect URL here and click on save button and you are ready to go.</span>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ZoomTelemedSettings;
