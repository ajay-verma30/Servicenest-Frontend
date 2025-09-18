import React, { useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Table,
  Button,
  Alert,
  Spinner,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faPlus,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { useAuth } from "../../Context/AuthContext";

function Roles() {
  const { accessToken, user } = useAuth();
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    setTitle("");
    setDescription("");
  };
  const handleShow = () => setShow(true);

  const handleEditRole = useCallback(
    (roleId) => {
      navigate(`/${orgId}/role/${roleId}`);
    },
    [navigate, orgId]
  );

  const handleCreateRole = useCallback(
    async (e) => {
      e.preventDefault(); // prevent page reload

      try {
        const organization_id = orgId;
        const created_by = user.id;

        await axios.post(
          "http://localhost:3000/roles/new",
          { title, description, created_by, organization_id },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        handleClose(); // close modal
        fetchRoles(); // refresh list
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to create role. Please try again.";

        setError(errorMessage);
        console.error("Error creating role:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
      }
    },
    [orgId, title, description, user, accessToken]
  );

  const fetchRoles = useCallback(async () => {
    if (!accessToken || !orgId) {
      setError("Missing authentication or organization ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:3000/roles/all/${orgId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const fetchedRoles = response.data?.roles || [];
      setRoles(fetchedRoles);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch roles. Please try again.";

      setError(errorMessage);
      console.error("Error fetching roles:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken, orgId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleRetry = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid Date";
    }
  };

  const renderLoadingState = () => (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading roles...</span>
      </Spinner>
      <span className="ms-2">Loading roles...</span>
    </div>
  );

  const renderErrorState = () => (
    <Alert variant="danger" className="d-flex align-items-center">
      <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
      <div className="flex-grow-1">
        <strong>Error:</strong> {error}
      </div>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={handleRetry}
        className="ms-2"
      >
        Retry
      </Button>
    </Alert>
  );

  const renderEmptyState = () => (
    <Card className="text-center py-5">
      <Card.Body>
        <h5 className="text-muted mb-3">No Roles Found</h5>
        <p className="text-muted mb-4">
          There are no roles configured for this organization yet.
        </p>
        <Button variant="primary" onClick={handleShow}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Create First Role
        </Button>
      </Card.Body>
    </Card>
  );

  const renderRolesTable = () => (
    <Card className="shadow-sm">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Organization Roles</h5>
        <Button variant="primary" size="sm" onClick={handleShow}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Role
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <Table striped hover responsive className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Created At</th>
              <th width="100" className="text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>
                  <strong>{role.title || "Untitled Role"}</strong>
                </td>
                <td>
                  <span className="text-muted">
                    {role.description || "No description provided"}
                  </span>
                </td>
                <td>{role.full_name || "Unknown"}</td>
                <td className="text-muted">{formatDate(role.created_at)}</td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditRole(role.id)}
                    title={`Edit ${role.title}`}
                    aria-label={`Edit role ${role.title}`}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  return (
    <>
      <Topbar />
      <Row className="g-0">
        <Col xs={12} md={2} lg={2}>
          <Sidebar />
        </Col>
        <Col xs={12} md={10} lg={10}>
          <div className="content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-1">Roles Management</h2>
            </div>

            {error && renderErrorState()}

            {loading
              ? renderLoadingState()
              : roles.length > 0
              ? renderRolesTable()
              : renderEmptyState()}
          </div>
        </Col>
      </Row>

      {/* Modal for creating role */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateRole}>
            <Form.Group className="mb-3">
              <Form.Label>Role Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Create Role
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Roles;
