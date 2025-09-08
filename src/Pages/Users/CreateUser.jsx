import React, { useState } from "react";
import axios from "axios";
import Topbar from '../../Components/Topbar/Topbar';
import { Col, Row, Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import Sidebar from '../../Components/SideBar/Sidebar';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

function CreateUser() {
  const { accessToken, orgId } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    f_name: "",
    l_name: "",
    email: "",
    password: "",
    role: "customer",
    status: "active",
    contact: "",
    organization:""
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const validate = () => {
    setErrorMsg(null);
    const { f_name, l_name, email, password, contact } = form;
    if (!f_name || f_name.trim().length === 0) return "First name is required";
    if (!l_name || l_name.trim().length === 0) return "Last name is required";
    if (!email || email.trim().length === 0) return "Email is required";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return "Enter a valid email address";
    if (!password || password.length < 6) return "Password must be at least 6 characters";
    if (contact && contact.length > 20) return "Contact must be <= 20 characters";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        f_name: form.f_name,
        l_name: form.l_name,
        email: form.email,
        password: form.password,
        role: form.role,
        contact: form.contact || null,
        organization: orgId,
      };

      const res = await axios.post("http://localhost:3000/user/new", payload, {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setSuccessMsg(res.data?.message || "User created successfully");
      setForm({
        f_name: "",
        l_name: "",
        email: "",
        password: "",
        role: "customer",
        status: "active",
        contact: "",
      });

      setTimeout(() => {
        navigate(`/$orgId/users`);
      }, 900);

    } catch (err) {
      console.error("Create user failed:", err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        err.message ||
        "Failed to create user";
      setErrorMsg(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar />
      <Row className="g-0" style={{ minHeight: "calc(100vh - 60px)" }}>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>

        <Col xs={10} md={10} className="p-4">
          <Container>
            <h3 className="mb-4">Create New User</h3>

            <Card className="shadow-sm">
              <Card.Body>
                {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                {successMsg && <Alert variant="success">{successMsg}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="formContact" className="mb-2">
                        <Form.Label>Contact</Form.Label>
                        <Form.Control
                          type="text"
                          name="contact"
                          placeholder="Contact number"
                          value={form.contact}
                          onChange={handleChange}
                          maxLength={20}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="formFName" className="mb-2">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="f_name"
                          placeholder="First name"
                          value={form.f_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="formLName" className="mb-2">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="l_name"
                          placeholder="Last name"
                          value={form.l_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="formEmail" className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="email@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="formPassword" className="mb-2">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Password (min 6 chars)"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="formRole" className="mb-2">
                        <Form.Label>Role</Form.Label>
                        <Form.Select name="role" value={form.role} onChange={handleChange}>
                          <option value="admin">Admin</option>
                          <option value="agent">Agent</option>
                          <option value="customer">Customer</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" disabled={submitting} onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
                          Creating...
                        </>
                      ) : (
                        "Create User"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Container>
        </Col>
      </Row>
    </>
  );
}

export default CreateUser;
