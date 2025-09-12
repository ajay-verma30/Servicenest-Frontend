import React, { useState } from "react";
import { Row, Col, Form, Button, Container, Modal, Alert } from "react-bootstrap";
import "./Login.css";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState("");
  const [orgSuccess, setOrgSuccess] = useState("");
  const [orgData, setOrgData] = useState({
    org_name: "",
    domain: "",
    city: "",
    country: "",
    primary_contact_name: "",
    primary_contact: "",
    f_name: "",
    l_name: "",
    email: "",
    password: "",
    contact: ""
  });

  const containerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden'
  };

  const floatingShapeStyle = {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    animation: 'float 6s ease-in-out infinite'
  };

  const loginCardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '3rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'transform 0.3s ease',
  };

  const inputStyle = {
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    padding: '14px 20px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.9)'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
  };

  const modalStyle = {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: 'none',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (e) => {
    setOrgData({ ...orgData, [e.target.name]: e.target.value });
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setOrgLoading(true);
    setOrgError("");
    setOrgSuccess("");

    try {
      const payload = {
        ...orgData,
        city: orgData.city || null,
        primary_contact: orgData.primary_contact || null
      };

      const res = await axios.post("http://localhost:3000/organization/register", payload);
      setOrgSuccess(res.data.message || "Organization created successfully!");

      setTimeout(() => {
        setShowModal(false);
        setOrgSuccess("");
        setOrgData({
          org_name: "",
          domain: "",
          city: "",
          country: "",
          primary_contact_name: "",
          primary_contact: "",
          f_name: "",
          l_name: "",
          email: "",
          password: "",
          contact: ""
        });
      }, 2000);
    } catch (err) {
      setOrgError(err.response?.data?.message || "Failed to create organization");
    } finally {
      setOrgLoading(false);
    }
  };

  return (
    <>
      <Container fluid style={containerStyle}>
        <div style={{...floatingShapeStyle}} className="floating-shape-1"></div>
        <div style={{...floatingShapeStyle}} className="floating-shape-2"></div>
        <div style={{...floatingShapeStyle}} className="floating-shape-3"></div>
        <div style={{...floatingShapeStyle}} className="floating-shape-4"></div>

        <Row className="h-100 align-items-center justify-content-center">
          <Col xs={11} md={10} lg={8} xl={10} className="login-container">
            <Row className="g-0">

              <Col xs={12} lg={6} className="d-flex align-items-center justify-content-center p-4">
                <div style={loginCardStyle} className="w-100">
                  <div className="text-center mb-4">
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '32px'
                      }}
                    >
                      🎫
                    </div>
                    <h2 className="fw-bold mb-2" style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Welcome Back
                    </h2>
                    <p className="text-muted">Sign in to your account to continue</p>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark mb-2">Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark mb-2">Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </Form.Group>

                    {error && (
                      <Alert variant="danger" className="mb-4" style={{borderRadius: '12px', border: 'none'}}>
                        <div className="d-flex align-items-center">
                          <span style={{fontSize: '18px', marginRight: '8px'}}>⚠️</span>
                          {error}
                        </div>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      disabled={loading}
                      style={buttonStyle}
                      className="w-100 mb-4"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        <>
                          🔐 Sign In
                        </>
                      )}
                    </Button>
                  </Form>

                  <div className="text-center">
                    <p className="mb-2">
                      <a 
                        href="reset-password" 
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        🔑 Forgot Password?
                      </a>
                    </p>
                    <p className="mb-0">
                      New Organization?{" "}
                      <Button 
                        variant="link" 
                        onClick={() => setShowModal(true)}
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: '600',
                          padding: 0
                        }}
                      >
                        🏢 Register Here
                      </Button>
                    </p>
                  </div>
                </div>
              </Col>

              <Col xs={12} lg={6} className="d-none d-lg-flex align-items-center justify-content-center p-4">
                <div className="text-center">
                  <div className="image-container mb-4">
                    <img
                      src="https://images.pexels.com/photos/33773640/pexels-photo-33773640.jpeg"
                      alt="Support Illustration"
                      className="img-fluid"
                      style={{ 
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover'
                      }}
                    />
                    <div className="image-overlay">
                      <div>
                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🎯</div>
                        <div>Ticket Management</div>
                        <div style={{fontSize: '1rem', fontWeight: 'normal', marginTop: '0.5rem'}}>Streamlined & Efficient</div>
                      </div>
                    </div>
                  </div>
                  <div style={{color: 'white', textAlign: 'center'}}>
                    <h3 className="fw-bold mb-3">Manage Tickets Like a Pro</h3>
                    <p className="lead" style={{opacity: 0.9}}>
                      Streamline your support workflow with our powerful ticket management system. 
                      Track, prioritize, and resolve issues efficiently.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Organization Register Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="lg"
        centered
        backdrop="static"
      >
        <div style={modalStyle}>
          <Modal.Header closeButton style={{border: 'none', paddingBottom: 0}}>
            <Modal.Title className="d-flex align-items-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                🏢
              </div>
              <div>
                <div className="fw-bold">Create New Organization</div>
                <small className="text-muted fw-normal">Set up your organization and admin account</small>
              </div>
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body style={{padding: '2rem'}}>
            {orgError && (
              <Alert variant="danger" className="mb-4" style={{borderRadius: '12px', border: 'none'}}>
                <div className="d-flex align-items-center">
                  <span style={{fontSize: '18px', marginRight: '8px'}}>❌</span>
                  {orgError}
                </div>
              </Alert>
            )}

            {orgSuccess && (
              <Alert variant="success" className="mb-4" style={{borderRadius: '12px', border: 'none'}}>
                <div className="d-flex align-items-center">
                  <span style={{fontSize: '18px', marginRight: '8px'}}>✅</span>
                  {orgSuccess}
                </div>
              </Alert>
            )}

            <Form onSubmit={handleOrgSubmit}>
              {/* Organization Details */}
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Organization Name</Form.Label>
                    <Form.Control 
                      name="org_name"   // ✅ fixed
                      value={orgData.org_name}
                      onChange={handleOrgChange} 
                      required 
                      style={inputStyle}
                      placeholder="Enter organization name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Domain</Form.Label>
                    <Form.Control 
                      name="domain" 
                      value={orgData.domain}
                      onChange={handleOrgChange} 
                      required 
                      style={inputStyle}
                      placeholder="company.com"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">City</Form.Label>
                    <Form.Control 
                      name="city" 
                      value={orgData.city}
                      onChange={handleOrgChange} 
                      style={inputStyle}
                      placeholder="Enter city"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Country</Form.Label>
                    <Form.Control 
                      name="country" 
                      value={orgData.country}
                      onChange={handleOrgChange} 
                      required 
                      style={inputStyle}
                      placeholder="Enter country"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Primary Contact Name</Form.Label>
                    <Form.Control 
                      name="primary_contact_name" 
                      value={orgData.primary_contact_name}
                      onChange={handleOrgChange} 
                      required 
                      style={inputStyle}
                      placeholder="Contact person name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Contact Number</Form.Label>
                    <Form.Control 
                      name="primary_contact" 
                      value={orgData.primary_contact}
                      onChange={handleOrgChange} 
                      style={inputStyle}
                      placeholder="+1 234 567 8900"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <hr style={{margin: '2rem 0'}} />

              {/* Admin User Details */}
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">First Name</Form.Label>
                    <Form.Control 
                      name="f_name" 
                      value={orgData.f_name}
                      onChange={handleOrgChange} 
                      required 
                      style={inputStyle}
                      placeholder="First name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Last Name</Form.Label>
                    <Form.Control 
                      name="l_name" 
                      value={orgData.l_name}
                      onChange={handleOrgChange} 
                      required 
                      style={inputStyle}
                      placeholder="Last name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      value={orgData.email}
                      onChange={handleOrgChange} 
                      required 
                      style={inputStyle}
                      placeholder="admin@company.com"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="password" 
                      value={orgData.password}
                      onChange={handleOrgChange} 
                      required 
                      style={inputStyle}
                      placeholder="Create password"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-3">
                <Form.Label className="fw-semibold">Contact Number</Form.Label>
                <Form.Control 
                  name="contact" 
                  value={orgData.contact}
                  onChange={handleOrgChange} 
                  style={inputStyle}
                  placeholder="+1 234 567 8900"
                />
              </Form.Group>

              <Button 
                type="submit" 
                disabled={orgLoading}
                style={{...buttonStyle, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}
                className="w-100 mt-4"
              >
                {orgLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Organization...
                  </>
                ) : (
                  <>
                    🚀 Create Organization & Admin
                  </>
                )}
              </Button>
            </Form>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
}

export default Login;
