import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faHandPaper, faListUl } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { analytics } from '../../Context/Analytics';

function Dashboard() {
  const navigate = useNavigate();
  const { auth, loading } = useContext(AuthContext);
  const [tsummary, settSummary] = useState(null);
  const [assigned_to, setAssigned_to] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);

  useEffect(() => {
    if (loading) return;

    analytics.page("Dashboard page", {
      url: window.location.href
    });

    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }

    const ticketSummary = async () => {
      try {
        const results = await axios.get('https://servicenest-backend.onrender.com/tickets/my-tickets-summary', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        settSummary(results.data.summary);
      } catch (error) {
        console.error("Error fetching ticket summary:", error);
      }
    };

    ticketSummary();
  }, [auth, navigate, loading]);

  useEffect(() => {
    const getAssigned = async () => {
      try {
        const results = await axios.get("https://servicenest-backend.onrender.com/tickets/assigned-to-me", {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        if (results.status === 200) {
          setAssigned_to(results.data.results);
        }
      } catch (e) {
        console.log("API Error:", e);
      }
    };

    if (auth?.token && (auth.user.role === "admin" || auth.user.role === "agent")) {
      getAssigned();
    }
  }, [auth]);

  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        const response = await axios.get("https://servicenest-backend.onrender.com/tickets/my-tickets?status=open", {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        if (response.status === 200) {
          setOpenTickets(response.data.tickets);
        }
      } catch (err) {
        console.error("Failed to fetch open tickets:", err.response?.data || err.message);
      }
    };

    if (auth?.token && auth.user.role === "user") {
      fetchOpenTickets();
    }
  }, [auth]);

  if (loading || !auth.isAuthenticated) {
    return <p className="text-center mt-5">Loading profile...</p>;
  }

  if (!tsummary) {
    return <p className="text-center mt-5">Loading summary...</p>;
  }

  return (
    <div className="dashboard-content" style={{ marginLeft: '151px' }}>
      <h1 className='dashboard-username'>
        Welcome back, Ajay <FontAwesomeIcon icon={faHandPaper} className='hand-wave' />
      </h1>

      <Row>
        <Col xs={12} md={12}>
          <Row>
            <Col xs={12} md={4}>
              <Card>
                <Card.Header>
                  <Row>
                    <Col xs={4} md={2} className='engagement-icon-container'>
                      <FontAwesomeIcon icon={faListUl} className='engagement-icon' />
                    </Col>
                    <Col xs={8} md={10}>
                      <h4>Total Open</h4>
                      <h1>{tsummary.open}</h1>
                    </Col>
                  </Row>
                </Card.Header>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card>
                <Card.Header>
                  <Row>
                    <Col xs={4} md={2} className='pending-icon-container'>
                      <FontAwesomeIcon icon={faClock} className='pending-icon' />
                    </Col>
                    <Col xs={8} md={10}>
                      <h4>High Priority</h4>
                      <h1>{tsummary.high}</h1>
                    </Col>
                  </Row>
                </Card.Header>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card>
                <Card.Header>
                  <Row>
                    <Col xs={4} md={2} className='completed-icon-container'>
                      <FontAwesomeIcon icon={faCircleCheck} className='completed-icon' />
                    </Col>
                    <Col xs={8} md={10}>
                      <h4>Closed</h4>
                      <h1>{tsummary.closed}</h1>
                    </Col>
                  </Row>
                </Card.Header>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <div className="bottom-rows">
        <div className="today-tasks">
          {(auth.user.role === "admin" || auth.user.role === "agent") ? (
            <div className="assigned-ticket-list">
              <h4>Assigned To Me:</h4>
              {assigned_to.length === 0 ? (
                <p>No assigned tickets found.</p>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Created On</th>
                      <th>Updated On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assigned_to.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>{ticket.id}</td>
                        <td>{ticket.subject}</td>
                        <td>{ticket.description}</td>
                        <td>{ticket.status}</td>
                        <td>{ticket.priority}</td>
                        <td>{new Date(ticket.created_at).toLocaleString()}</td>
                        <td>{new Date(ticket.updated_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="my-unclosed-ticket-list">
              <h4>My Unclosed Tickets:</h4>
              {openTickets.length === 0 ? (
                <p>No open tickets found.</p>
              ) : (
                <>
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Subject</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created On</th>
                        <th>Updated On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openTickets.slice(0, 5).map((ticket) => (
                        <tr key={ticket.id}>
                          <td>{ticket.id}</td>
                          <td>{ticket.subject}</td>
                          <td>{ticket.description}</td>
                          <td>{ticket.status}</td>
                          <td>{ticket.priority}</td>
                          <td>{new Date(ticket.created_at).toLocaleString()}</td>
                          <td>{new Date(ticket.updated_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {openTickets.length > 5 && (
                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                      <Link to="/tickets?status=open" className="btn btn-sm btn-primary">
                        View All
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
