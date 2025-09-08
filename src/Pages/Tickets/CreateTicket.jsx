import React, { useEffect, useState } from 'react'
import Topbar from '../../Components/Topbar/Topbar'
import { Row, Col, Container, Form, Button } from 'react-bootstrap'
import Sidebar from '../../Components/SideBar/Sidebar'
import './Tickets.css'
import axios from 'axios'
import { useAuth } from '../../Context/AuthContext'

function CreateTicket() {
  const { accessToken, user } = useAuth()
  const [type, setType] = useState('')
  const [priority, setPriority] = useState('')
  const [title, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
  }, [accessToken])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const created_by = user.id;
    try {
      const result = await axios.post("http://localhost:3000/tickets/new",{title, description, type, priority, created_by},{
        headers:{
            "Authorization":`Bearer ${accessToken}`
        }
      })
      if(result.status === 201){
        setSubject("");
        setPriority("");
        setType("");
        setDescription("");
      }
    } catch (error) {
      console.error(error)
      setMessage('Failed to create ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
                <Row>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label>Ticket Type</Form.Label>
                      <Form.Select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value=''>Select type</option>
                        <option value='bug'>Bug</option>
                        <option value='feature_request'>Feature Request</option>
                        <option value='support'>Support</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group>
                      <Form.Label>Ticket Priority</Form.Label>
                      <Form.Select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value=''>Select priority</option>
                        <option value='urgent'>Urgent</option>
                        <option value='high'>High</option>
                        <option value='medium'>Medium</option>
                        <option value='low'>Low</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <br />
                <Form.Group>
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Subject'
                    value={title}
                    onChange={(e) => setSubject(e.target.value)}
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
                <Form.Group>
                  <Form.Label>Attachments</Form.Label>
                  <br />
                  <input
                    type='file'
                    onChange={(e) => setAttachment(e.target.files[0])}
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
