import React, { useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {analytics} from '../../Context/Analytics'

const TopBar = () => {
  const navigate = useNavigate();
  const {auth,logout} = useContext(AuthContext);
  const handleLogout=(e)=>{
    e.preventDefault();
    analytics.track('Logout',{
      email: auth.email
    })
    logout();
    navigate("/login")
  }

  return (
    <nav className="navbar navbar-light bg-light px-3 shadow-sm justify-content-end">
      <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default TopBar;
