
import React, { useEffect, useState, useCallback } from "react";
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
  Modal,
  InputGroup,
  Toast,
} from "react-bootstrap";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { useAuth } from "../../Context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";

// Helper function outside the component to prevent re-creation
const getFilenameFromUrl = (url) => url?.split("/").pop() || "Download";

const formatFieldName = (fieldName) => {
  const fieldMap = {
    assignee_id: "Assignee",
    assigned_team: "Team",
    priority: "Priority",
    status: "Status",
    type: "Type",
  };
  return fieldMap[fieldName] || fieldName;
};

const formatFieldValue = (fieldName, value, members, teams) => {
  if (!value) return "None";

  if (fieldName === "assignee_id") {
    const member = members.find((m) => String(m.id) === String(value));
    return member ? member.full_name : value;
  }
  if (fieldName === "assigned_team") {
    const team = teams.find((t) => String(t.id) === String(value));
    return team ? team.title : value;
  }
  return value;
};

const getPriorityBadge = (priority) => {
  const variants = {
    urgent: "danger",
    high: "warning",
    medium: "info",
    low: "secondary",
  };
  return variants[priority] || "secondary";
};

const getStatusBadge = (status) => {
  const variants = {
    open: "primary",
    in_progress: "warning",
    resolved: "success",
    closed: "secondary",
    rejected: "danger",
  };
  return variants[status] || "secondary";
};

// Main component
function SpecificTicket() {
  const { accessToken, user, api } = useAuth();
  const { orgId, id } = useParams();

  // Core state
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Teams / members / users
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [watchers, setWatchers] = useState([]);
  const [orgUsers, setOrgUsers] = useState([]);

  // Comment / update state
  const [isInternal, setIsInternal] = useState(null);
  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatedFields, setUpdatedFields] = useState({});
  const [showHistory, setShowHistory] = useState(false);

  // Merge modal state
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [mergeSubmitting, setMergeSubmitting] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Role check helpers
  const isAdminOrAgent = useCallback(() => {
    if (!user) return false;
    const adminAgentRoles = ["Admin", "admin", "agent", "Administrator", "Agent"];
    return (
      (Array.isArray(user.roles) &&
        user.roles.some((role) => adminAgentRoles.includes(role.title || role))) ||
      (typeof user.role === "string" && adminAgentRoles.includes(user.role))
    );
  }, [user]);

  const canEditTicket = isAdminOrAgent() && ticket?.editable;
  const canMerge = isAdminOrAgent();

  // --- Data Fetching Hooks ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketRes, teamsRes, orgUsersRes, updatesRes] = await Promise.all([
        axios.get(`http://localhost:3000/tickets/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`http://localhost:3000/teams/${orgId}/all`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`http://localhost:3000/user/${orgId}/all`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`http://localhost:3000/tickets/${id}/updates`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      setTicket({
        ...ticketRes.data.data,
        updates: updatesRes.data.data,
      });
      // orgUsers API returns "result" in your example; be tolerant of multiple shapes.
      setTeams(teamsRes?.data?.result || teamsRes?.data?.data || []);
      setOrgUsers(orgUsersRes?.data?.result || orgUsersRes?.data?.data || []);

      if (ticketRes.data.data.assigned_team) {
        const membersRes = await axios.get(
          `http://localhost:3000/teams/${orgId}/teams/${ticketRes.data.data.assigned_team}/members`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setMembers(membersRes.data.members || []);
      }
    } catch (err) {
      console.error("Failed to load data", err);
      setError("Failed to load ticket data.");
    } finally {
      setLoading(false);
    }
  }, [id, orgId, accessToken]);

  const fetchWatchers = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/tickets/${id}/watchers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log(res);
      const data = res?.data?.data || res?.data?.result || res?.data || [];
      setWatchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load watchers", err);
    }
  }, [id, accessToken]);

  useEffect(() => {
    if (accessToken && orgId && id) {
      fetchAllData();
    }
  }, [accessToken, orgId, id, fetchAllData]);

  useEffect(() => {
    if (ticket) {
      fetchWatchers();
    }
  }, [ticket, fetchWatchers]);

  // --- Mutating Data Handlers ---

  const addWatcher = async (userId) => {
    if (!userId) return;
    try {
      // send the value as-is (your API expects string IDs like "33Ylv")
      await axios.post(
        `http://localhost:3000/tickets/${id}/watchers`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      // refresh watchers from server to reflect DB state (more reliable than local mutation)
      await fetchWatchers();
      setToastMessage("Watcher added");
      setShowToast(true);
    } catch (err) {
      console.error("Failed to add watcher", err);
      setError("Failed to add watcher.");
    }
  };

  const removeWatcher = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/tickets/${id}/watchers/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // refresh from server
      await fetchWatchers();
      setToastMessage("Watcher removed");
      setShowToast(true);
    } catch (err) {
      console.error("Failed to remove watcher", err);
      setError("Failed to remove watcher.");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment && !selectedFile) {
      setError("Please enter a comment or upload a file.");
      return;
    }
    if (isInternal === null) {
      setError("Please select if the comment is internal or not.");
      return;
    }

    const formData = new FormData();
    formData.append("ticket_id", id);
    formData.append("user_id", user.userId || user.id);
    formData.append("message", comment || "");
    formData.append("is_internal", isInternal ? 1 : 0);
    if (selectedFile) formData.append("attachment", selectedFile);

    setSubmitting(true);
    setError(null);
    try {
      await axios.post("http://localhost:3000/comments/new", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setComment("");
      setIsInternal(null);
      setSelectedFile(null);
      // Refresh ticket data after posting a comment
      await fetchAllData();
    } catch (err) {
      console.error("Failed to add comment", err);
      setError("Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateTicket = async () => {
    setSubmitting(true);
    setError(null);
    if (Object.keys(updatedFields).length === 0) {
      setError("No changes to save.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3000/tickets/${id}`,
        updatedFields,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setUpdatedFields({});
      await fetchAllData();
      setToastMessage("Ticket updated");
      setShowToast(true);
    } catch (err) {
      console.error("Failed to update ticket", err);
      setError("Failed to update ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeamChange = useCallback(
    async (selectedTeamId) => {
      setTicket((prev) => ({
        ...prev,
        assigned_team: selectedTeamId,
        assignee_id: "", // Reset assignee when team changes
      }));
      setUpdatedFields((prev) => ({
        ...prev,
        assigned_team: selectedTeamId,
        assignee_id: "",
      }));

      if (selectedTeamId) {
        try {
          const usersRes = await axios.get(
            `http://localhost:3000/teams/${orgId}/teams/${selectedTeamId}/members`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          setMembers(usersRes.data.members || []);
        } catch (err) {
          console.error("Failed to fetch users for team", err);
          setMembers([]);
        }
      } else {
        setMembers([]);
      }
    },
    [accessToken, orgId]
  );

  const handleAssigneeChange = useCallback((selectedAssigneeId) => {
    setTicket((prev) => ({ ...prev, assignee_id: selectedAssigneeId }));
    setUpdatedFields((prev) => ({ ...prev, assignee_id: selectedAssigneeId }));
  }, []);

  const handleMergeTickets = async () => {
    if (!selectedTickets.length) return;
    setMergeSubmitting(true);
    try {
      await axios.post(
        `http://localhost:3000/tickets/merge`,
        {
          master_ticket_id: ticket.id,
          merged_ticket_ids: selectedTickets,
          merged_by: user.userId || user.id,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setToastMessage("Tickets merged successfully!");
      setShowToast(true);
      handleCloseMergeModal();
      await fetchAllData(); // Re-fetch data to show the merged banner
      setSelectedTickets([]);
      setSearchResults([]);
    } catch (err) {
      console.error("Merge failed", err);
      setError("Failed to merge tickets.");
    } finally {
      setMergeSubmitting(false);
    }
  };

  const handleSearchTickets = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/tickets/${orgId}/search`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: searchQuery },
      });
      const results = (res.data.data || res.data.result || []).filter((t) => String(t.id) !== String(ticket?.id));
      setSearchResults(results);
    } catch (err) {
      console.error("Ticket search failed", err);
      setSearchResults([]);
    }
  };

  const handleOpenMergeModal = () => {
    setShowMergeModal(true);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedTickets([]);
  };
  const handleCloseMergeModal = () => setShowMergeModal(false);

  const handleToggleSelectTicket = (ticketId) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId) ? prev.filter((i) => i !== ticketId) : [...prev, ticketId]
    );
  };

  // --- Render Logic ---
  const renderTicketField = (label, value, isSelect, options, onSelectChange, disabled) => (
    <Form.Group>
      <Form.Label>{label}</Form.Label>
      {isSelect && canEditTicket ? (
        <Form.Select value={value || ""} onChange={onSelectChange} disabled={disabled}>
          <option value="">-- {`Select ${label}`} --</option>
          {options.map((option) => (
            <option key={option.id || option.value} value={option.id || option.value}>
              {option.title || option.full_name || option.label}
              {option.email && ` (${option.email})`}
            </option>
          ))}
        </Form.Select>
      ) : (
        <Form.Control value={value || "None"} readOnly />
      )}
    </Form.Group>
  );

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
              <div className="text-center my-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : ticket ? (
              <div className="ticket-details">
                {/* Banner if merged */}
                {ticket.is_merged && (
                  <Card className="mb-3 border-warning bg-light">
                    <Card.Body>
                      <strong>This ticket has been merged into </strong>
                      <Badge bg="warning" className="ms-2">
                        #{ticket.master_ticket_id}
                      </Badge>
                      . All updates should be tracked there.
                    </Card.Body>
                  </Card>
                )}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Ticket #{ticket.id}</h4>
                  <div>
                    <Badge bg={getPriorityBadge(ticket.priority)} className="me-2">
                      {ticket.priority}
                    </Badge>
                    <Badge bg={getStatusBadge(ticket.status)} className="me-2">
                      {ticket.status}
                    </Badge>
                    {canMerge && ticket.editable && (
                      <Button variant="outline-info" size="sm" onClick={handleOpenMergeModal}>
                        Merge Tickets
                      </Button>
                    )}
                  </div>
                </div>
                <h6>Watchers</h6>
                <div className="mb-3">
                  {watchers.length === 0 ? (
                    <p>No watchers yet.</p>
                  ) : (
                    watchers.map((w) => (
                      <Badge key={w.id} bg="info" className="me-2" style={{ cursor: canEditTicket ? "pointer" : "default" }} onClick={() => canEditTicket && removeWatcher(w.id)}>
                        {w.watcher} ✖️
                      </Badge>
                    ))
                  )}
                </div>
                {/* Watchers Section */}
                {canEditTicket && (
                  <Row>
                    <Col xs={4} md={4}>
                    <Form.Group className="mb-3">
                    <Form.Label>Add Watcher</Form.Label>
                    <Form.Select
                      onChange={(e) => {
                        const userId = e.target.value; // keep as string
                        if (userId) {
                          addWatcher(userId);
                          // reset select to placeholder
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="">-- Select User --</option>
                      {orgUsers
                        .filter((u) => !watchers.some((w) => String(w.id) === String(u.id)))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} ({u.email})
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                    </Col>
                  </Row>
                )}<hr/>
                {/* Form fields */}
                <Form>
                  <Row>
                    <Col xs={12} md={4}>
                      {renderTicketField("Created By", ticket.created_by_name)}
                    </Col>
                    <Col xs={12} md={4}>
                      {renderTicketField(
                        "Team",
                        ticket.assigned_team,
                        true,
                        teams.map((t) => ({ ...t, value: t.id, label: t.title })),
                        (e) => handleTeamChange(e.target.value)
                      )}
                    </Col>
                    <Col xs={12} md={4}>
                      {renderTicketField(
                        "Assigned To",
                        ticket.assignee_id,
                        true,
                        members.map((m) => ({ ...m, value: m.id })),
                        (e) => handleAssigneeChange(e.target.value),
                        !ticket.assigned_team
                      )}
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col xs={12} md={4}>
                      {renderTicketField(
                        "Priority",
                        ticket.priority,
                        true,
                        ["low", "medium", "high", "urgent"].map((p) => ({ value: p, label: p })),
                        (e) => {
                          setTicket((prev) => ({ ...prev, priority: e.target.value }));
                          setUpdatedFields((prev) => ({ ...prev, priority: e.target.value }));
                        }
                      )}
                    </Col>
                    <Col xs={12} md={4}>
                      {renderTicketField(
                        "Type",
                        ticket.type,
                        true,
                        ["bug", "feature_request", "support"].map((t) => ({ value: t, label: t })),
                        (e) => {
                          setTicket((prev) => ({ ...prev, type: e.target.value }));
                          setUpdatedFields((prev) => ({ ...prev, type: e.target.value }));
                        }
                      )}
                    </Col>
                    <Col xs={12} md={4}>
                      {renderTicketField(
                        "Status",
                        ticket.status,
                        true,
                        ["open", "in_progress", "resolved", "closed", "rejected"].map((s) => ({ value: s, label: s })),
                        (e) => {
                          setTicket((prev) => ({ ...prev, status: e.target.value }));
                          setUpdatedFields((prev) => ({ ...prev, status: e.target.value }));
                        }
                      )}
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
                    <Form.Control value={ticket.description || ""} as="textarea" rows={4} readOnly />
                  </Form.Group>
                </Form>
                {canEditTicket && (
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      onClick={updateTicket}
                      disabled={Object.keys(updatedFields).length === 0 || submitting}
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
                {/* Update History */}
                <div className="d-flex justify-content-between align-items-center">
                  <h6>Update History</h6>
                  <Button variant="outline-secondary" size="sm" onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? "Hide" : "Show"} History
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
                                  {formatFieldValue(update.field_name, update.old_value, members, teams) || "None"}
                                </span>
                              </Col>
                              <Col xs={1}><span className="text-muted">→</span></Col>
                              <Col xs={3}>
                                <span className="text-success">
                                  {formatFieldValue(update.field_name, update.new_value, members, teams) || "None"}
                                </span>
                              </Col>
                              <Col xs={2} className="text-end">
                                <small className="text-muted">
                                  {update.updated_by_name || "System"}
                                  <br />
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
                {/* Comment Form */}
                <Form onSubmit={addComment}>
                  <Form.Group className="mb-3">
                    <Form.Control as="textarea" rows={3} placeholder="Comment here" value={comment} onChange={(e) => setComment(e.target.value)} />
                  </Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Group controlId="attachment" className="w-50 me-2">
                      <Form.Label>Upload File</Form.Label>
                      <Form.Control type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </Form.Group>
                    <Form.Group className="w-50 ms-2">
                      <Form.Label>Internal</Form.Label>
                      <Dropdown onSelect={(val) => setIsInternal(val === "yes")}>
                        <Dropdown.Toggle variant={isInternal === true ? "success" : isInternal === false ? "info" : "secondary"}>
                          {isInternal === true ? "Internal (Yes)" : isInternal === false ? "External (No)" : "Select visibility"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item eventKey="yes">Internal</Dropdown.Item>
                          <Dropdown.Item eventKey="no">External</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Form.Group>
                  </div>
                  {error && <p className="text-danger">{error}</p>}
                  <Button type="submit" variant="success" disabled={submitting || (!comment && !selectedFile) || isInternal === null}>
                    {submitting ? "Submitting..." : "Add Comment"}
                  </Button>
                </Form>
                
                <hr />
                {/* Comments Section */}
                <h6>Comments</h6>
                {ticket.comments && ticket.comments.length === 0 ? (
                  <p>No comments yet.</p>
                ) : (
                  ticket.comments &&
                  ticket.comments.map((c, idx) => (
                    <Card key={idx} className={`mb-2 ${c.is_internal ? "bg-light text-dark border-danger" : "bg-light text-dark border-success"}`}>
                      <Card.Body>
                        <Row>
                          <Col xs={10}>
                            <strong>{c.commented_by}:</strong> {c.message}
                            {(c.is_internal === true || c.is_internal === 1) && (
                              <Badge bg="warning" className="ms-2">Internal</Badge>
                            )}
                            {c.attachments && c.attachments.length > 0 && (
                              <div className="mt-2">
                                <small className="text-muted">Attachments:</small>
                                <ul className="list-unstyled mt-1">
                                  {c.attachments.map((att, attIdx) => (
                                    <li key={attIdx}>
                                      <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-primary">
                                        📎 {getFilenameFromUrl(att.file_url)}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
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
                {/* Merged Tickets Section */}
                {ticket.merged_tickets && ticket.merged_tickets.length > 0 && (
                  <>
                    <hr />
                    <h6>Merged Tickets</h6>
                    <div className="mt-2">
                      {ticket.merged_tickets.map((mt) => (
                        <Card key={mt.id} className="mb-2">
                          <Card.Body>
                            <Row>
                              <Col xs={10}>
                                <strong>Ticket #{mt.id}:</strong> {mt.title}
                              </Col>
                              <Col xs={2} className="text-end">
                                <small className="text-muted">
                                  Merged by {mt.merged_by_name} on{" "}
                                  {new Date(mt.merged_at).toLocaleString()}
                                </small>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
            {/* Toast */}
            <div
              className="position-fixed top-0 end-0 p-3"
              style={{ zIndex: 11 }}
            >
              <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
                <Toast.Header>
                  <strong className="me-auto">Success!</strong>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
              </Toast>
            </div>
            {/* Merge Modal */}
            <Modal show={showMergeModal} onHide={handleCloseMergeModal}>
              <Modal.Header closeButton>
                <Modal.Title>Merge Tickets into #{ticket?.id}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Search Tickets to Merge</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by ID or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchTickets()}
                    />
                    <Button variant="primary" onClick={handleSearchTickets}>
                      Search
                    </Button>
                  </InputGroup>
                </Form.Group>
                {searchResults.length > 0 && (
                  <div className="search-results-list mb-3">
                    <h6>Search Results</h6>
                    <ul className="list-group">
                      {searchResults.map((t) => (
                        <li key={t.id} className={`list-group-item d-flex justify-content-between align-items-center ${selectedTickets.includes(t.id) ? "active" : ""}`}
                          onClick={() => handleToggleSelectTicket(t.id)}>
                          <span>#{t.id} - {t.title}</span>
                          {selectedTickets.includes(t.id) ? "✔️" : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <h6>Tickets to Merge</h6>
                <div className="selected-tickets-list">
                  {selectedTickets.length === 0 ? (
                    <p className="text-muted">No tickets selected.</p>
                  ) : (
                    selectedTickets.map((id) => {
                      const selectedTicket = searchResults.find((t) => t.id === id);
                      return (
                        <Badge key={id} bg="primary" className="me-2 mb-2">
                          #{id} {selectedTicket?.title}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseMergeModal}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleMergeTickets} disabled={mergeSubmitting || selectedTickets.length === 0}>
                  {mergeSubmitting ? "Merging..." : "Confirm Merge"}
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </Col>
      </Row>
    </>
  );
}

export default SpecificTicket;
