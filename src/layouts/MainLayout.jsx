import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  const location = useLocation();

  // Helper to format section title from pathname
  const getPageTitle = (pathname) => {
    const path = pathname.replace('/', '');
    if (!path || path === 'dashboard') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-wrapper">
        <Header title={getPageTitle(location.pathname)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
