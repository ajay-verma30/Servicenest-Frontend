import React, { useContext, useEffect } from 'react';
import TopBar from '../src/Components/TopBar/TopBar';
import Sidebar from '../src/Components/Sidebar/Sidebar';
import { AuthContext } from './Context/AuthContext'; 
import { useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const { auth, loading } = useContext(AuthContext); 
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth, loading, navigate]);

  if (loading || !auth.isAuthenticated) {
    return <p className="text-center mt-5">Loading...</p>; 
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <TopBar />
        <div>{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
