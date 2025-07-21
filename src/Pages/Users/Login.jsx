import React, { useState } from 'react'
import {Container,Form, Button} from 'react-bootstrap'
import './Common.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [errMsg, setErrMsg] = useState('')
     const navigate = useNavigate()
     const handleLogin = async(e) =>{
        e.preventDefault();
        try{
            const result = await axios.post("https://servicenest-backend.onrender.com/users/login", {email, password})
            if(result.status === 200){
                navigate('/opt-verification',{ state: { email } })
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
                <Form onSubmit={handleLogin}>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder='Email' required value={email} onChange={(e)=>setEmail(e.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder='Password' required value={password} onChange={(e)=>setPassword(e.target.value)}></Form.Control>
                    </Form.Group>
                    <br/>
                    <Button className='btn' type='submit'>Login</Button>
                </Form>
                <br/>
                {errMsg && <p style={{ color: "red", marginTop: "10px" }}>{errMsg}</p>}
            </Container>
        </div>
    </>
  )
}

export default Login