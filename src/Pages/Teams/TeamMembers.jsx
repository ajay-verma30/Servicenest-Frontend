import React, { useEffect, useState } from "react";
import { Row, Col, Table, Spinner, Alert, Button } from "react-bootstrap";
import Topbar from "../../Components/Topbar/Topbar";
import Sidebar from "../../Components/SideBar/Sidebar";
import { useAuth } from "../../Context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const { accessToken } = useAuth();
  const { orgId, teamId } = useParams();

  useEffect(() => {
    const fetchMembers = async () => {
  try {
    setLoading(true);
    setError(null); // reset error
    const res = await axios.get(
      `http://localhost:3000/teams/${orgId}/teams/${teamId}/members`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    setMembers(res.data.members || []);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to load team members");
  } finally {
    setLoading(false);
  }
};

    if (accessToken && orgId && teamId) {
      fetchMembers();
    }
  }, [accessToken, orgId, teamId]);

  const updateUser = async (e, userId) => {
  e.preventDefault();
  try {
    setMessage("");
    setLoading(true); // optional spinner during deletion

    const res = await axios.patch(
      `http://localhost:3000/teams/${orgId}/teams/${teamId}/removeMember/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.data.success) {
      setMessage("✅ User removed from team successfully!");
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } else {
      setMessage("⚠️ Failed to remove user from team.");
    }
  } catch (err) {
    console.error("Error removing user:", err);
    setMessage(err.response?.data?.message || "❌ Error removing user");
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
        <Col xs={10} md={10} className="content p-4">
          <h3>Team Members</h3>

          {message && <Alert variant="info">{message}</Alert>}

          {loading && (
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading members...
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && !error && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.map((m) => (
                    <tr key={m.id}>
                      <td>{m.full_name}</td>
                      <td>{m.email}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => updateUser(e, m.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </>
  );
}

export default TeamMembers;
