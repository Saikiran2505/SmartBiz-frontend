import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Header = ({ title }) => {
  const { user, workingDate, changeWorkingDate, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const [dateInput, setDateInput] = useState('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (workingDate) {
      setDateInput(workingDate);
    }
  }, [workingDate]);

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to log out of SmartBiz?")) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const handleDateSave = async () => {
    if (!dateInput) return;
    setDateError('');
    try {
      await changeWorkingDate(dateInput);
      setIsEditingDate(false);
    } catch (err) {
      setDateError(err.response?.data?.message || err.message || "Failed to update working date.");
    }
  };

  return (
    <header className="header">
      <div className="header-title">
        {title || 'SmartBiz Platform'}
      </div>

      <div className="header-working-date">
        <span className="working-date-label">📅 Working Date:</span>
        {isEditingDate ? (
          <div className="working-date-edit">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="working-date-input"
            />
            <button onClick={handleDateSave} className="btn-date-save">Save</button>
            <button onClick={() => { setIsEditingDate(false); setDateError(''); }} className="btn-date-cancel">Cancel</button>
            {dateError && <span style={{ color: '#dc2626', fontSize: '0.75rem', marginLeft: '0.25rem' }}>{dateError}</span>}
          </div>
        ) : (
          <div className="working-date-display">
            <span className="working-date-value">{workingDate || 'Loading...'}</span>
            <button
              onClick={() => { setIsEditingDate(true); setDateError(''); }}
              className="btn-date-change"
              title="Change Business Working Date"
            >
              Change Date
            </button>
          </div>
        )}
      </div>

      <div className="header-user">
        <div style={{ textAlign: 'right' }}>
          <div className="user-name" style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
            {user?.businessName || 'My Business'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{user?.username}</div>
        </div>
        <button 
          onClick={handleLogoutClick} 
          className="btn-logout-small"
          title="Sign Out"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
