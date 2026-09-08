import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/mobileNavbar.css';

/**
 * Mobile Meniscus Animated Navbar
 * Faithfully styled to replicate the fluid floating bubble animation from "mobile navbar.mp4"
 */
const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { totalItems, wishlistCount } = useCart();

  // Hide on admin routes because AdminLayout has its own dedicated mobile controls
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  const navItems = useMemo(() => [
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
  ], [isAuthenticated, isAdmin, totalItems, wishlistCount]);

  // Determine current active index based on current location
  const activeIndex = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/products')) return 1;
    if (path.startsWith('/wishlist')) return 2;
    if (path.startsWith('/cart')) return 3;
    if (path.startsWith('/profile') || path.startsWith('/orders') || path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password') || path.startsWith('/admin')) {
      return 4;
    }
    return 0;
  }, [location.pathname]);

  const ActiveIcon = navItems[activeIndex]?.icon || Home;
  const activeBadge = navItems[activeIndex]?.badge;

  // Calculate center horizontal position (in %) for the floating bubble
  const activeLeftPercent = (activeIndex + 0.5) * (100 / navItems.length);

  return (
    <nav className="meniscus-navbar-root" aria-label="Mobile Navigation">
      <div className="meniscus-nav-container">
        {/* 1. Ambient Glow Spotlight under active tab */}
        <div 
          className="meniscus-ambient-glow" 
          style={{ left: `${activeLeftPercent}%` }}
        />

        {/* 2. Elevated Floating Animated Circle Bubble matching mp4 */}
        <div 
          className="meniscus-floating-bubble"
          style={{ left: `${activeLeftPercent}%` }}
        >
          <div className="meniscus-bubble-ripple" />
          <div key={activeIndex} className="meniscus-active-icon-inner">
            <ActiveIcon size={22} strokeWidth={2.4} />
          </div>
          {typeof activeBadge === 'number' && activeBadge > 0 && (
            <span 
              className="meniscus-badge"
              style={{ 
                backgroundColor: navItems[activeIndex].badgeColor || '#ea580c',
                top: '-4px',
                right: '-4px'
              }}
            >
              {activeBadge}
            </span>
          )}
        </div>

        {/* 3. The 5 Navigation Tabs */}
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeIndex === idx;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`meniscus-nav-tab ${isActive ? 'active' : ''}`}
            >
              {/* Inactive Icon Box (hidden when active because floating bubble takes over) */}
              <div className="meniscus-icon-box">
                <Icon size={20} strokeWidth={2} />
                {typeof item.badge === 'number' && item.badge > 0 && !isActive && (
                  <span 
                    className="meniscus-badge"
                    style={{ backgroundColor: item.badgeColor || '#ea580c' }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Tab Text Label */}
              <span className="meniscus-tab-label">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
