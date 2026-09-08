import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { totalItems, wishlistCount } = useCart();

  // Hide on admin routes because AdminLayout has its own dedicated mobile admin bar
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { 
      to: '/wishlist', 
      label: 'Wishlist', 
      icon: Heart, 
      badge: wishlistCount,
      badgeColor: '#ea580c'
    },
    { 
      to: '/cart', 
      label: 'Cart', 
      icon: ShoppingCart, 
      badge: totalItems,
      badgeColor: '#f59e0b'
    },
    { 
      to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/login', 
      label: isAuthenticated ? (isAdmin ? 'Admin' : 'Account') : 'Login', 
      icon: isAdmin ? ShieldCheck : User 
    }
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="mobile-icon-wrapper">
                <Icon size={20} className="mobile-nav-icon" />
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span 
                    className="mobile-nav-badge"
                    style={{ backgroundColor: item.badgeColor || 'var(--accent-primary)' }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <style>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-color);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
          z-index: 1000;
          padding: 0.45rem 0.5rem calc(0.45rem + env(safe-area-inset-bottom, 0px));
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block;
          }
        }

        .mobile-nav-container {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-around;
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.18rem;
          padding: 0.35rem 0.6rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
          min-width: 58px;
          position: relative;
        }

        .mobile-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mobile-nav-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: color 0.2s ease;
        }

        .mobile-nav-badge {
          position: absolute;
          top: -6px;
          right: -9px;
          color: #ffffff;
          font-size: 0.62rem;
          font-weight: 800;
          min-width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          animation: badgePop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes badgePop {
          0% { transform: scale(0.5); }
          100% { transform: scale(1); }
        }

        /* Active State - Yellow/Orange Highlighting */
        .mobile-nav-item.active {
          color: var(--accent-orange);
          background: rgba(245, 158, 11, 0.12);
        }

        .mobile-nav-item.active .mobile-icon-wrapper {
          transform: translateY(-2px) scale(1.1);
          color: var(--accent-orange);
        }

        .mobile-nav-item.active .mobile-nav-label {
          color: var(--accent-orange);
          font-weight: 700;
        }

        .mobile-nav-item:hover:not(.active) {
          color: var(--text-primary);
          background: rgba(245, 158, 11, 0.05);
        }
      `}</style>
    </nav>
  );
};

export default MobileBottomNav;
