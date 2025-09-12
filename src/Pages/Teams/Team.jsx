import React, { useState, useEffect, useMemo } from "react";
import "./Team.css";
import Topbar from "../../Components/Topbar/Topbar";
import { Row, Col, Form, Container, Table, Button } from "react-bootstrap";
import Sidebar from "../../Components/SideBar/Sidebar";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";

function Teams() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const { orgId } = useParams();

  const [teams, setTeams] = useState([]);
  const [err, setErr] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("alpha");

  useEffect(() => {
    if (!accessToken) navigate("/login");
  }, [accessToken, navigate]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/tickets/${orgId}/teams`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setTeams(res.data.data || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setErr("Error fetching teams");
      }
    };

    if (accessToken && orgId) fetchTeams();
  }, [accessToken, orgId]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const sortedTeams = useMemo(() => {
    let filtered = teams.filter((t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case "alpha":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "newest":
        return filtered.sort((a, b) => b.id.localeCompare(a.id)); 
      case "oldest":
        return filtered.sort((a, b) => a.id.localeCompare(b.id));
      default:
        return filtered;
    }
  }, [teams, searchTerm, sortBy]);

  return (
    <>
      <Topbar />
      <Row>
        <Col xs={2} md={2}>
          <Sidebar />
        </Col>
        <Col xs={10} md={10} className="content">
          <Container className="my-5">
            <div className="d-flex justify-content-end">
                  <Button as={Link} to={`/${orgId}/create-team`} variant="primary" className="create-btn">
                    Create Team
                  </Button>
                </div>
                <br/>
            <Row className="mb-3 align-items-center">
              <Col xs={12} md={4}>
                <h2 className="mb-0">All Teams</h2>
              </Col>
              <Col xs={12} md={4}>
                <Form.Control
                  type="text"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-100"
                />
              </Col>
              <Col xs={12} md={4}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="alpha">Alphabetical (A → Z)</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </Form.Select>
              </Col>
            </Row>

            {err && <p className="text-danger text-center">{err}</p>}

            {sortedTeams.length > 0 ? (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((team) => (
                    <tr key={team.id}>
                      <td>{team.title}</td>
                      <td>
                        <Button
                          as={Link}
                          to={`/${orgId}/teams/${team.id}/users`}
                          variant="info"
                          size="sm"
                        >
                          View Members
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-center">No teams found.</p>
            )}
          </Container>
        </Col>
      </Row>
    </>
  );
}

export default Teams;
