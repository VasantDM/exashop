import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Heart,
  User, 
  Layers, 
  ShieldCheck,
  LogOut,
  Home,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useHealth } from '../hooks/useHealth';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { totalItems, wishlistCount } = useCart();
  const { healthData, loading } = useHealth(15000);

  const isHealthy = healthData?.status === 'healthy';
  const isDbConnected = healthData?.database?.status === 'connected';

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Categories', path: '/categories', icon: Layers },
    ...(isAuthenticated ? [{ name: 'My Orders', path: '/orders', icon: Package }] : []),
  ];

  const initials = user ? (
    (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase() +
    (user.last_name?.[0] || (user.username?.[1] || '')).toUpperCase()
  ) : 'CU';

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(10, 14, 23, 0.88)',
      backdropFilter: 'blur(16px)',
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

          {/* Wishlist Icon with Dynamic Badge */}
          <Link
            to="/wishlist"
            style={{
              position: 'relative',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: wishlistCount > 0 ? '#ec4899' : 'var(--text-primary)'
            }}
            aria-label="View Wishlist"
            title="Saved Wishlist Items"
          >
            <Heart size={20} fill={wishlistCount > 0 ? '#ec4899' : 'none'} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ec4899',
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
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with Dynamic Badge */}
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
            title="View Shopping Cart"
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
              justifyContent: 'center',
              transition: 'transform 0.2s ease'
            }}>
              {totalItems}
            </span>
          </Link>

          {/* User Auth Links */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link
                to="/orders"
                className="btn btn-outline"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: location.pathname.startsWith('/orders') ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                  borderColor: location.pathname.startsWith('/orders') ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: location.pathname.startsWith('/orders') ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
                title="View & Track Your Orders"
              >
                <Package size={16} color="var(--accent-primary)" />
                <span>Orders</span>
              </Link>

              <Link
                to="/profile"
                className="btn btn-outline"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-surface)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  {initials}
                </div>
                <span>{user.first_name || user.username}</span>
                <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}`} style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}>
                  {user.role}
                </span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: 'var(--accent-primary)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    textDecoration: 'none'
                  }}
                  title="Store Admin Management Suite"
                >
                  <ShieldCheck size={16} />
                  <span>Admin</span>
                </Link>
              )}

              <button
                onClick={logout}
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}
                title="Logout"
              >
                <LogOut size={16} />
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
