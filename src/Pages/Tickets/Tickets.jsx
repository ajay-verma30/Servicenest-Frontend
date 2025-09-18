"use client";

import { useState, useEffect, useMemo } from "react";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import {
  Row,
  Col,
  Table,
  Badge,
  Form,
  Container,
  Button,
  Card,
} from "react-bootstrap";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import { useNavigate, useSearchParams, Link, useParams } from "react-router-dom";

function Tickets() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { orgId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [tickets, setTickets] = useState([]);
  const [err, setErr] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (!accessToken) navigate("/login");
  }, [accessToken, navigate]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "open":
        return "primary";
      case "in_progress":
        return "warning";
      case "resolved":
        return "success";
      case "closed":
      case "rejected":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return "fas fa-circle-dot";
      case "in_progress":
        return "fas fa-spinner";
      case "resolved":
        return "fas fa-check-circle";
      default:
        return "fas fa-question-circle";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "fas fa-exclamation-triangle";
      case "medium":
        return "fas fa-minus-circle";
      case "low":
        return "fas fa-arrow-down";
      default:
        return "fas fa-circle";
    }
  };

  // Fetch tickets
  useEffect(() => {
    const getTickets = async () => {
      if (!accessToken || !orgId) return;
      try {
        const results = await axios.get(
          `http://localhost:3000/tickets/${orgId}/all`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { search: searchTerm },
          }
        );
        setTickets(results.data.data || []);
        setErr(null);
      } catch (e) {
        console.error("Error fetching tickets:", e);
        setErr("Error fetching tickets");
      }
    };
    getTickets();
  }, [accessToken, orgId, searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) setSearchParams({ search: value });
    else setSearchParams({});
  };

  // Sorting
  const sortedTickets = useMemo(() => {
    const sorted = [...tickets];
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case "oldest":
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case "priority":
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return sorted.sort(
          (a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
        );
      case "status":
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case "alpha":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [tickets, sortBy]);

  // Filtering
  const filteredTickets = useMemo(() => {
    return sortedTickets
      .filter((t) => statusFilter === "all" || t.status === statusFilter)
      .filter((t) => priorityFilter === "all" || t.priority === priorityFilter);
  }, [sortedTickets, statusFilter, priorityFilter]);

  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="content">
          <Container className="my-5">
            {/* Header */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={6}>
                    <h2 className="mb-0">
                      <i className="fas fa-ticket-alt me-2 text-primary"></i>
                      All Tickets
                    </h2>
                    <small className="text-muted">
                      {filteredTickets.length} ticket
                      {filteredTickets.length !== 1 ? "s" : ""} found
                    </small>
                  </Col>
                  <Col xs={12} md={6} className="text-end">
                    <Button
                      as={Link}
                      to={`/${orgId}/create-ticket`}
                      variant="primary"
                      className="shadow-sm"
                    >
                      <i className="fas fa-plus me-2"></i>
                      Create Ticket
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Filters */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={4} className="mb-2">
                    <Form.Group>
                      <div className="position-relative">
                        <i
                          className="fas fa-search position-absolute"
                          style={{
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6c757d",
                          }}
                        ></i>
                        <Form.Control
                          type="text"
                          placeholder="Search tickets by subject..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="ps-5"
                          style={{ paddingLeft: "2.5rem" }}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={2} className="mb-2">
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </Form.Select>
                  </Col>
                  <Col xs={6} md={2} className="mb-2">
                    <Form.Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Form.Select>
                  </Col>
                  <Col xs={12} md={4} className="mb-2">
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="priority">Priority (High → Low)</option>
                      <option value="status">Status (A → Z)</option>
                      <option value="alpha">Alphabetical (A → Z)</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Tickets Table */}
            {err && (
              <Card className="mb-4 border-danger">
                <Card.Body className="text-center">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                  <span className="text-danger">{err}</span>
                </Card.Body>
              </Card>
            )}

            {filteredTickets.length > 0 ? (
              <Card className="shadow-sm">
                <Card.Body className="p-0">
                  <Table striped hover responsive className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 py-3">Subject</th>
                        <th className="border-0 py-3">Description</th>
                        <th className="border-0 py-3">Status</th>
                        <th className="border-0 py-3">Priority</th>
                        <th className="border-0 py-3">Assigned to</th>
                        <th className="border-0 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          onClick={() =>
                            navigate(`/${orgId}/ticket/${ticket.id}`)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <td className="py-3">
                            <Link
                              to={`/${orgId}/ticket/${ticket.id}`}
                              className="text-decoration-none fw-medium"
                            >
                              {ticket.title}
                            </Link>
                          </td>
                          <td className="py-3">
                            <span className="text-muted">
                              {ticket.description?.length > 50
                                ? `${ticket.description.substring(0, 50)}...`
                                : ticket.description}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge
                              bg={getStatusVariant(ticket.status)}
                              className="d-flex align-items-center gap-1"
                              style={{ width: "fit-content" }}
                            >
                              <i className={getStatusIcon(ticket.status)}></i>
                              {ticket.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge
                              bg={getPriorityVariant(ticket.priority)}
                              className="d-flex align-items-center gap-1"
                              style={{ width: "fit-content" }}
                            >
                              <i className={getPriorityIcon(ticket.priority)}></i>
                              {ticket.priority}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {ticket.assignee_name || "Unassigned"}
                          </td>
                          <td className="py-3">
                            <small className="text-muted">
                              {ticket.created_at
                                ? new Date(ticket.created_at).toLocaleString()
                                : "N/A"}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ) : (
              <Card className="text-center py-5">
                <Card.Body>
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No tickets found</h5>
                  <p className="text-muted">
                    Try adjusting your search criteria or create a new ticket.
                  </p>
                </Card.Body>
              </Card>
            )}
          </Container>
        </Col>
      </Row>

      <style jsx>{`
        .hover-row:hover {
          background-color: #f8f9fa !important;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }

        .position-relative .fas {
          z-index: 10;
        }
      `}</style>
    </>
  );
}

export default Tickets;
