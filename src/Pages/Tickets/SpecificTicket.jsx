import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Container,
  Spinner,
  Form,
  Button,
  Dropdown,
  Card,
  Badge,
} from "react-bootstrap";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { useAuth } from "../../Context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";

function SpecificTicket() {
  const { accessToken, user } = useAuth();
  const { orgId, id } = useParams();
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInternal, setIsInternal] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatedFields, setUpdatedFields] = useState({});
  const [showHistory, setShowHistory] = useState(false);


  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const result = await axios.get(`http://localhost:3000/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("Ticket data:", result.data.data);
        setTicket(result.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, accessToken]);



  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsRes = await axios.get(
          `http://localhost:3000/tickets/${orgId}/teams`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setTeams(teamsRes.data.data);
      } catch (err) {
        console.error("Failed to load teams", err);
      }
    };
    fetchTeams();
  }, [orgId, accessToken]);

  
  useEffect(() => {
    const loadMembersForAssignedTeam = async () => {
      if (ticket && ticket.assigned_team) {
        try {
          const usersRes = await axios.get(
            `http://localhost:3000/tickets/${orgId}/teams/${ticket.assigned_team}/users`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          setMembers(usersRes.data.data);
        } catch (err) {
          console.error("Failed to fetch users for assigned team", err);
          setMembers([]);
        }
      }
    };
    
    loadMembersForAssignedTeam();
  }, [ticket?.assigned_team, orgId, accessToken]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment || isInternal === null) {
      setError("Please enter a comment and choose internal option");
      return;
    }

    const payload = {
      ticket_id: id,
      user_id: user.id,
      message: comment,
      is_internal: isInternal,
    };

    try {
      setSubmitting(true);
      setError(null);

      await axios.post("http://localhost:3000/comments/new", payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const updated = await axios.get(`http://localhost:3000/tickets/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTicket(updated.data.data);

      setComment("");
      setIsInternal(null);
    } catch (err) {
      console.error(err);
      setError("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const updateTicket = async () => {
    try {
      setSubmitting(true);
      setError(null);
      if (Object.keys(updatedFields).length === 0) {
        setError("No changes to save.");
        setSubmitting(false);
        return;
      }

      console.log("Updating ticket with fields:", updatedFields);

      const response = await axios.patch(`http://localhost:3000/tickets/${id}`, updatedFields, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("Update response:", response.data);

      setUpdatedFields({});
      const updated = await axios.get(`http://localhost:3000/tickets/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTicket(updated.data.data);
      

      if (response.data.updatedFields > 0) {
        alert(`Successfully updated ${response.data.updatedFields} field(s)`); 
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeamChange = async (selectedTeam) => {
    const oldTeam = ticket.assigned_team;
    
    setTicket((prev) => ({
      ...prev,
      assigned_team: selectedTeam,
      assignee_id: "", 
    }));
    
    setUpdatedFields((prev) => ({
      ...prev,
      assigned_team: selectedTeam,
      assignee_id: oldTeam !== selectedTeam ? "" : prev.assignee_id, 
    }));

    if (selectedTeam) {
      try {
        const usersRes = await axios.get(
          `http://localhost:3000/tickets/${orgId}/teams/${selectedTeam}/users`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setMembers(usersRes.data.data);
      } catch (err) {
        console.error("Failed to fetch users for team", err);
        setMembers([]);
      }
    } else {
      setMembers([]);
    }
  };

  const handleAssigneeChange = (selectedAssignee) => {
    setTicket((prev) => ({
      ...prev,
      assignee_id: selectedAssignee,
    }));
    
    setUpdatedFields((prev) => ({
      ...prev,
      assignee_id: selectedAssignee,
    }));
  };

  const formatFieldName = (fieldName) => {
    const fieldMap = {
      'assignee_id': 'Assignee',
      'assigned_team': 'Team',
      'priority': 'Priority',
      'status': 'Status',
      'type': 'Type'
    };
    return fieldMap[fieldName] || fieldName;
  };

  const formatFieldValue = (fieldName, value) => {
    if (!value) return 'None';
    
    // For assignee_id, try to find the user name from members or ticket data
    if (fieldName === 'assignee_id') {
      if (value === ticket?.assignee_id && ticket?.assignee_name) {
        return ticket.assignee_name;
      }
      const member = members.find(m => m.id === value);
      return member ? member.name : value;
    }
    
    // For assigned_team, try to find the team name
    if (fieldName === 'assigned_team') {
      if (value === ticket?.assigned_team && ticket?.team_title) {
        return ticket.team_title;
      }
      const team = teams.find(t => t.id === value);
      return team ? team.title : value;
    }
    
    return value;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      'urgent': 'danger',
      'high': 'warning',
      'medium': 'info',
      'low': 'secondary'
    };
    return variants[priority] || 'secondary';
  };

  const getStatusBadge = (status) => {
    const variants = {
      'open': 'primary',
      'in_progress': 'warning',
      'resolved': 'success',
      'closed': 'secondary',
      'rejected': 'danger'
    };
    return variants[status] || 'secondary';
  };


  useEffect(() => {
  const fetchTicket = async () => {
    try {
      const [ticketRes, updatesRes] = await Promise.all([
        axios.get(`http://localhost:3000/tickets/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        axios.get(`http://localhost:3000/tickets/${id}/updates`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      ]);

      setTicket({
        ...ticketRes.data.data,
        updates: updatesRes.data.data
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  fetchTicket();
}, [id, accessToken]);


  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="content">
          <Container>
            {loading ? (
              <Spinner animation="border" />
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : ticket ? (
              <div className="ticket-details">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Ticket #{ticket.id}</h4>
                  <div>
                    <Badge variant={getPriorityBadge(ticket.priority)} className="me-2">
                      {ticket.priority}
                    </Badge>
                    <Badge variant={getStatusBadge(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>

                <Form>
                  <Row>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Created By</Form.Label>
                        <Form.Control value={ticket.created_by_name || ""} readOnly />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Team</Form.Label>
                        {user.role === "admin" || user.role === "agent" ? (
                          <Form.Select
                            value={ticket.assigned_team || ""}
                            onChange={(e) => handleTeamChange(e.target.value)}
                          >
                            <option value="">-- Select Team --</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <Form.Control
                            value={ticket.team_title || "No Team"}
                            readOnly
                          />
                        )}
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Assigned To</Form.Label>
                        {user.role === "admin" || user.role === "agent" ? (
                          <Form.Select
                            value={ticket.assignee_id || ""}
                            onChange={(e) => handleAssigneeChange(e.target.value)}
                            disabled={!ticket.assigned_team}
                          >
                            <option value="">-- Select Member --</option>
                            {members.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.email})
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <Form.Control
                            value={ticket.assignee_name || "Unassigned"}
                            readOnly
                          />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <br />
                  <Row>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Priority</Form.Label>
                        {user.role === "admin" || user.role === "agent" ? (
                          <Form.Select
                            value={ticket.priority || ""}
                            onChange={(e) => {
                              setTicket((prev) => ({
                                ...prev,
                                priority: e.target.value,
                              }));
                              setUpdatedFields((prev) => ({
                                ...prev,
                                priority: e.target.value,
                              }));
                            }}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </Form.Select>
                        ) : (
                          <Form.Control value={ticket.priority || ""} readOnly />
                        )}
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Type</Form.Label>
                        {user.role === "admin" || user.role === "agent" ? (
                          <Form.Select
                            value={ticket.type || ""}
                            onChange={(e) => {
                              setTicket((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }));
                              setUpdatedFields((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }));
                            }}
                          >
                            <option value="bug">Bug</option>
                            <option value="feature_request">Feature</option>
                            <option value="support">Task</option>
                          </Form.Select>
                        ) : (
                          <Form.Control value={ticket.type || ""} readOnly />
                        )}
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        {user.role === "admin" || user.role === "agent" ? (
                          <Form.Select
                            value={ticket.status || ""}
                            onChange={(e) => {
                              setTicket((prev) => ({
                                ...prev,
                                status: e.target.value,
                              }));
                              setUpdatedFields((prev) => ({
                                ...prev,
                                status: e.target.value,
                              }));
                            }}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                            <option value="rejected">Rejected</option>
                          </Form.Select>
                        ) : (
                          <Form.Control value={ticket.status || ""} readOnly />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <br />
                  <Form.Group>
                    <Form.Label>Subject</Form.Label>
                    <Form.Control value={ticket.title || ""} readOnly />
                  </Form.Group>
                  <br />
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      value={ticket.description || ""}
                      as="textarea"
                      rows={4}
                      readOnly
                    />
                  </Form.Group>
                </Form>

                {(user.role === "admin" || user.role === "agent") && (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={updateTicket}
                      disabled={
                        Object.keys(updatedFields).length === 0 || submitting
                      }
                      className="me-2"
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                    {Object.keys(updatedFields).length > 0 && (
                      <small className="text-muted">
                        {Object.keys(updatedFields).length} field(s) modified
                      </small>
                    )}
                  </div>
                )}


                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <h6>Update History</h6>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </Button>
                </div>
                
                {showHistory && (
                  <div className="mt-3">
                    {ticket.updates && ticket.updates.length > 0 ? (
                      ticket.updates.map((update, idx) => (
                        <Card key={idx} className="mb-2">
                          <Card.Body className="py-2">
                            <Row>
                              <Col xs={3}>
                                <strong>{formatFieldName(update.field_name)}</strong>
                              </Col>
                              <Col xs={3}>
                                <span className="text-muted">
                                  {formatFieldValue(update.field_name, update.old_value) || 'None'}
                                </span>
                              </Col>
                              <Col xs={1}>
                                <span className="text-muted">→</span>
                              </Col>
                              <Col xs={3}>
                                <span className="text-success">
                                  {formatFieldValue(update.field_name, update.new_value) || 'None'}
                                </span>
                              </Col>
                              <Col xs={2} className="text-end">
                                <small className="text-muted">
                                  {update.updated_by_name || 'System'}<br/>
                                  {new Date(update.created_at).toLocaleString()}
                                </small>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted">No update history available.</p>
                    )}
                  </div>
                )}

                <hr />
                <Form onSubmit={addComment}>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Comment here"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Form.Group>
                  <br />
                  <div className="d-flex justify-content-between align-items-center">
  {/* File input on the left */}
  <Form.Group>
    <Form.Label>Upload File</Form.Label>
    <Form.Control type="file" />
  </Form.Group>

  {/* Dropdown on the right */}
  <Form.Group>
    <Form.Label>Internal</Form.Label>
    <Dropdown onSelect={(val) => setIsInternal(val === "yes")}>
      <Dropdown.Toggle
        variant={isInternal === false ? "danger" : "primary"}
        id="dropdown-internal"
      >
        {isInternal === true
          ? "Yes"
          : isInternal === false
          ? "No"
          : "Select option"}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item eventKey="yes">Yes</Dropdown.Item>
        <Dropdown.Item eventKey="no">No</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  </Form.Group>
</div>
                  <br />
                  <Button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Comment"}
                  </Button>
                </Form>
                <hr/>
                <h6>Comments</h6>
                {ticket.comments && ticket.comments.length === 0 ? (
                  <p>No comments yet.</p>
                ) : (
                  ticket.comments && ticket.comments.map((c, idx) => (
                    <Card key={idx} className="mb-2">
                      <Card.Body>
                        <Row>
                          <Col xs={10}>
                            <strong>{c.commented_by}:</strong> {c.message}
                            {c.is_internal && (
                              <Badge variant="warning" className="ms-2">Internal</Badge>
                            )}
                          </Col>
                          <Col xs={2} className="text-end">
                            <small className="text-muted">
                              {new Date(c.created_at).toLocaleString()}
                            </small>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <p>No ticket found.</p>
            )}
          </Container>
        </Col>
      </Row>
    </>
  );
}

export default SpecificTicket;