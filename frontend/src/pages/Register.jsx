import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: formData.role,
      };

      const result = await register(payload);
      setSuccessMessage(`Account created successfully! Welcome, ${result.user?.first_name || result.user?.username}! Redirecting...`);
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 750);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please review your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2.5rem auto' }}>
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
            boxShadow: 'var(--shadow-glow)',
            color: '#ffffff'
          }}>
            <User size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.4rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join ExaShop for seamless shopping, fast checkout & order tracking
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#dc2626',
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
            color: '#059669',
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* First & Last Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Jane"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Username <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="jane_doe"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Email Address <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Phone size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem 0.75rem 2.2rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Confirm Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem 0.75rem 2.2rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Creating Account...' : 'Register & Sign In'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-orange)', fontWeight: '700' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
