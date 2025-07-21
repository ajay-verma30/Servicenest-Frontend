import React, { useState, useContext, useEffect } from 'react';
import { Button, Container, Form, Modal } from 'react-bootstrap';
import './Ticket.css';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faForward,faBackward } from '@fortawesome/free-solid-svg-icons';
import { Link, useSearchParams } from 'react-router-dom';

function Ticket() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const { auth, loading } = useContext(AuthContext);
  const [errMsg, setErrMsg] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [tickets, setTickets] = useState([]);
  const [newpriority, setnewPriority] = useState('');
  const limit = 10;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const fetchTickets = async () => {
    try {
      if(auth.user.role === "admin" || auth.user.role === "agent"){
        const response = await axios.get('https://servicenest-backend.onrender.com/tickets/all-tickets', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        params: {
          status,
          priority,
          page,
          limit,
        },
      });
        setTickets(response.data.tickets || []);
      }
      else{
        const response = await axios.get('https://servicenest-backend.onrender.com/tickets/my-tickets', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        params: {
          status,
          priority,
          page,
          limit,
        },
      });
        setTickets(response.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, [status, priority, page, loading, auth]);

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        'https://servicenest-backend.onrender.com/tickets/new',
        { subject, description, priority: newpriority },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (result.status === 201) {
        setShow(false);
        setPage(1);
        fetchTickets();
      }
    } catch (e) {
      console.log(e);
      setErrMsg(e.response?.data?.message || e.message || 'Something went wrong');
      setTimeout(() => setErrMsg(''), 3000);
    }
  };


  //url Parameters update
  const updateSearchParams = (newParams) => {
  const updatedParams = {
    status,
    priority,
    page,
    ...newParams,
  };


  Object.keys(updatedParams).forEach((key) => {
    if (!updatedParams[key]) delete updatedParams[key];
  });

  setSearchParams(updatedParams);
};

  if (loading || !auth.isAuthenticated) {
    return <p className="text-center mt-5">Loading Tickets...</p>;
  }

  return (
    <>
      <Container style={{marginLeft:'151px'}}>
        <br />
        <div className="filters">
          <select onChange={(e) => {setStatus(e.target.value); setPage(1); updateSearchParams({ status: e.target.value, page: 1 });}} value={status}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          <select style={{marginLeft:"10px"}} onChange={(e) => { setPriority(e.target.value); setPage(1); updateSearchParams({ priority: e.target.value, page: 1 }); }} value={priority}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <br />

        <div className="ticket-list">
          <div className="ticket-table-container">
            {tickets.length === 0 ? (
              <p>No tickets found</p>
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
                    {tickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        style={
                          ticket.priority?.toLowerCase() === 'high' &&
                          ticket.status?.toLowerCase() === 'open'
                            ? { backgroundColor: '#f8d7da', color: '#721c24' }
                            : {}
                        }
                      >
                        <td>{ticket.id}</td>
                        <td><Link to={`/ticket/${ticket.id}`} className="ticket-link">{ticket.subject}</Link></td>
                        <td>{ticket.description}</td>
                        <td>{ticket.status}</td>
                        <td>{ticket.priority}</td>
                        <td>{new Date(ticket.created_at).toLocaleString()}</td>
                        <td>{new Date(ticket.updated_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div
                  className="pagination-controls"
                  style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}
                >
                   <FontAwesomeIcon icon={faBackward} onClick={() => {const newPage = Math.max(page - 1, 1); setPage(newPage); updateSearchParams({ page: newPage });}}/>
                  <span style={{fontSize:"10px"}}>&nbsp;&nbsp;{page}&nbsp;&nbsp;</span>
                    <FontAwesomeIcon icon={faForward} onClick={() => { const newPage = page + 1; setPage(newPage); updateSearchParams({ page: newPage }); }}/>
                </div>
              </>
            )}
          </div>
        </div>


        <Button className="floating-button" type="button" onClick={handleShow}>
          New Ticket
        </Button>
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={createTicket}>
            <Form.Group>
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Description of the issue"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Priority</Form.Label>
              <Form.Select
                aria-label="Priority"
                value={newpriority}
                onChange={(e) => setnewPriority(e.target.value)}
              >
                <option value="">--Select Priority--</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Form.Select>
            </Form.Group>
            <br />
            <Button variant="primary" type="submit">
              Create Ticket
            </Button>
          </Form>
          {errMsg && <p style={{ color: 'red', marginTop: '10px' }}>{errMsg}</p>}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Ticket;
