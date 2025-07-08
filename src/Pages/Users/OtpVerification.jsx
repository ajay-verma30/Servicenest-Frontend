import React, { useState, useRef, useContext } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import './Common.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';

function OtpVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputs = useRef([]);
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate()
  const { login } = useContext(AuthContext); 

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    try {
      const res = await axios.post('http://localhost:3000/users/verify-otp', {
        email,
        otp: finalOtp
      });
      setSuccessMsg(res.data.message);
      setErrMsg('');

      login(res.data.token); 

      navigate('/home');
    } catch (error) {
      const msg = error.response?.data?.message || 'OTP verification failed';
      setErrMsg(msg);
      setSuccessMsg('');
    }
  };

  return (
    <div className="content-container">
      <Container>
        <Form onSubmit={handleSubmit}>
          <h4>Enter the OTP sent to your email</h4>
          <Row>
            {otp.map((digit, idx) => (
              <Col xs={2} key={idx}>
                <Form.Control
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleBackspace(e, idx)}
                  ref={(el) => (inputs.current[idx] = el)}
                  className="text-center otp-input"
                />
              </Col>
            ))}
          </Row>
          <br />
          <div className='text-center'>
            <Button type="submit" className='btn-success' disabled={otp.includes('')}>Verify</Button>
          </div>

          {errMsg && <p style={{ color: 'red', marginTop: '10px' }}>{errMsg}</p>}
          {successMsg && <p style={{ color: 'green', marginTop: '10px' }}>{successMsg}</p>}
        </Form>
      </Container>
    </div>
  );
}

export default OtpVerification;
