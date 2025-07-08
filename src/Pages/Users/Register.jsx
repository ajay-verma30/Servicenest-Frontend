import React, { useState } from 'react'
import {Container, Row, Col, Form, Button} from 'react-bootstrap'
import './Common.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Register() {
     const [agree, setAgree] = useState(false)
     const [f_name, setFname] = useState('')
     const [l_name, setLname] = useState('')
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [cnfPassword, setcnfPassword] = useState('')
     const [role, setRole] = useState('')
     const [errMsg, setErrMsg] = useState('')
     const navigate = useNavigate()
     const handleRegister = async(e) =>{
        e.preventDefault();
        try{
            if(password !== cnfPassword){
                setErrMsg("Passwords do not Match!");
                setTimeout(() => setErrMsg(""), 3000); 
                return
            }
            const result = await axios.post("https://servicenest-backend.onrender.com/users/new", {f_name,l_name, email, password, role})
            if(result.status === 201){
                navigate('/login')
            }
        }
        catch(e){
            setErrMsg(e.response?.data?.message || e.message || "Something went wrong");
            setTimeout(() => setErrMsg(""), 3000); 
        }
     }

     const handleLoginRoute =()=>{
        navigate("/login")
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
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" placeholder='Confirm Password' required value={cnfPassword} onChange={(e)=>setcnfPassword(e.target.value)}></Form.Control>
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
                    <Form.Group className="checkbox-class">
                        <Form.Check type='checkbox' label={<>I agree to the <a href='/terms' target='_blank' rel='noopener noreferrer'>Terms and Conditions</a></>} checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
 />
                    </Form.Group>
                    <Button className='btn' type='submit' disabled={!agree}>Register</Button>
                </Form>
                <br/>
                <p onClick={handleLoginRoute}>Already user?<span className='text-danger' style={{cursor:"pointer"}}> Sign In.</span></p>
                {errMsg && <p style={{ color: "red", marginTop: "10px" }}>{errMsg}</p>}
            </Container>
        </div>
    </>
  )
}

export default Register