import React, { useEffect, useState } from 'react';
import './Profile.css';
import Topbar from '../../Components/Topbar/Topbar';
import Sidebar from '../../Components/SideBar/Sidebar';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useAuth } from '../../Context/AuthContext';

function Profile() {
  const { user, accessToken, api } = useAuth(); 
  const [myUser, setMyUser] = useState(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const getMyUser = async () => {
      try {
        if (!user || !accessToken) return; 
        const result = await api.get(`/user/${user.id}`,{
            headers:{
                'Authorization': `Bearer ${accessToken}`
            }
        });
                console.log(result.data.result[0]);
        setMyUser(result.data.result[0]);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    getMyUser();
  }, [user, accessToken, api]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordUpdate = async () => {
    try {
      if (!password.trim()) return alert('Password cannot be empty');

      await api.put(`/user/${user.id}/password`, { password });

      alert('Password updated successfully');
      setPassword('');
    } catch (err) {
      console.error('Password update failed:', err);
      alert('Failed to update password');
    }
  };

  const profile = myUser || user;

  return (
    <>
      <Topbar />
      <div>
        <Row>
          <Col xs={2} md={2}>
            <Sidebar />
          </Col>
          <Col xs={10} md={10} className="profile-content">
            <Container className="profile-container mt-4">
              <Row>
                <Col md={4} className="text-center">
                  <img
                    src={profile?.photoURL || '/default-avatar.png'}
                    alt="Profile"
                    className="profile-picture mb-3"
                  />
                </Col>
                <Col md={8}>
                  <Card>
                    <Card.Body>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={profile?.full_name || ''}
                            readOnly
                          />
                        </Form.Group>

                        <Row>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={profile?.email || ''}
                                    readOnly
                                />
                        </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3">
                                <Form.Label>Contact</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={profile?.contact || ''}
                                    readOnly
                                />
                        </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Organization</Form.Label>
                          <Form.Control
                            type="text"
                            value={profile?.organization_name || 'N/A'}
                            readOnly
                          />
                        </Form.Group>

                        <Row>
                          <Col xs={12} md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Role</Form.Label>
                              <Form.Control
                                type="text"
                                value={profile?.role || 'N/A'}
                                readOnly
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12} md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Team</Form.Label>
                              <Form.Control
                                type="text"
                                value={profile?.team_title || 'N/A'}
                                readOnly
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Last Logged In</Form.Label>
                          <Form.Control
                            type="text"
                            value={profile.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'N/A'}
                            readOnly
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Created On</Form.Label>
                          <Form.Control type="text" value={profile?.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'} readOnly/>
                        </Form.Group>


                        <Form.Group className="mb-3">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                          />
                        </Form.Group>

                        <Button variant="primary" onClick={handlePasswordUpdate}>
                          Update Password
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Profile;
