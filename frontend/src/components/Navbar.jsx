import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">St. Jude</span>
            <span className="brand-subtitle">Medical Center</span>
          </div>
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </button>

        <nav className={`navbar-nav ${menuOpen ? 'nav-active' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>
            Doctors
          </NavLink>
          <NavLink to="/book-appointment" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>
            Book Appointment
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>
            Contact
          </NavLink>
<NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>
  About Us
</NavLink>

          <div className="navbar-auth-section">
            {isAuthenticated ? (
              <div className="auth-user-menu">
                <NavLink to="/appointments" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>
                  My Appointments
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>
                  Profile ({user?.name?.split(' ')[0]})
                </NavLink>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-guest-menu">
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
