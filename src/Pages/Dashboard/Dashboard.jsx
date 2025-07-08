import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Context/AuthContext'
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap'
import './Dashboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faHandPaper, faListUl } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const { auth, loading } = useContext(AuthContext);
  const [tsummary, settSummary] = useState(null);

  useEffect(() => {
    if (loading) return;
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
                    <Col xs={4} md={2} className='pending-icon-container'>
                      <FontAwesomeIcon icon={faClock} className='pending-icon' />
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
                    <Col xs={4} md={2} className='engagement-icon-container'>
                      <FontAwesomeIcon icon={faListUl} className='engagement-icon' />
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
          <h4>Tasks for Today</h4>
        </div>
        <div className="recent-submissions">
          <h4>Recent Submissions</h4>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
