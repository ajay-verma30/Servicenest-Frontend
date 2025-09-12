import React, { useState, useEffect, useMemo } from "react";
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

  const sortedTickets = useMemo(() => {
    const sorted = [...tickets];

    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      case "priority":
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return sorted.sort(
          (a, b) =>
            (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        );
      case "status":
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case "alpha":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [tickets, sortBy]);

  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="content">
          <Container className="my-5">
            <div className="d-flex justify-content-end mb-3">
              <Button
                as={Link}
                to={`/${orgId}/create-ticket`}
                variant="primary"
              >
                Create Ticket
              </Button>
            </div>

            <Row className="mb-3 align-items-center">
              <Col xs={12} md={4}>
                <h2 className="mb-0">All Tickets</h2>
              </Col>
              <Col xs={12} md={4}>
                <Form.Control
                  type="text"
                  placeholder="Search tickets using subject..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-100"
                />
              </Col>
              <Col xs={12} md={4}>
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

            {err && <p className="text-danger text-center">{err}</p>}

            {sortedTickets.length > 0 ? (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned to</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() =>
                        navigate(`/${orgId}/ticket/${ticket.id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <Link to={`/${orgId}/ticket/${ticket.id}`}>
                          {ticket.title}
                        </Link>
                      </td>
                      <td>{ticket.description}</td>
                      <td>
                        <Badge bg={getStatusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getPriorityVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td>{ticket.assignee_name || "Unassigned"}</td>
                      <td>
                        {ticket.created_at
                          ? new Date(ticket.created_at).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-center">No tickets found.</p>
            )}
          </Container>
        </Col>
      </Row>
    </>
  );
}

export default Tickets;
