import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectPath = location.state?.from?.pathname || searchParams.get('redirect') || '/appointments';
  const isSessionExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(isSessionExpired ? 'Your session has expired. Please sign in again.' : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoPatient = () => {
    setEmail('john.doe@example.com');
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="container auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo-icon" style={{ margin: '0 auto 0.75rem auto' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
          <h2>Patient Portal Sign In</h2>
          <p>Access your appointments, medical history, and doctor messages.</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Demo Patient Fast Fill */}
        <div className="demo-credentials-banner">
          <div>
            <strong>Quick Testing:</strong>
            <p>Demo Patient: <code>john.doe@example.com</code></p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={handleFillDemoPatient}
          >
            Auto-Fill Demo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="patientEmail">Email Address</label>
            <input
              id="patientEmail"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label className="form-label" htmlFor="patientPassword">Password</label>
            </div>
            <input
              id="patientPassword"
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
            {loading ? 'Authenticating...' : 'Sign In to Patient Portal'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>

          <div className="staff-portal-redirect">
            <span>Are you a Doctor or Admin?</span>
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="staff-link"
            >
              Open Staff Dashboard &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
