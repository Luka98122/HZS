import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hashPassword } from '../utils/hashPassword';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Hash the password with 'hzs' prefix
      const hashedPassword = await hashPassword(password);

      console.log('Login attempt:', {
        email,
        hashedPassword,
        rememberMe
      });

      const response = await fetch('https://hak.hoi5.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password_hash: hashedPassword,
        }),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('Login successful:', data);

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }

      localStorage.setItem('isAuthenticated', 'true');

      setIsLoading(false);
      navigate('/home/');

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };




  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img src="/logo.png" className="logo-icon" alt="Wellness Buddy Logo" />
            <h1>Wellness Buddy</h1>
          </Link>
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue your journey</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className={`auth-error ${error.includes('reset link') ? 'auth-success' : ''}`}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              autoComplete='username'
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <small className="password-hint">
              Passwords are salted and hashed with SHA-256 for the best security practices.
            </small>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>
            
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
          <p className="auth-terms">
            By continuing, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;