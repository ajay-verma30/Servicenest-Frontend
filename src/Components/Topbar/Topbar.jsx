import React from 'react'
import { Navbar, Button } from "react-bootstrap";
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from "react-router-dom";
import './Topbar.css'

function Topbar() {
    const { user, logout } = useAuth();
      const orgId = user?.orgId;
    const navigate = useNavigate();
  return (
    <>
    <div className="topbar">
     <Navbar bg="light" expand="lg" className="px-3 shadow-sm">
        <Navbar.Brand>ServiceNest</Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
          <span className="me-3">👋 {user?.email}</span>
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => navigate(`/${orgId}/myprofile`)}
          >
            Profile
          </Button>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Navbar>
      </div>
    </>
  )
}

export default Topbar