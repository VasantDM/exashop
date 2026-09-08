import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, redirectPath = '/checkout', customMessage }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await login(identifier.trim(), password);
      setSuccessMessage('Successfully signed in! Proceeding...');
      setTimeout(() => {
        onClose();
        if (redirectPath) {
          navigate(redirectPath);
        }
      }, 700);
    } catch (err) {
      console.error('Modal login failed:', err);
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials. Please verify and try again.';
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToRegister = () => {
    onClose();
    navigate('/register', { state: { from: redirectPath } });
  };

  const handleGoToForgotPassword = () => {
    onClose();
    navigate('/forgot-password');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }}>
      <div 
        className="glass-card" 
        style={{
          maxWidth: '440px',
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          position: 'relative',
          padding: '2.25rem 2rem'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f5f5f4',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Close Modal"
        >
          <X size={16} />
        </button>

        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.85rem',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
            color: '#ffffff'
          }}>
            <Lock size={20} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.3rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Sign In to Continue
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '340px', margin: '0 auto' }}>
            {customMessage || 'Please sign in to your ExaShop account to save items and complete your order.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#059669',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={15} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Email or Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter email or username"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Password
              </label>
              <button
                type="button"
                onClick={handleGoToForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-orange)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '0.65rem 2.25rem 0.65rem 2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: '800', marginTop: '0.35rem' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In & Continue'}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={handleGoToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-orange)',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
