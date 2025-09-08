import React from 'react'
import { Row, Col, Form, Button, Container } from "react-bootstrap";
import './Login.css'; 
import { useState } from "react";
import { useAuth } from '../../Context/AuthContext';


function Login() {
    const {login} = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setError("");
        try{
            await login(email, password)
        }
        catch(err){
            setError(err.response?.data?.message || "Invalid email or password");
        }
        
    }
  return (
    <>
    <Container fluid className="vh-100 login-page-container">
            <Row className="h-100">
                <Col 
                    xs={12} 
                    md={6} 
                    className="col-one d-flex">
                    <div className="login-form">
                        <Form onSubmit={handleSubmit}>
                            <h3 className="">Login with Existing Credentials</h3>
                            <br/>
                            <Form.Group className="">
                                <Form.Label>Email</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    placeholder="email@example.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <br/>
                            <Form.Group className="">
                                <Form.Label>Password</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    placeholder="Password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <br/>
                            {error && <p className="text-danger">{error}</p>}
                            <br/>
                            <Button className="btn btn-success w-100" type="submit">
                                Login
                            </Button>
                        </Form>

                        <div className="call-to-action text-center mt-3">
                            <p>Forgot Password? <a href="reset-password">Reset Password</a></p>
                        </div>
                    </div>
                </Col>

                <Col 
                    xs={12} 
                    md={6} 
                    className="col-two">
                    <div className="text-center">
                        <img 
                            src="https://images.pexels.com/photos/33773640/pexels-photo-33773640.jpeg" 
                            alt="Support Illustration" 
                            className="img-fluid rounded login-image"
                        />
                    </div>
                </Col>
            </Row>
        </Container>

    </>
  )
}

export default Login