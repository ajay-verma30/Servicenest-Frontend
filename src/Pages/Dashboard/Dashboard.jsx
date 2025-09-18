import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { Row, Col, Card, Spinner, Alert, Button, Badge, Form } from "react-bootstrap";

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
} from "recharts";

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe"];

const cardStyle = {
  border: 'none',
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};



const TicketsByStatus = ({ data }) => (
  <Card style={cardStyle} className="h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-3">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          📊
        </div>
        <div>
          <h5 className="mb-1 fw-bold">Tickets by Status</h5>
          <p className="text-muted mb-0 small">Current distribution</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data || []}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={30}
            paddingAngle={2}
            label={({name, value}) => `${name}: ${value}`}
            labelStyle={{ fontSize: '12px', fontWeight: '600' }}
          >
            {(data || []).map((_, i) => (
              <Cell 
                key={i} 
                fill={COLORS[i % COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);

const TicketsByPriority = ({ data }) => (
  <Card style={cardStyle} className="h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-3">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}
        >
          ⚡
        </div>
        <div>
          <h5 className="mb-1 fw-bold">Priority Distribution</h5>
          <p className="text-muted mb-0 small">Urgency levels</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data || []}
            dataKey="count"
            nameKey="priority"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={30}
            paddingAngle={2}
            label={({name, value}) => `${name}: ${value}`}
            labelStyle={{ fontSize: '12px', fontWeight: '600' }}
          >
            {(data || []).map((_, i) => (
              <Cell 
                key={i} 
                fill={COLORS[(i + 2) % COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);

const TicketsCreated = ({ data }) => (
  <Card style={cardStyle} className="h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-3">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}
        >
          📈
        </div>
        <div>
          <h5 className="mb-1 fw-bold">Tickets Created</h5>
          <p className="text-muted mb-0 small">Trend over time</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={(data || []).slice().reverse()}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4facfe" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4facfe" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#4facfe"
            strokeWidth={3}
            dot={{ fill: '#4facfe', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, fill: '#4facfe' }}
            fill="url(#colorGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);

const TicketsByTeam = ({ data }) => (
  <Card style={cardStyle} className="h-100">
    <Card.Body className="p-4">
      <div className="d-flex align-items-center mb-3">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          👥
        </div>
        <div>
          <h5 className="mb-1 fw-bold">Team Performance</h5>
          <p className="text-muted mb-0 small">Tickets by team</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data || []}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#764ba2" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="team" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          />
          <Bar 
            dataKey="count" 
            fill="url(#barGradient)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card.Body>
  </Card>
);

const MetricCard = ({ icon, title, value, color, subtitle }) => (
  <Card style={cardStyle} className="h-100 text-center">
    <Card.Body className="p-4">
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
        style={{
          width: '64px',
          height: '64px',
          background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
          color: 'white',
          fontSize: '24px'
        }}
      >
        {icon}
      </div>
      <h6 className="text-muted mb-2 fw-normal">{title}</h6>
      <h2 className="fw-bold mb-1" style={{ color: color.primary }}>{value}</h2>
      {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
    </Card.Body>
  </Card>
);

function Dashboard() {
  const { accessToken, user } = useAuth();
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("30");
  const [myTickets, setMyTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
const [priorityFilter, setPriorityFilter] = useState("all");
 

  useEffect(() => {
  if (accessToken && user) {
    const fetchMyTicket = async () => {
      try {
        const id = user.id;
        const results = await axios.get(`http://localhost:3000/tickets/${id}/my`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        setMyTickets(results.data.data || []);
      } catch (error) {
        console.error("Error fetching my tickets:", error);
        setMyTickets([]);
        setErr("Failed to fetch tickets assigned to you.");
      }
    };
    fetchMyTicket();
  }
}, [accessToken, user]);

  useEffect(() => {
    if (!accessToken) navigate("/login");
  }, [accessToken, navigate]);

  useEffect(() => {
    if (orgId && accessToken) fetchOverview();
  }, [orgId, accessToken]);

  const fetchOverview = async (range = timeRange) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/tickets/${orgId}/dashboard/overview?range=${range}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setOverview(res.data.data);
      setErr(null);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setErr("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId && accessToken) fetchOverview(timeRange);
  }, [orgId, accessToken, timeRange]);

  const filteredTickets =
    overview?.recent?.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const getStatusBadgeStyle = (status) => {
    const styles = {
      open: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' },
      in_progress: { background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' },
      resolved: { background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white' },
      closed: { background: 'linear-gradient(135deg, #a8a8a8, #666666)', color: 'white' }
    };
    return styles[status] || styles.open;
  };

  const getPriorityBadgeStyle = (priority) => {
    const styles = {
      urgent: { background: 'linear-gradient(135deg, #ff416c, #ff4b2b)', color: 'white' },
      high: { background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' },
      medium: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' },
      low: { background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white' }
    };
    return styles[priority] || styles.medium;
  };

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
        <Topbar />
        <Row className="g-0">
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col
            xs={10}
            md={10}
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "80vh" }}
          >
            <div className="text-center">
              <Spinner 
                animation="border" 
                variant="primary" 
                style={{ width: '3rem', height: '3rem' }}
              />
              <p className="mt-3 text-muted">Loading your dashboard...</p>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
        <Topbar />
        <Row className="g-0">
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="p-4">
            <Alert
              variant="danger"
              className="d-flex justify-content-between align-items-center"
              style={{ borderRadius: '12px', border: 'none' }}
            >
              {err}
              <Button size="sm" onClick={fetchOverview} style={{ borderRadius: '8px' }}>
                Retry
              </Button>
            </Alert>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <Topbar />
      <Row className="g-0">
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="content p-4">
          <div className="mb-4">
            <h1 className="fw-bold mb-2" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem'
            }}>
              📊 Dashboard Overview
            </h1>
            <p className="text-muted lead">Monitor your organization's ticket performance</p>
          </div>


          {user && (
            <Card style={cardStyle} className="mb-4">
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: '56px',
                          height: '56px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontSize: '24px'
                        }}
                      >
                        👋
                      </div>
                      <div>
                        <h4 className="mb-1 fw-bold">Welcome back, {user.email}!</h4>
                      
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <Form.Select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      style={{ 
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        padding: '12px 16px'
                      }}
                    >
                      <option value="1">Today</option>
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="365">This Year</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Row className="mb-5 g-4">
            <Col md={4}>
              <MetricCard
                icon="🎫"
                title="Total Tickets"
                value={overview?.totalTickets || 0}
                color={{ primary: '#667eea', secondary: '#764ba2' }}
                subtitle="All time"
              />
            </Col>
            <Col md={4}>
              <MetricCard
                icon="🔓"
                title="Open Tickets"
                value={overview?.openTickets || 0}
                color={{ primary: '#f093fb', secondary: '#f5576c' }}
                subtitle="Needs attention"
              />
            </Col>
            <Col md={4}>
              <MetricCard
                icon="✅"
                title="Resolved"
                value={overview?.resolvedTickets || 0}
                color={{ primary: '#4facfe', secondary: '#00f2fe' }}
                subtitle="Completed"
              />
            </Col>
          </Row>

          <Row className="mb-5 g-4">
            <Col md={6}>
              <TicketsByStatus data={overview?.status} />
            </Col>
            <Col md={6}>
              <TicketsByPriority data={overview?.priority} />
            </Col>
          </Row>

          <Row className="mb-5 g-4">
            <Col md={6}>
              <TicketsCreated data={overview?.daily} />
            </Col>
            <Col md={6}>
              <TicketsByTeam data={overview?.teams} />
            </Col>
          </Row>


          <Card style={cardStyle}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}
                  >
                    📋
                  </div>
                  <div>
                    <h4 className="mb-1 fw-bold">Recent Tickets</h4>
                    <p className="text-muted mb-0">Latest 10 tickets assigned to You</p>
                  </div>
                </div>
              </div>

              <Form.Control
                type="text"
                placeholder="🔍 Search tickets..."
                className="mb-4"
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  borderRadius: '12px',
                  border: '2px solid #e9ecef',
                  padding: '12px 20px',
                  fontSize: '16px'
                }}
              />

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                      <th className="fw-bold text-muted py-3">#</th>
                      <th className="fw-bold text-muted py-3">Title</th>
                      <th className="fw-bold text-muted py-3">Status</th>
                      <th className="fw-bold text-muted py-3">Priority</th>
                      <th className="fw-bold text-muted py-3">Updated</th>
                      <th className="fw-bold text-muted py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTickets.length > 0 ? (
                      myTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          style={{ 
                            cursor: "pointer",
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={() => navigate(`/${orgId}/ticket/${ticket.id}`)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td className="py-3">
                            <Badge 
                              bg="light" 
                              text="dark" 
                              style={{ 
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontWeight: 'bold'
                              }}
                            >
                              #{ticket.id}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="fw-semibold">{ticket.title}</div>
                          </td>
                          <td className="py-3">
                            <Badge 
                              style={{
                                ...getStatusBadgeStyle(ticket.status),
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge 
                              style={{
                                ...getPriorityBadgeStyle(ticket.priority),
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {ticket.priority}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted">
                            {new Date(ticket.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 text-muted">
                            {new Date(ticket.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="text-muted">
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                            <h5>No tickets found</h5>
                            <p>Try adjusting your search or create a new ticket</p>
                          </div>
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
    </div>
  );
}

export default Dashboard;