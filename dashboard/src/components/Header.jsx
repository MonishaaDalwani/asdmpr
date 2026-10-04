import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <h2 className="topbar-welcome">
          Welcome back, <strong>{user?.name || 'Staff Member'}</strong>
        </h2>
      </div>

      <div className="topbar-right">
        <div className="user-profile-badge">
          <div className="avatar-chip">
            {role === 'admin' ? '🛡️' : '🩺'}
          </div>
          <div className="user-chip-info">
            <span className="user-chip-name">{user?.name}</span>
            <span className={`user-chip-role role-${role}`}>
              {role === 'admin' ? 'Administrator' : `Doctor (${user?.department || 'Specialist'})`}
            </span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-outline btn-sm logout-btn">
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
