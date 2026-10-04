import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { role } = useAuth();
  const homePath = role === 'admin' ? '/admin/dashboard' : '/doctor/dashboard';

  return (
    <div className="dashboard-content-area text-center" style={{ padding: '6rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', color: '#0d9488', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#0f172a' }}>Dashboard Route Not Found</h2>
      <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 2rem auto' }}>
        The staff module or page you navigated to does not exist.
      </p>
      <Link to={homePath} className="btn btn-primary">
        Return to Dashboard Overview
      </Link>
    </div>
  );
};

export default NotFound;
