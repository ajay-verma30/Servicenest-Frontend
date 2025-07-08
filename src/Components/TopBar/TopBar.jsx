import React, { useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();
  const {logout} = useContext(AuthContext);
  const handleLogout=(e)=>{
    e.preventDefault();
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
