import React, { useState } from 'react';
import Topbar from '../../Components/Topbar/Topbar';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import Sidebar from '../../Components/SideBar/Sidebar';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { useParams } from 'react-router-dom';

export default function CreateGroup() {
  const { user, accessToken } = useAuth();
  const { orgId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const createGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const organization_id = orgId;
    const created_by = user.id;

    try {
      const result = await axios.post(
        "http://localhost:3000/groups/new_group",
        { title, description, created_by, organization_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setSuccessMsg(result.data.message || "Group created successfully!");
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating group:", error);

      if (error.response) {
        setErrorMsg(error.response.data.message || "Failed to create group.");
      } else if (error.request) {
        setErrorMsg("No response from server. Please try again later.");
      } else {
        setErrorMsg("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="content">
          <br />
          <h3>Create a New Group</h3>

          {successMsg && (
            <Alert variant="success" className="mt-3">
              {successMsg}
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="danger" className="mt-3">
              {errorMsg}
            </Alert>
          )}

          <Form onSubmit={createGroup} className="mt-3">
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Group Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                required
                placeholder="Group Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <br />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </>
  );
}
