import React, { useEffect, useState } from 'react'
import Topbar from '../../Components/Topbar/Topbar'
import { Row, Col, Container, Form, Button } from 'react-bootstrap'
import Sidebar from '../../Components/SideBar/Sidebar'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'
import './Team.css'

function CreateTicket() {
  const { accessToken, user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
  }, [accessToken])

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage(null);

  const created_by = user.id;
  const organization_id = user.orgId;
  console.log(organization_id)

  try {
    const result = await axios.post(
      "http://localhost:3000/teams/new",
      {
        title,
        description,
        organization_id,
        created_by
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (result.status === 201) {
      setTitle("");
      setDescription("");
    }
  } catch (error) {
    console.error(error);
    setMessage("Failed to create ticket. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className='content'>
          <Container>
            <div className='new-ticket-container'>
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Team title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={5}
                    placeholder='Description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Button
                  type='submit'
                  className='btn btn-success'
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
                {message && (
                  <p
                    className={
                      message.includes('success')
                        ? 'text-success mt-3'
                        : 'text-danger mt-3'
                    }
                  >
                    {message}
                  </p>
                )}
              </Form>
            </div>
          </Container>
        </Col>
      </Row>
    </>
  )
}

export default CreateTicket
