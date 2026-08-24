import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Layers, 
  ShieldCheck,
  Activity,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../hooks/useHealth';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { healthData, loading } = useHealth(15000);

  const isHealthy = healthData?.status === 'healthy';
  const isDbConnected = healthData?.database?.status === 'connected';

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Categories', path: '/categories', icon: Layers },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <ShoppingBag size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Aura<span className="gradient-text">Store</span>
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '-2px' }}>
              Full-Stack E-Commerce
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                  border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={16} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* System Health Status & User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Live Stack Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isDbConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${isDbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            fontSize: '0.75rem',
            fontWeight: '600'
          }} title={`API: ${isHealthy ? 'Online' : 'Offline'} | DB: ${isDbConnected ? 'PostgreSQL 18 Connected' : 'Disconnected'}`}>
            <span className={`pulse-dot ${isDbConnected ? 'success' : 'danger'}`}></span>
            <span style={{ color: isDbConnected ? '#34d399' : '#fb7185' }}>
              {loading ? 'Checking...' : isDbConnected ? 'Full-Stack Connected' : 'API / DB Disconnected'}
            </span>
          </div>

          {/* Cart Icon */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
            aria-label="View Cart"
          >
            <ShoppingCart size={20} />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--accent-primary)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: '700',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              0
            </span>
          </Link>

          {/* User Auth Links */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/profile" className="btn btn-outline" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                <User size={16} />
                Profile
              </Link>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                Register
              </Link>
            </div>
          )}

          {/* Admin link */}
          <Link
            to="/admin"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Admin Console"
          >
            <ShieldCheck size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
