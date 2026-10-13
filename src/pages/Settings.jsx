import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getUserProfile, updateUserProfile, changePassword } from '../services/api';

const Settings = () => {
  const { user, login, logout } = useContext(AppContext);
  const navigate = useNavigate();

  // Profile State
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    role: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: ''
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Feedback State
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      if (data) {
        setProfile(data);
        setProfileForm({
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || ''
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfileMessage({ type: 'error', text: 'Failed to load user profile.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber' && !/^\d*$/.test(value)) return;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (!profileForm.name.trim()) {
      setProfileMessage({ type: 'error', text: 'Name is required.' });
      return;
    }
    if (!profileForm.username.trim()) {
      setProfileMessage({ type: 'error', text: 'Username is required.' });
      return;
    }
    if (!profileForm.email.trim()) {
      setProfileMessage({ type: 'error', text: 'Email is required.' });
      return;
    }

    if (profileForm.phoneNumber && profileForm.phoneNumber.trim()) {
      const phoneClean = profileForm.phoneNumber.trim();
      if (!/^\d{10}$/.test(phoneClean)) {
        setProfileMessage({ type: 'error', text: 'Phone number must be exactly 10 digits.' });
        return;
      }
    }

    try {
      const updated = await updateUserProfile({
        name: profileForm.name.trim(),
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
        phoneNumber: profileForm.phoneNumber ? profileForm.phoneNumber.trim() : ''
      });

      setProfile(updated);
      setIsEditingProfile(false);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Update session storage if username changed
      const token = localStorage.getItem('token');
      if (token && user) {
        login(token, {
          ownerId: updated.id,
          username: updated.username,
          businessId: user.businessId,
          businessName: updated.businessName || user.businessName
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setProfileMessage({ type: 'error', text: msg });
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!passwordForm.currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Current password is required.' });
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordMessage({ type: 'error', text: 'New password is required.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error("Error changing password:", err);
      const msg = err.response?.data?.message || 'Failed to change password.';
      setPasswordMessage({ type: 'error', text: msg });
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to log out of SmartBiz?")) {
      logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Account Settings</h1>
        <p className="page-description" style={{ color: '#64748b', marginTop: '0.25rem' }}>
          Manage your personal user profile, account credentials, and system authentication.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Profile Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>User Account Details</h2>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileForm({
                    name: profile.name || '',
                    username: profile.username || '',
                    email: profile.email || '',
                    phoneNumber: profile.phoneNumber || ''
                  });
                  setProfileMessage({ type: '', text: '' });
                }}
                style={{ backgroundColor: '#64748b', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
            )}
          </div>

          {profileMessage.text && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                backgroundColor: profileMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
                color: profileMessage.type === 'error' ? '#dc2626' : '#16a34a',
                border: `1px solid ${profileMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}`
              }}
            >
              {profileMessage.text}
            </div>
          )}

          {!isEditingProfile ? (
            /* View Profile Mode */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: '#94a3b8', fontWeight: 600 }}>Full Name</span>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a', marginTop: '0.25rem' }}>{profile.name || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: '#94a3b8', fontWeight: 600 }}>Username</span>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a', marginTop: '0.25rem' }}>@{profile.username || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: '#94a3b8', fontWeight: 600 }}>Email Address</span>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a', marginTop: '0.25rem' }}>{profile.email || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: '#94a3b8', fontWeight: 600 }}>Phone Number</span>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a', marginTop: '0.25rem' }}>{profile.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: '#94a3b8', fontWeight: 600 }}>Business Name</span>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a', marginTop: '0.25rem' }}>{profile.businessName || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.05em', color: '#94a3b8', fontWeight: 600 }}>Role</span>
                <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a', marginTop: '0.25rem' }}>{profile.role || 'OWNER'}</p>
              </div>
            </div>
          ) : (
            /* Edit Profile Mode */
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.375rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.375rem' }}>
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.375rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.375rem' }}>
                  Phone Number (10 digits)
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  maxLength="10"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  💾 Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Change Security Password</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Update your account password securely.
            </p>
          </div>

          {passwordMessage.text && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                backgroundColor: passwordMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
                color: passwordMessage.type === 'error' ? '#dc2626' : '#16a34a',
                border: `1px solid ${passwordMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}`
              }}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleSavePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.375rem' }}>
                Current Password *
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.375rem' }}>
                New Password *
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.375rem' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
              >
                🔒 Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Account Session & Logout Card */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #fee2e2', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#991b1b', margin: 0 }}>Session Control</h2>
              <p style={{ color: '#7f1d1d', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Log out of your current SmartBiz session securely across this browser.
              </p>
            </div>

            <button
              onClick={handleLogoutClick}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.625rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              🚪 Log Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
