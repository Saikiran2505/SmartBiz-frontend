import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Logout = () => {
  const { logout } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.confirm("Are you sure you want to log out of SmartBiz?")) {
      logout();
      navigate('/login', { replace: true });
    } else {
      navigate(-1);
    }
  }, [logout, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
      Logging out...
    </div>
  );
};

export default Logout;
