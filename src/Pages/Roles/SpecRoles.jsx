import React, { useEffect, useState } from "react";
import { Col, Row, Form, Spinner, Alert, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { useAuth } from "../../Context/AuthContext";

function SpecRoles() {
  const { orgId, id: roleId } = useParams();
  const { accessToken } = useAuth();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `http://localhost:3000/roles/${orgId}/${roleId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        setRole(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch role details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orgId && roleId && accessToken) {
      fetchRole();
    }
  }, [orgId, roleId, accessToken]);

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

  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="content p-4">
          {loading && (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <span className="ms-2">Loading role details...</span>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && !error && role && (
            <Card className="shadow-sm">
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" value={role.title} readOnly />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Created At</Form.Label>
                        <Form.Control
                          type="text"
                          value={formatDate(role.created_at)}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Created By</Form.Label>
                        <Form.Control type="text" value={role.created_by} readOnly />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={role.description}
                      readOnly
                    />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
}

export default SpecRoles;
