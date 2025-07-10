import React from 'react';
import {AuthContext} from '../../Context/AuthContext'
import { useContext } from 'react';

const Sidebar = () => {
  const {auth} = useContext(AuthContext);
  return (
    <div className="bg-light border-end vh-100" style={{ width: '150px', height:'100vh', position:'fixed',top:'0',left:'0',overflow:'auto', zIndex:1000 }}>
      <div className="p-3 border-bottom text-center">
        <img src='Images/shuffle.png' alt='company-logo' className='company-logo'/>
      </div>
      <ul className="nav flex-column px-3">
        <li className="nav-item">
          <a className="nav-link" href="/home">Dashboard</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/my-profile">Profile</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/tickets">Tickets</a>
        </li>
        {auth.user?.role === "agent" && (
          <li className='nav-item'>
          <a className="nav-link" href="/add-new">Users</a>
        </li>
        )
        }
      </ul>
    </div>
  );
};

export default Sidebar;
