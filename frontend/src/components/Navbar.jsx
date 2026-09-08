import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Heart, 
  Layers, 
  ShieldCheck,
  LogOut,
  Home,
  Package,
  Search
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
    <header className="site-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <ShoppingBag size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              Exa<span className="gradient-text">Shop</span>
            </span>
            <div className="brand-tagline">
              Shop what you love
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} color={isActive ? 'var(--accent-orange)' : 'currentColor'} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Health Status & User Actions */}
        <div className="navbar-actions">
          {/* Live Stack Status Indicator (Desktop only for compact view) */}
          <div className="desktop-status-pill" title={`API: ${isHealthy ? 'Online' : 'Offline'} | DB: ${isDbConnected ? 'Connected' : 'Disconnected'}`}>
            <span className={`pulse-dot ${isDbConnected ? 'success' : 'danger'}`}></span>
            <span style={{ color: isDbConnected ? '#059669' : '#dc2626' }}>
              {loading ? 'Checking...' : isDbConnected ? 'System Online' : 'Offline'}
            </span>
          </div>

          {/* Wishlist Icon with Dynamic Badge */}
          <Link
            to="/wishlist"
            className="action-icon-btn"
            aria-label="View Wishlist"
            title="Saved Wishlist Items"
          >
            <Heart size={18} color={wishlistCount > 0 ? '#ea580c' : 'var(--text-secondary)'} fill={wishlistCount > 0 ? '#ea580c' : 'none'} />
            {wishlistCount > 0 && (
              <span className="action-badge badge-orange">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with Dynamic Badge */}
          <Link
            to="/cart"
            className="action-icon-btn"
            aria-label="View Cart"
            title="View Shopping Cart"
          >
            <ShoppingCart size={18} color="var(--text-primary)" />
            <span className="action-badge badge-amber">
              {totalItems}
            </span>
          </Link>

          {/* User Auth Links */}
          {isAuthenticated && user ? (
            <div className="user-logged-in-wrap">
              <Link
                to="/orders"
                className="desktop-only-btn btn btn-outline"
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: location.pathname.startsWith('/orders') ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
                  borderColor: location.pathname.startsWith('/orders') ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: location.pathname.startsWith('/orders') ? 'var(--accent-orange)' : 'var(--text-primary)'
                }}
                title="View & Track Your Orders"
              >
                <Package size={14} color="var(--accent-orange)" />
                <span>Orders</span>
              </Link>

              <Link
                to="/profile"
                className="user-profile-btn"
                title="Your Profile"
              >
                <div className="user-avatar">
                  {initials}
                </div>
                <span className="user-name-label">{user.first_name || user.username}</span>
                <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'} user-role-badge`}>
                  {user.role}
                </span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="admin-link-badge"
                  title="Store Admin Management Suite"
                >
                  <ShieldCheck size={15} />
                  <span>Admin</span>
                </Link>
              )}

              <button
                onClick={logout}
                className="logout-btn"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="guest-auth-actions">
              <Link to="/login" className="btn btn-outline login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .site-header {
          border-bottom: 1px solid var(--border-color);
          background-color: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.04);
        }

        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
        }

        .brand-icon {
          background: var(--accent-gradient);
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
          color: #ffffff;
          flex-shrink: 0;
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          line-height: 1.2;
          display: block;
        }

        .brand-tagline {
          font-size: 0.68rem;
          color: var(--text-secondary);
          margin-top: -2px;
          font-weight: 500;
        }

        .desktop-nav-links {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
          background-color: transparent;
          border: 1px solid transparent;
          transition: all var(--transition-fast);
          text-decoration: none;
        }

        .nav-link:hover {
          color: var(--accent-orange);
          background-color: rgba(245, 158, 11, 0.06);
        }

        .nav-link.active {
          color: var(--accent-orange);
          background-color: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.3);
          font-weight: 700;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .desktop-status-pill {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-full);
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          font-size: 0.72rem;
          font-weight: 600;
        }

        .action-icon-btn {
          position: relative;
          padding: 0.45rem;
          border-radius: var(--radius-md);
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
          text-decoration: none;
        }

        .action-icon-btn:hover {
          border-color: var(--accent-primary);
          background-color: rgba(245, 158, 11, 0.05);
        }

        .action-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          color: #fff;
          font-size: 0.62rem;
          font-weight: 800;
          min-width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
        }

        .badge-orange {
          background-color: #ea580c;
        }

        .badge-amber {
          background: var(--accent-gradient);
          box-shadow: 0 2px 5px rgba(245, 158, 11, 0.4);
        }

        .user-logged-in-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.7rem;
          border-radius: var(--radius-md);
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .user-profile-btn:hover {
          border-color: var(--accent-primary);
        }

        .user-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          color: #fff;
        }

        .admin-link-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-md);
          background-color: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: var(--accent-orange);
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .admin-link-badge:hover {
          background-color: rgba(245, 158, 11, 0.2);
        }

        .logout-btn {
          padding: 0.4rem 0.65rem;
          border-radius: var(--radius-md);
          background: #ffffff;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .logout-btn:hover {
          color: var(--accent-rose);
          border-color: rgba(239, 68, 68, 0.3);
          background-color: rgba(239, 68, 68, 0.05);
        }

        .guest-auth-actions {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .login-btn {
          padding: 0.45rem 0.8rem;
          font-size: 0.82rem;
        }

        .register-btn {
          padding: 0.45rem 0.85rem;
          font-size: 0.82rem;
        }

        /* Mobile View Rules */
        @media (max-width: 768px) {
          .navbar-container {
            padding: 0.65rem 1rem;
          }

          .desktop-nav-links,
          .desktop-status-pill,
          .desktop-only-btn {
            display: none !important;
          }

          .brand-name {
            font-size: 1.15rem;
          }

          .brand-tagline {
            display: none;
          }

          .user-role-badge,
          .user-name-label {
            display: none;
          }

          .user-profile-btn {
            padding: 0.35rem 0.45rem;
          }

          .login-btn,
          .register-btn {
            padding: 0.35rem 0.65rem;
            font-size: 0.78rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
