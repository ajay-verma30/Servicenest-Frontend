import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import './Profile.css';
import axios from 'axios';

function Profile() {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null); 
  const { auth,loading  } = useContext(AuthContext);
  const [password, setPassword] = useState('');

  console.log(auth);
  useEffect(() => {
    if (loading) return;
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }

    const getDetails = async () => {
      try {
        const result = await axios.get('https://servicenest-backend.onrender.com/users/my-details', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        setDetail(result.data.userDetail[0]);
      } catch (err) {
        console.error("Error fetching user details:", err);
        navigate('/login');
      }
    };

    getDetails();
  }, [auth, navigate, loading]);

  const passwordReset =async(e)=>{
    e.preventDefault()
    try{
      const result = await axios.put('https://servicenest-backend.onrender.com/users/reset',{password},{
        headers:{
          Authorization:`Bearer ${auth.token}`
        }
      })
      if (result.status === 200){
        setPassword("")
      }
    }
    catch(e){
      console.log(e)
    }
  }

  if (loading || !auth.isAuthenticated || detail === null) {
  return <p className="text-center mt-5">Loading profile...</p>;
}

  return (
    <div className="profile-content-container" style={{marginLeft:'151px'}}>
    <Container className='profile-container'>
      <h1>Hello {detail.f_name}</h1>
      <div className="details-container">
        <Row>
          <Col xs={12} md={9} className='details'>
            <Form>
              <Row>
                <Col md={6} xs={12}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type='text' value={detail.email} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6} xs={12}>
                  <Form.Group>
                    <Form.Label>Role</Form.Label>
                    <Form.Control type='text' value={detail.role} readOnly />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type='text' value={detail.f_name} readOnly />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type='text' value={detail.l_name} readOnly />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group>
                <Form.Label>Created On</Form.Label>
                <Form.Control type='text' value={new Date(detail.created_at).toLocaleString()} readOnly />
              </Form.Group>
            </Form>
            <hr />
            <Form onSubmit={passwordReset}>
              <Form.Group>
                <Form.Label>Reset Password</Form.Label>
                <Form.Control type='password' placeholder='Enter New Password' value={password} onChange={(e)=>setPassword(e.target.value)} />
              </Form.Group>
              <br />
              <Button className="btn btn-success" type="submit">Reset</Button>
            </Form>
          </Col>

          <Col xs={12} md={3} className="text-center image-container" style={{ background: "whitesmoke" }}>
            <div className="profile">
              <img src='Images/profile-backdrop.jpg' alt='profile-img' className='profile-img' />
            </div>
            <br />
            <h3>{detail.f_name} {detail.l_name}</h3>
            <h5>{detail.email}</h5>
            <br />
            <p>Last Login: {new Date(detail.last_login).toLocaleString()}</p>
          </Col>
        </Row>
      </div>
    </Container>
    </div>
  );
}

export default Profile;
