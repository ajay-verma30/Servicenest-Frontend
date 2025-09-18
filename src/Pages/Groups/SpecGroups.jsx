import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../Context/AuthContext"
import Topbar from "../../Components/Topbar/Topbar"
import Sidebar from "../../Components/SideBar/Sidebar"
import { Col, Row, Container, Card, Spinner, Alert, Form } from "react-bootstrap"

function SpecGroups() {
  const { id: groupId, orgId } = useParams()
  const { accessToken } = useAuth()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true)
      setErr(null)
      try {
        const res = await axios.get(`http://localhost:3000/groups/${orgId}/${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        setGroup(res.data.data)
      } catch (error) {
        console.error("Error fetching group details:", error)
        if (error.response) {
          setErr(error.response.data.message || "Failed to fetch group details.")
        } else if (error.request) {
          setErr("Network error. Please check your connection and try again.")
        } else {
          setErr("An unexpected error occurred. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }
    if (groupId && orgId && accessToken) {
      fetchGroup()
    }
  }, [orgId, groupId, accessToken])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3" />
            <p className="text-muted">Loading group details...</p>
          </div>
        </div>
      )
    }

    if (err) {
      return (
        <Alert variant="danger" className="text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {err}
        </Alert>
      )
    }

    if (!group) {
      return (
        <Alert variant="info" className="text-center">
          <i className="fas fa-info-circle me-2"></i>
          No group details available.
        </Alert>
      )
    }

    return (
      <Card className="shadow-sm">
        <Card.Header>
          <h4 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Group Details
          </h4>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-heading me-2"></i>
                Title
              </Form.Label>
              <Form.Control type="text" value={group.title || ""} readOnly className="bg-light" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-align-left me-2"></i>
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={group.description || "No description provided"}
                readOnly
                className="bg-light"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-user me-2"></i>
                    Created By
                  </Form.Label>
                  <Form.Control type="text" value={group.created_by || "Unknown"} readOnly className="bg-light" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-calendar me-2"></i>
                    Created At
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={new Date(group.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>

          </Form>
        </Card.Body>
      </Card>
    )
  }

  return (
    <>
      <Topbar />
      <Container fluid className="p-0">
        <Row className="g-0">
          <Col xs={2} md={2} className="p-0">
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="content bg-light p-4" style={{ minHeight: "100vh" }}>
            {renderContent()}
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default SpecGroups
