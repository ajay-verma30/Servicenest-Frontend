import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Col, Row, Form, Container, Button } from 'react-bootstrap';

function SpecificTicket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { auth, loading } = useContext(AuthContext);

  const [ticket, setTicket] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [type, setType] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth, navigate, loading]);

  useEffect(() => {
    if (!auth.isAuthenticated || loading) return;

    const fetchTicketData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        setTicket(response.data.ticket);
      } catch (err) {
        console.error('Failed to fetch ticket', err);
        setErrMsg('Unable to load ticket. Please try again.');
      }
    };

    fetchTicketData();
  }, [auth, id, loading]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/comments/comments?ticketId=${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && id) {
      fetchComments();
    }
  }, [auth, id]);

  const commentSubmit = async (e) => {
    e.preventDefault();
    try {
      const inInternal = type === 'internal';

      await axios.post(
        'http://localhost:3000/comments/new',
        {
          comment,
          inInternal,
          ticketId: id
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );

      setComment('');
      setType('');
      await fetchComments(); // Refresh comments
    } catch (e) {
      console.error(e);
      setErrMsg('Unable to add comment. Please try again.');
    }
  };

  if (loading || !auth.isAuthenticated) {
    return <p className="text-center mt-5">Loading profile...</p>;
  }

  if (errMsg) {
    return <p className="text-danger text-center mt-5">{errMsg}</p>;
  }

  if (!ticket) {
    return <p className="text-center mt-5">Loading ticket...</p>;
  }

  return (
    <div className="specific-ticket">
      <Container>
        <Form>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Ticket Id</Form.Label>
                <Form.Control value={ticket.id} type="text" readOnly />
              </Form.Group>
            </Col>
            <Col md={4}></Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Created At</Form.Label>
                <Form.Control value={new Date(ticket.created_at).toUTCString()} type="text" readOnly />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Updated At</Form.Label>
                <Form.Control value={new Date(ticket.updated_at).toUTCString()} type="text" readOnly />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Created By</Form.Label>
                <Form.Control value={ticket.user_id} type="text" readOnly />
              </Form.Group>
            </Col>
            <Col md={4}></Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Control value={ticket.status} type="text" readOnly />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Priority</Form.Label>
                <Form.Control value={ticket.priority} type="text" readOnly />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group>
            <Form.Label>Subject</Form.Label>
            <Form.Control value={ticket.subject} type="text" readOnly />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={5} value={ticket.description} readOnly />
          </Form.Group>
        </Form>

        <hr />
        <h5>Add Comment</h5>
        <Form onSubmit={commentSubmit}>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Add your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
          <br />
          <Row>
            <Col md={2}>
              <Form.Group>
                <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">--Comment Type--</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button type="submit" className="btn-success">
                Submit
              </Button>
            </Col>
          </Row>
        </Form>

        <hr />
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.commentId} className="comment-block mb-3 p-3 bg-light rounded">
              <Row>
                <Col md={8}>
                  <p>{c.comment}</p>
                  <span className={`badge ${c.inInternal ? 'bg-secondary' : 'bg-info text-dark'}`}>
                  {c.inInternal ? 'Internal' : 'External'}
              </span>
                </Col>
                <Col md={4}>
                     <p><strong>{c.commented_by}</strong> ({new Date(c.created_at).toLocaleString()})</p>
                </Col>
              </Row>
            </div>
          ))
        )}
      </Container>
    </div>
  );
}

export default SpecificTicket;
