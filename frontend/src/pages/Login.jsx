import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({
        email: identifier.includes('@') ? identifier.trim() : undefined,
        username: !identifier.includes('@') ? identifier.trim() : undefined,
        password,
      });

      setSuccessMessage(`Welcome back, ${result.user?.first_name || result.user?.username || 'User'}! Redirecting...`);
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 750);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoRole) => {
    if (demoRole === 'admin') {
      setIdentifier('admin@shopigo.com');
      setPassword('AdminPassword123!');
    } else {
      setIdentifier('customer@shopigo.com');
      setPassword('CustomerPassword123!');
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2.5rem auto' }}>
      <div className="glass-card" style={{ padding: '2.75rem 2.25rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Lock size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to access your AuraStore account & orders
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div style={{
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#818cf8', fontWeight: '600' }}>
            <Sparkles size={14} /> Quick Demo Logins:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('customer')}
              className="btn btn-outline"
              style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="btn btn-outline"
              style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)', borderColor: 'rgba(236, 72, 153, 0.3)' }}
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.45rem' }}>
              Email or Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="customer@shopigo.com or customer"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)'
                }}
              />
              <Mail size={17} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 2.6rem 0.8rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)'
                }}
              />
              <Lock size={17} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In with JWT'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
