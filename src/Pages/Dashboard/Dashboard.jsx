import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";

import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { Row, Col, Card, Spinner, Alert } from "react-bootstrap";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

function Dashboard() {
  const { accessToken, user } = useAuth();
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/tickets/${orgId}/dashboard/overview`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(res);
        setOverview(res.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setErr("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (orgId && accessToken) fetchOverview();
  }, [orgId, accessToken]);

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#8884D8"];

  if (loading) {
    return (
      <>
        <Topbar />
        <Row>
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col
            xs={10}
            md={10}
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "80vh" }}
          >
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      </>
    );
  }

  if (err) {
    return (
      <>
        <Topbar />
        <Row>
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="p-4">
            <Alert variant="danger">{err}</Alert>
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
          <h2 className="mb-3">📊 Organization Dashboard</h2>

          {user && (
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <h5 className="mb-2">Welcome, {user.email}</h5>
                <p className="mb-1">
                  Role: <strong>{user.role}</strong>
                </p>
              </Card.Body>
            </Card>
          )}

          <Row className="mb-4">
            {/* Status Pie Chart */}
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Tickets by Status</h5>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={overview.status || []}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {(overview.status || []).map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            {/* Priority Pie Chart */}
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Tickets by Priority</h5>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={overview.priority || []}
                        dataKey="count"
                        nameKey="priority"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {(overview.priority || []).map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            {/* Daily Line Chart */}
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Tickets Created (Last 30 Days)</h5>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={(overview.daily || []).slice().reverse()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#007bff"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            {/* Team Bar Chart */}
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Tickets by Team</h5>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={overview.teams || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="team" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#28a745" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Last 10 Tickets Table */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">📋 Last 10 Tickets</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.recent && overview.recent.length > 0 ? (
                          overview.recent.map((ticket, index) => (
                            <tr key={ticket.id}>
                              <td>{ticket.id}</td>
                              <td>{ticket.title}</td>
                              <td>
                                <span
                                  className={`badge bg-${
                                    ticket.status === "open"
                                      ? "primary"
                                      : ticket.status === "in_progress"
                                      ? "warning"
                                      : ticket.status === "resolved"
                                      ? "success"
                                      : "secondary"
                                  }`}
                                >
                                  {ticket.status}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge bg-${
                                    ticket.priority === "high"
                                      ? "danger"
                                      : ticket.priority === "urgent"
                                      ? "dark"
                                      : ticket.priority === "medium"
                                      ? "info"
                                      : "secondary"
                                  }`}
                                >
                                  {ticket.priority}
                                </span>
                              </td>
                              <td>
                                {new Date(ticket.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">
                              No recent tickets found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

export default Dashboard;
