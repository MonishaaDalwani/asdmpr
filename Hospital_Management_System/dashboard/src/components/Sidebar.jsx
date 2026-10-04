import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
          </svg>
        </div>
        <div className="brand-info">
          <span className="brand-name">St. Jude Medical</span>
          <span className="brand-badge">{isAdmin ? 'Admin Console' : 'Doctor Portal'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <div className="nav-section-title">ADMINISTRATION</div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="link-icon">📊</span>
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/admin/doctors"
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="link-icon">👨‍⚕️</span>
              <span>Manage Doctors</span>
            </NavLink>

            <NavLink
              to="/admin/patients"
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="link-icon">👥</span>
              <span>Manage Patients</span>
            </NavLink>

            <NavLink
              to="/admin/appointments"
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="link-icon">📅</span>
              <span>All Appointments</span>
            </NavLink>

            <NavLink
              to="/admin/messages"
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="link-icon">💬</span>
              <span>Patient Messages</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="nav-section-title">PHYSICIAN CONSOLE</div>
            <NavLink
              to="/doctor/dashboard"
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="link-icon">📊</span>
              <span>Clinical Overview</span>
            </NavLink>

            <NavLink
              to="/doctor/appointments"
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="link-icon">🩺</span>
              <span>My Appointments</span>
            </NavLink>

            <NavLink
              to="/doctor/profile"
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <span className="link-icon">⚙️</span>
              <span>Profile & Availability</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="patient-portal-btn"
        >
          <span>🌐 View Patient Portal</span>
          <span className="ext-icon">&rarr;</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
