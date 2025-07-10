import React, { useState } from 'react'
import {Container, Row, Col, Form, Button} from 'react-bootstrap'
import './Common.css'
import axios from 'axios'


function Register() {
     const [f_name, setFname] = useState('')
     const [l_name, setLname] = useState('')
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')

     const [role, setRole] = useState('')
     const [errMsg, setErrMsg] = useState('')
     const handleRegister = async(e) =>{
        e.preventDefault();
        try{
            const result = await axios.post("https://servicenest-backend.onrender.com/users/new", {f_name,l_name, email, password, role})
            if(result.status === 201){
                alert('User added')
            }
        }
        catch(e){
            setErrMsg(e.response?.data?.message || e.message || "Something went wrong");
            setTimeout(() => setErrMsg(""), 3000); 
        }
     }
  return (
    <>
        <div className="content-container">
            <Container>
                <Form onSubmit={handleRegister}>
                    <Row>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>First Name</Form.Label>
                                <Form.Control type="text" placeholder='First Name' required value={f_name} onChange={(e)=>setFname(e.target.value)}></Form.Control>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control type="text" placeholder='Last Name' required value={l_name} onChange={(e)=>setLname(e.target.value)}></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder='Email' required value={email} onChange={(e)=>setEmail(e.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder='Password' required value={password} onChange={(e)=>setPassword(e.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>User Type</Form.Label>
                        <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="">Select Account Type</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="agent">Agent</option>
                        </Form.Select>
                    </Form.Group>
                    <br/>
                    <Button className='btn' type='submit' >Add User</Button>
                </Form>
                <br/>
                {errMsg && <p style={{ color: "red", marginTop: "10px" }}>{errMsg}</p>}
            </Container>
        </div>
    </>
  )
}

export default Register