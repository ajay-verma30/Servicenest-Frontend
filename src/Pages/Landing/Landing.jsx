import React from 'react'
import {  Button} from 'react-bootstrap';
import './Landing.css'
import Navigation from '../../Components/Navigation/Navigation';

function Landing() {
  return (
   <>
   <Navigation/>
   <section className='section-one'>
    <div className="hero-content text-center">
        <h1>Streamline Your Support. <br/>
        <span className='hero-highlight'>Resolve Tickets Faster</span></h1>
        <br/>
        <h5>Manage, assign, and track all your customer tickets in one unified platform</h5>
        <br/>
        <div className="call-to-action text-center">
            <Button className='login'>Login</Button>
            <Button className='contact'>Contact</Button>
        </div>
    </div>
    </section>
   </>
  )
}

export default Landing