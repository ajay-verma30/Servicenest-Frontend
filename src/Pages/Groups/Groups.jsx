import { useState, useEffect } from "react"
import "./Groups.css"
import Topbar from "../../Components/Topbar/Topbar"
import { Row, Col, Table, Spinner, Alert, Card, Container, Badge, Button } from "react-bootstrap"
import Sidebar from "../../Components/SideBar/Sidebar"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../Context/AuthContext"

function Groups() {
  const { accessToken } = useAuth()
  const { orgId } = useParams()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/groups/all/${orgId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setGroups(res.data.data)
        setErr(null)
      } catch (error) {
        console.error("Error fetching groups:", error)
        if (error.response) {
          setErr(error.response.data.message || "Failed to fetch groups.")
        } else if (error.request) {
          setErr("No response from server. Please try again later.")
        } else {
          setErr("Unexpected error occurred.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [accessToken, orgId])

  const handleRowClick = (groupId) => {
    navigate(`/${orgId}/group/${groupId}`)
  }

  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="content">
          <Container fluid className="py-4">
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={6}>
                    <h2 className="mb-0">
                      <i className="fas fa-ticket-alt me-2 text-primary"></i>
                      All Groups
                    </h2>
                  </Col>
                  <Col xs={12} md={6} className="text-end">
                    <Button href={`/${orgId}/group/create`} variant="primary" className="shadow-sm">
                      <i className="fas fa-plus me-2"></i>
                      Create Group
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <div className="d-flex align-items-center">
                  <i className="fas fa-list me-2"></i>
                  <h5 className="mb-0">All Groups</h5>
                  {!loading && !err && (
                    <Badge bg="secondary" className="ms-auto">
                      {groups.length} {groups.length === 1 ? "Group" : "Groups"}
                    </Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {/* Loader */}
                {loading && (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <Spinner animation="border" role="status" className="mb-3">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="text-muted">Loading groups...</p>
                  </div>
                )}

                {/* Error */}
                {!loading && err && (
                  <div className="p-4">
                    <Alert variant="danger" className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {err}
                    </Alert>
                  </div>
                )}

                {/* Groups Table */}
                {!loading && !err && groups.length > 0 && (
                  <Table striped hover responsive className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: "60px" }}>
                          <i className="fas fa-hashtag me-1"></i>#
                        </th>
                        <th>
                          <i className="fas fa-tag me-1"></i>Title
                        </th>
                        <th>
                          <i className="fas fa-align-left me-1"></i>Description
                        </th>
                        <th>
                          <i className="fas fa-user me-1"></i>Created By
                        </th>
                        <th>
                          <i className="fas fa-calendar me-1"></i>Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((group, index) => (
                        <tr
                          key={group.id}
                          onClick={() => handleRowClick(group.id)}
                          style={{ cursor: "pointer" }}
                          className="table-row-hover"
                        >
                          <td className="text-muted">{index + 1}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-folder text-primary me-2"></i>
                              <strong>{group.title}</strong>
                            </div>
                          </td>
                          <td className="text-muted">{group.description}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-user-circle text-secondary me-2"></i>
                              {group.created_by}
                            </div>
                          </td>
                          <td className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {new Date(group.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                {/* Empty state */}
                {!loading && !err && groups.length === 0 && (
                  <div className="text-center py-5">
                    <i className="fas fa-users text-muted mb-3" style={{ fontSize: "3rem" }}></i>
                    <Alert variant="info" className="d-inline-block">
                      <i className="fas fa-info-circle me-2"></i>
                      No groups found for this organization.
                    </Alert>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Container>
        </Col>
      </Row>

   
    </>
  )
}

export default Groups
