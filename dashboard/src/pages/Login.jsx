import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isSessionExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    isSessionExpired ? 'Staff session expired. Please authenticate again.' : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide staff email and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.user.role === 'doctor') {
        navigate('/doctor/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@hospital.com');
    setPassword('Password123!');
    setError('');
  };

  const fillDoctorCredentials = () => {
    setEmail('dr.sarah@hospital.com');
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-logo-icon" style={{ margin: '0 auto 1rem auto' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
          <h1>Staff Portal Sign In</h1>
          <p>Restricted access for Hospital Administrators and Medical Practitioners.</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Quick Testing Fast-Fill Credentials */}
        <div className="demo-credentials-box">
          <span className="demo-title">⚡ Quick Demo Logins:</span>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={fillAdminCredentials}
            >
              Fill Admin (admin@hospital.com)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={fillDoctorCredentials}
            >
              Fill Doctor (dr.sarah@hospital.com)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="staffEmail">Staff Email</label>
            <input
              id="staffEmail"
              type="email"
              className="form-input"
              placeholder="e.g. admin@hospital.com or doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staffPassword">Password</label>
            <input
              id="staffPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Authenticating Staff...' : 'Sign In to Staff Console'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Looking for patient appointment booking?{' '}
            <a href="http://localhost:5173" className="portal-link">
              Go to Patient Portal &rarr;
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
