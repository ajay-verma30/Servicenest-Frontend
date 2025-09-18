import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Container,
  Button,
  Alert,
  Form,
} from "react-bootstrap";
import { Person, People, Phone, Envelope, Clock } from "react-bootstrap-icons";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";

function SpecificUser() {
  const { orgId, id } = useParams();
  const { accessToken } = useAuth();

  const [specUser, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/user/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.data && res.data.result) {
          setUser(res.data.result);
          setSelectedRoles((res.data.result.roles || []).map((r) => r.id));
        } else {
          setError("User not found");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setError(error.response?.data?.error || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, accessToken]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/teams/${orgId}/all`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setTeams(res.data.result || []);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };
    fetchTeams();
  }, [orgId, accessToken]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/roles/all/${orgId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setRoles(res.data.roles || []);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, [orgId, accessToken]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "secondary";
      case "pending":
        return "warning";
      case "blocked":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getRoleVariant = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "danger";
      case "manager":
        return "warning";
      case "user":
        return "info";
      case "moderator":
        return "primary";
      default:
        return "secondary";
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:3000/user/status/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setActionMessage({
        type: "success",
        text: "User disabled successfully",
      });
      setUser({ ...specUser, status: "inactive" });
    } catch (error) {
      console.error("Failed to disable user:", error);
      setActionMessage({
        type: "danger",
        text: error.response?.data?.error || "Failed to disable user",
      });
    }
  };

  const handleSaveTeam = async () => {
    if (!selectedTeam) {
      setActionMessage({
        type: "warning",
        text: "Please select a team first",
      });
      return;
    }

    try {
      await axios.patch(
        `http://localhost:3000/user/${id}/team`,
        { teams: selectedTeam },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setActionMessage({
        type: "success",
        text: "Team updated successfully",
      });
      const selectedTeamTitle = teams.find(
        (t) => t.id === parseInt(selectedTeam)
      )?.title;
      setUser({ ...specUser, team_title: selectedTeamTitle });
      window.location.reload();
    } catch (error) {
      console.error("Failed to update team:", error);
      setActionMessage({
        type: "danger",
        text: error.response?.data?.error || "Failed to update team",
      });
    }
  };

  const handleSaveRoles = async () => {
  try {
    await Promise.all(
      selectedRoles.map((roleId) =>
        axios.post(
          "http://localhost:3000/roles/assign",
          { user_id: id, role_id: roleId },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
      )
    );

    setActionMessage({
      type: "success",
      text: "Roles assigned successfully",
    });
  } catch (error) {
    console.error("Failed to assign roles:", error);

    setActionMessage({
      type: "danger",
      text: error.response?.data?.message || "Failed to assign roles",
    });
  }
};


  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <Topbar />
        <Row className="g-0" style={{ minHeight: "calc(100vh - 60px)" }}>
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col
            xs={10}
            md={10}
            className="d-flex justify-content-center align-items-center"
          >
            <div className="text-center">
              <Spinner
                animation="border"
                variant="primary"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">Loading user details...</p>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <Topbar />
        <Row className="g-0">
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="p-4 content">
            <Container>
              <Alert variant="danger" className="shadow-sm">
                <h5 className="mb-1">Error</h5>
                <p className="mb-0">{err}</p>
              </Alert>
            </Container>
          </Col>
        </Row>
      </div>
    );
  }

  if (!specUser) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <Topbar />
        <Row className="g-0">
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="p-4">
            <Container>
              <Card className="border-0 shadow-lg">
                <Card.Body className="text-center py-5">
                  <div className="mb-3">
                    <Person size={48} className="text-muted" />
                  </div>
                  <h4 className="text-danger mb-2">User Not Found</h4>
                  <p className="text-muted">
                    The requested user could not be found or you don't have
                    permission to view this user.
                  </p>
                </Card.Body>
              </Card>
            </Container>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <Topbar />
      <Row className="g-0">
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="p-4 content">
          <Container>
            {actionMessage && (
              <Alert
                variant={actionMessage.type}
                onClose={() => setActionMessage(null)}
                dismissible
              >
                {actionMessage.text}
              </Alert>
            )}
            <Card
              className="mb-4 border-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <Card.Body className="text-white">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center me-4 shadow"
                    style={{
                      width: 80,
                      height: 80,
                      fontSize: "2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {specUser.full_name
                      ? specUser.full_name.charAt(0).toUpperCase()
                      : "U"}
                  </div>

                  <div>
                    <h2 className="mb-2 fw-bold">
                      {specUser.full_name || "Unknown User"}
                    </h2>
                    <div className="d-flex align-items-center mb-2">
                      <Envelope size={16} className="me-2" />
                      <span className="me-4">{specUser.email}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <Badge
                        bg={getStatusVariant(specUser.status)}
                        className="px-3 py-2 fw-semibold"
                        style={{
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {specUser.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="ms-auto">
                    <Button
                      variant="danger"
                      className="fw-semibold shadow-sm"
                      onClick={handleDisable}
                      disabled={specUser.status === "suspended"}
                    >
                      Disable User
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <Row>
              <Col lg={6}>
                <Card className="mb-4 border-0 shadow-sm h-100">
                  <Card.Header className="bg-white border-0 pb-0">
                    <h5 className="mb-0 d-flex align-items-center text-primary">
                      <Person size={20} className="me-2" />
                      Personal Information
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="d-flex align-items-center p-3 bg-light rounded-3">
                          <Person size={18} className="text-primary me-3" />
                          <div>
                            <small className="text-muted d-block">
                              Full Name
                            </small>
                            <strong>{specUser.full_name || "N/A"}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center p-3 bg-light rounded-3">
                          <Phone size={18} className="text-success me-3" />
                          <div>
                            <small className="text-muted d-block">
                              Contact
                            </small>
                            <strong>{specUser.contact || "N/A"}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center p-3 bg-light rounded-3">
                          <Envelope size={18} className="text-info me-3" />
                          <div>
                            <small className="text-muted d-block">
                              Email Address
                            </small>
                            <strong>{specUser.email}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={6}>
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <People size={18} className="text-primary me-3" />
                      <div className="flex-grow-1">
                        <small className="text-muted d-block">Team</small>
                        {specUser.team_title ? (
                          <strong>{specUser.team_title}</strong>
                        ) : (
                          <Form.Select
                            size="sm"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                          >
                            <option value="">Select Team</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.title}
                              </option>
                            ))}
                          </Form.Select>
                        )}
                      </div>
                      {!specUser.team_title && (
                        <Button
                          className="ms-3"
                          variant="primary"
                          size="sm"
                          onClick={handleSaveTeam}
                        >
                          Save
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex gap-2 flex-wrap">
                      <small className="text-muted d-block strong">
                        Assigned Roles
                      </small>
                      {specUser.roles?.length > 0 ? (
                        specUser.roles.map((role) => (
                          <Badge
                            key={role.id}
                            bg={getRoleVariant(role.title)}
                            className="px-3 py-2 text-uppercase fw-semibold"
                            style={{
                              fontSize: "0.75rem",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {role.title}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted">No roles assigned</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <div className="flex-grow-1">
                        <small className="text-muted d-block">
                          Available Roles
                        </small>
                        <Form.Select
                          multiple
                          value={selectedRoles}
                          onChange={(e) => {
                            const values = Array.from(
                              e.target.selectedOptions,
                              (opt) => opt.value
                            );
                            setSelectedRoles(values);
                          }}
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.title}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <Button
                        className="ms-3"
                        variant="success"
                        size="sm"
                        onClick={handleSaveRoles}
                      >
                        Save
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-4 border-0 shadow-sm">
  <Card.Body>
    <div className="d-flex gap-2 flex-wrap">
      <small className="text-muted d-block strong">
        Assigned Groups
      </small>
      {specUser.groups?.length > 0 ? (
        specUser.groups.map((group) => (
          <Badge
            key={group.id}
            bg="secondary"
            className="px-3 py-2 text-uppercase fw-semibold"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.5px",
            }}
          >
            {group.title}
          </Badge>
        ))
      ) : (
        <span className="text-muted">No groups assigned</span>
      )}
    </div>
  </Card.Body>
</Card>

              </Col>
            </Row>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0">
                <h5 className="mb-0 d-flex align-items-center text-success">
                  <Clock size={20} className="me-2" />
                  Activity Timeline
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="text-center p-4 bg-success bg-opacity-10 rounded-3 h-100">
                      <h6 className="text-success mb-1">Last Login</h6>
                      <p className="mb-0 fw-semibold">
                        {formatDate(specUser.last_login_at)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-4 bg-primary bg-opacity-10 rounded-3 h-100">
                      <h6 className="text-primary mb-1">Account Created</h6>
                      <p className="mb-0 fw-semibold">
                        {formatDate(specUser.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-4 bg-warning bg-opacity-10 rounded-3 h-100">
                      <h6 className="text-warning mb-1">Last Updated</h6>
                      <p className="mb-0 fw-semibold">
                        {formatDate(specUser.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Container>
        </Col>
      </Row>
    </div>
  );
}

export default SpecificUser;
