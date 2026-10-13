import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Sidebar = () => {
  const { logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to log out of SmartBiz?")) {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Inventory', path: '/inventory', icon: '📋' },
    { name: 'Sales', path: '/sales', icon: '💰' },
    { name: 'Purchases', path: '/purchases', icon: '🛍️' },
    { name: 'Expenses', path: '/expenses', icon: '💳' },
    { name: 'Analysis', path: '/analysis', icon: '📈' },
    { name: 'Reports', path: '/reports', icon: '📄' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
    { name: 'Logout', path: '/logout', icon: '🚪' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <span style={{ fontSize: '1.25rem' }}>💼</span> SmartBiz
          <span className="subtitle">Business Operating System</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.path === '/logout') {
            return (
              <button
                key={item.path}
                type="button"
                onClick={handleLogout}
                className="sidebar-link"
                style={{
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 'inherit'
                }}
              >
                <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
