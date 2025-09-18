import React, { useEffect, useState } from "react";
import "./Profile.css";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { Container, Row, Col, Form, Badge, Card, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";

function Profile() {
  const { user, accessToken } = useAuth();
  const [myUser, setMyUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const getUserDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await axios.get(
          `http://localhost:3000/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setMyUser(results.data.result);
      } catch (err) {
        console.error("Failed to fetch user detail:", err);
        setError("Failed to load profile information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getUserDetail();
  }, [user, accessToken]);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Topbar />
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading profile...</p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Topbar />
        <Container className="mt-4">
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      </>
    );
  }

  if (!myUser) {
    return (
      <>
        <Topbar />
        <Container className="mt-4">
          <Alert variant="info">
            <Alert.Heading>No Profile Data</Alert.Heading>
            <p>Unable to load profile information.</p>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <div className="profile-wrapper">
        <Row className="g-0">
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="profile-content content">
            <Container fluid className="px-4 py-4">
              {/* Header Section */}
              <div className="profile-header mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h2 className="mb-1 text-dark fw-bold">Profile Information</h2>
                    <p className="text-muted mb-0">Manage your account details and preferences</p>
                  </div>
                  <div className="profile-avatar">
                    <div className="avatar-circle d-flex align-items-center justify-content-center">
                      {myUser.full_name ? myUser.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Profile Card */}
              <Card className="profile-card shadow-sm border-0">
                <Card.Body className="p-4">
                  <Form>
                    {/* Personal Information Section */}
                    <div className="profile-section mb-4">
                      <h5 className="section-title mb-3">
                        <i className="bi bi-person-circle me-2"></i>
                        Personal Information
                      </h5>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Full Name</Form.Label>
                            <Form.Control 
                              value={myUser.full_name || 'Not provided'} 
                              readOnly 
                              className="profile-input"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Email Address</Form.Label>
                            <Form.Control 
                              value={myUser.email || 'Not provided'} 
                              readOnly 
                              className="profile-input"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="g-3 mt-2">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Contact Number</Form.Label>
                            <Form.Control
                              value={myUser.contact || 'Not provided'}
                              readOnly
                              className="profile-input"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Account Status</Form.Label>
                            <div className="mt-2">
                              <Badge 
                                bg={getStatusVariant(myUser.status)} 
                                className="status-badge px-3 py-2 fs-6"
                              >
                                {myUser.status || 'Unknown'}
                              </Badge>
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    {/* Organization Information Section */}
                    <div className="profile-section mb-4">
                      <h5 className="section-title mb-3">
                        <i className="bi bi-building me-2"></i>
                        Organization Details
                      </h5>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Organization</Form.Label>
                            <Form.Control
                              value={myUser.organization_name || 'Not assigned'}
                              readOnly
                              className="profile-input"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Team</Form.Label>
                            <Form.Control
                              value={myUser.team_title || 'Unassigned'}
                              readOnly
                              className="profile-input"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>

                    {/* Roles Section */}
                    <div className="profile-section mb-4">
                      <h5 className="section-title mb-3">
                        <i className="bi bi-shield-check me-2"></i>
                        Roles & Permissions
                      </h5>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-dark">Assigned Roles</Form.Label>
                        <div className="roles-container mt-2">
                          {myUser.roles && myUser.roles.length > 0 ? (
                            myUser.roles.map((role) => (
                              <Badge 
                                bg="primary" 
                                className="role-badge me-2 mb-2 px-3 py-2" 
                                key={role.id}
                              >
                                <i className="bi bi-check-circle-fill me-1"></i>
                                {role.title}
                              </Badge>
                            ))
                          ) : (
                            <div className="no-roles-message">
                              <i className="bi bi-info-circle me-2"></i>
                              <span className="text-muted">No roles currently assigned</span>
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </div>

                    {/* Account Activity Section */}
                    <div className="profile-section">
                      <h5 className="section-title mb-3">
                        <i className="bi bi-clock-history me-2"></i>
                        Account Activity
                      </h5>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Last Login</Form.Label>
                            <Form.Control
                              value={formatDate(myUser.last_login_at)}
                              readOnly
                              className="profile-input"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Account Created</Form.Label>
                            <Form.Control
                              value={formatDate(myUser.created_at)}
                              readOnly
                              className="profile-input"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Container>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Profile