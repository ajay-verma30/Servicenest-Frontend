import React, { useEffect, useState } from "react";
import "./Users.css";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { useAuth } from "../../Context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Spinner,
  InputGroup,
  ButtonGroup,
  Alert,
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

function Users() {
  const { api, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { orgId } = useParams();

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await api.get("/user/all");

        setUsers(results.data.result || []);
      } catch (err) {
        console.error("Error fetching users:", err);

        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view users.");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load users. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      getAllUsers();
    }
  }, [api, user]);

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.f_name || ""} ${user.l_name || ""}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusVariant = (status) => {
    const statusVariants = {
      active: "success",
      inactive: "secondary",
      pending: "warning",
      suspended: "danger",
    };
    return statusVariants[status?.toLowerCase()] || "secondary";
  };

  const getRoleVariant = (role) => {
    const roleVariants = {
      admin: "danger",
      agent: "primary",
      user: "info",
    };
    return roleVariants[role?.toLowerCase()] || "secondary";
  };

  const getInitials = (firstName, lastName) => {
    const first = (firstName || "").charAt(0).toUpperCase();
    const last = (lastName || "").charAt(0).toUpperCase();
    return `${first}${last}` || "??";
  };

  const AvatarComponent = ({ firstName, lastName, fullName }) => (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
      style={{
        width: "40px",
        height: "40px",
        background: "linear-gradient(45deg, #007bff, #6f42c1)",
        fontSize: "14px",
      }}
      title={fullName}
    >
      {getInitials(firstName, lastName)}
    </div>
  );

  const handleRetry = () => {
    setError(null);

    window.location.reload();
  };

  if (loading) {
    return (
      <>
        <Topbar />
        <Row>
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="content p-4">
            <Container
              fluid
              className="min-vh-100 bg-light d-flex align-items-center justify-content-center"
            >
              <div className="text-center">
                <Spinner
                  animation="border"
                  variant="primary"
                  className="mb-3"
                />
                <p className="text-muted fw-medium">Loading users...</p>
              </div>
            </Container>
          </Col>
        </Row>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Topbar />
        <Row>
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="content p-4">
            <Container fluid className="min-vh-100 bg-light p-4">
              <div className="mx-auto" style={{ maxWidth: "1400px" }}>
                <Alert
                  variant="danger"
                  className="d-flex align-items-center justify-content-between"
                >
                  <div>
                    <Alert.Heading>Error Loading Users</Alert.Heading>
                    <p className="mb-0">{error}</p>
                  </div>
                  <Button variant="outline-danger" onClick={handleRetry}>
                    Try Again
                  </Button>
                </Alert>
              </div>
            </Container>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>

        <Col xs={10} md={10} className="content p-4">
          <Container fluid className="bg-light p-4">
            <div className="mx-auto" style={{ maxWidth: "1400px" }}>
              <div className="mb-4">
                <h1 className="display-6 fw-bold text-dark mb-2">
                  Users Management
                </h1>
                <p className="text-muted">
                  Manage and monitor user accounts across your platform
                </p>
              </div>

              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <Row className="g-3 align-items-center">
                    <Col lg={4}>
                      <InputGroup>
                        <InputGroup.Text>
                          <span style={{ fontSize: "16px" }}>🔍</span>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col lg={8}>
                      <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                        <Form.Select
                          style={{ width: "auto", minWidth: "120px" }}
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                        >
                          <option value="all">All Roles</option>
                          <option value="admin">Admin</option>
                          <option value="agent">Agent</option>
                          <option value="user">User</option>
                        </Form.Select>

                        <Form.Select
                          style={{ width: "auto", minWidth: "120px" }}
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </Form.Select>
                        <Link to={`/${orgId}/users/new`}>
                          <Button variant="primary">
                            <span style={{ fontSize: "16px" }}>👤</span> Add
                            User
                          </Button>
                        </Link>
                      </div>
                    </Col>
                  </Row>
                  <hr className="my-3" />
                  <small className="text-muted">
                    Showing {filteredUsers.length} of {users.length} users
                  </small>
                </Card.Body>
              </Card>
              <Card className="shadow-sm">
                <Card.Body className="p-0">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3" style={{ fontSize: "48px" }}>
                        👥
                      </div>
                      <h5 className="text-dark mb-2">No users found</h5>
                      <p className="text-muted">
                        {users.length === 0
                          ? "No users available in the system"
                          : "Try adjusting your search or filter criteria"}
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="border-0 px-4 py-3 text-muted text-uppercase small fw-bold">
                              User
                            </th>
                            <th className="border-0 px-4 py-3 text-muted text-uppercase small fw-bold">
                              Role
                            </th>
                            <th className="border-0 px-4 py-3 text-muted text-uppercase small fw-bold">
                              Status
                            </th>
                            <th className="border-0 px-4 py-3 text-muted text-uppercase small fw-bold">
                              Join Date
                            </th>
                            <th className="border-0 px-4 py-3 text-muted text-uppercase small fw-bold text-end">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const fullName =
                              `${user.f_name || ""} ${
                                user.l_name || ""
                              }`.trim() || "Unknown User";
                            const joinDate = user.created_at || user.joinDate;

                            return (
                              <tr
                                key={user.id}
                                style={{ borderTop: "1px solid #dee2e6" }}
                              >
                                <td className="px-4 py-3">
                                  <div className="d-flex align-items-center gap-3">
                                    <AvatarComponent
                                      firstName={user.f_name}
                                      lastName={user.l_name}
                                      fullName={fullName}
                                    />
                                    <div>
                                      <div className="fw-medium text-dark">
                                        {fullName}
                                      </div>
                                      <small className="text-muted">
                                        {user.email || "No email"}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge
                                    bg={getRoleVariant(user.role)}
                                    className="px-2 py-1"
                                  >
                                    {user.role || "Unknown"}
                                  </Badge>
                                </td>

                                <td className="px-4 py-3">
                                  <Badge
                                    bg={getStatusVariant(user.status)}
                                    className="px-2 py-1"
                                  >
                                    {user.status || "Unknown"}
                                  </Badge>
                                </td>

                                <td className="px-4 py-3">
                                  <small className="text-muted">
                                    {joinDate
                                      ? new Date(joinDate).toLocaleDateString(
                                          "en-US",
                                          {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          }
                                        )
                                      : "N/A"}
                                  </small>
                                </td>

                                <td className="px-4 py-3 text-end">
                                  <Link
                                    to={`/${orgId}/users/${user.id}`}
                                    className="text-decoration-none"
                                  >
                                    <FontAwesomeIcon
                                      icon={faPencil}
                                      className="text-primary cursor-pointer"
                                    />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {filteredUsers.length > 0 && (
                <Card className="shadow-sm mt-4">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col>
                        <small className="text-muted">
                          Showing <span className="fw-medium">1</span> to{" "}
                          <span className="fw-medium">
                            {filteredUsers.length}
                          </span>{" "}
                          of{" "}
                          <span className="fw-medium">
                            {filteredUsers.length}
                          </span>{" "}
                          results
                        </small>
                      </Col>
                      <Col xs="auto">
                        <ButtonGroup size="sm">
                          <Button variant="outline-secondary" disabled>
                            Previous
                          </Button>
                          <Button variant="primary">1</Button>
                          <Button variant="outline-secondary" disabled>
                            Next
                          </Button>
                        </ButtonGroup>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Container>
        </Col>
      </Row>
    </>
  );
}

export default Users;
