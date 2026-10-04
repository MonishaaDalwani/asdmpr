import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container page-container text-center" style={{ padding: '5rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', color: '#0284c7', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#0f172a' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 2rem auto' }}>
        The medical portal page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home Page
      </Link>
    </div>
  );
};

export default NotFound;
