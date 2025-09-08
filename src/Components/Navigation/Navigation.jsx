import React from 'react'
import './Navigation.css'
import { Container, Navbar, Nav, Button} from 'react-bootstrap';

function Navigation() {
  return (
    <>
     <Navbar expand="lg">
  <Container>
    <Navbar.Brand href="#">ServiceNest</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      
      <Nav className="mx-auto d-none d-lg-flex one offset-left-40" >
        <Nav.Link href="#features">Features</Nav.Link>
        <Nav.Link href="#solutions">Solutions</Nav.Link>
        <Nav.Link href="#reviews">Reviews</Nav.Link>
        <Nav.Link href="#contact">Contact</Nav.Link>
      </Nav>

      <Nav className="ms-auto">
        <Nav.Link href="login">
          <Button className="btn btn-success">Login</Button>
        </Nav.Link>
      </Nav>

      <Nav className="d-lg-none flex-column mt-2">
        <Nav.Link href="#features">Features</Nav.Link>
        <Nav.Link href="#solutions">Solutions</Nav.Link>
        <Nav.Link href="#reviews">Reviews</Nav.Link>
        <Nav.Link href="#contact">Contact</Nav.Link>
      </Nav>

    </Navbar.Collapse>
  </Container>
</Navbar>

    </>
  )
}

export default Navigation