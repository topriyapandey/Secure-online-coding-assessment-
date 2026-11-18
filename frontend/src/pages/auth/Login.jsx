import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = await login(email, password);
      if (data.role === 'Administrator') {
        navigate('/admin');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@assessment.com');
      setPassword('Admin@Password123!');
    } else {
      setEmail('candidate@assessment.com');
      setPassword('Candidate@Password123!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', background: '#eff6ff', borderRadius: '50%', marginBottom: '12px' }}>
            <ShieldCheck size={36} color="#2563eb" />
          </div>
          <h1 className="auth-title">Online Coding Assessment</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', marginBottom: '16px', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@assessment.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Demo Credentials Quick-Fill:</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleFillDemo('admin')}
            >
              Fill Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleFillDemo('candidate')}
            >
              Fill Candidate
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have a candidate account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
