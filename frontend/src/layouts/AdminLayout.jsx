import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  Boxes, 
  Store, 
  ShieldCheck, 
  Settings, 
  Sliders, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current route is part of settings / user management
  const isSettingsRoute = 
    location.pathname.startsWith('/admin/settings') || 
    location.pathname.startsWith('/admin/customers');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const mainNavItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products & Variants', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { to: '/admin/inventory', label: 'Inventory & Stock', icon: Boxes },
  ];

  const settingsSubItems = [
    { to: '/admin/customers', label: 'Users & Accounts', icon: Users },
    { to: '/admin/settings', label: 'Store Configuration', icon: Sliders, end: true },
  ];

  const mobileBottomItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
    { to: '/admin/customers', label: 'Users', icon: Users },
  ];

  return (
    <div className="admin-root-layout">
      
      {/* Mobile Top App Bar for Admin */}
      <header className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
            }}>
              <ShieldCheck size={18} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              ExaShop <span className="gradient-text">Admin</span>
            </span>
          </Link>
        </div>

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.7rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: 'var(--accent-orange)',
            fontSize: '0.78rem',
            fontWeight: '700',
            textDecoration: 'none'
          }}
        >
          <Store size={14} />
          <span>Store</span>
        </Link>
      </header>

      {/* Main Row Container */}
      <div className="admin-body-container">
        
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="admin-mobile-backdrop"
          />
        )}

        {/* Sleek Light Admin Sidebar */}
        <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Brand / Logo Header (Desktop) */}
          <div className="admin-sidebar-header" style={{
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fafaf9'
          }}>
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
              }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  ExaShop <span className="gradient-text">Admin</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                  Store Management Suite
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', padding: '0 0.75rem 0.4rem', letterSpacing: '0.06em' }}>
              Main Management
            </div>

            {/* Root Main Nav Items */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} color={isActive ? 'var(--accent-orange)' : 'var(--text-secondary)'} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Settings Section Divider */}
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              
              {/* Settings Main Dropdown Trigger */}
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: isSettingsRoute ? '700' : '600',
                  color: isSettingsRoute ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  backgroundColor: isSettingsRoute ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                  border: isSettingsRoute ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Settings size={18} color={isSettingsRoute ? 'var(--accent-orange)' : 'var(--text-muted)'} />
                  <span>Settings</span>
                </div>
                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {isSettingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </button>

              {/* Dropdown Sub-Items */}
              {isSettingsOpen && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  paddingLeft: '1.25rem',
                  marginTop: '0.35rem',
                  borderLeft: '2px solid rgba(245, 158, 11, 0.3)',
                  marginLeft: '1.25rem'
                }}>
                  {settingsSubItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        end={subItem.end}
                        onClick={() => setMobileMenuOpen(false)}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.82rem',
                          fontWeight: isActive ? '700' : '500',
                          color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
                          backgroundColor: isActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                          border: isActive ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                          textDecoration: 'none',
                          transition: 'all var(--transition-fast)'
                        })}
                      >
                        {({ isActive }) => (
                          <>
                            <SubIcon size={15} color={isActive ? 'var(--accent-orange)' : 'var(--text-secondary)'} />
                            <span>{subItem.label}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}

            </div>

          </nav>

          {/* Sidebar Footer: Back to Store & Admin Profile */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: '#fafaf9'
          }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--accent-orange)',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none',
                marginBottom: '0.85rem',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Store size={16} />
              <span>View Public Storefront</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.85rem',
                color: '#fff'
              }}>
                {user?.first_name ? user.first_name[0].toUpperCase() : 'A'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.full_name || user?.username || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                  ● Staff Verified
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Admin Content View Area */}
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>

      {/* Admin Mobile Bottom Bar */}
      <nav className="admin-mobile-bottom-bar">
        <div className="admin-mobile-bottom-container">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => 
                  `admin-bottom-tab ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <style>{`
        .admin-root-layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          background-color: #f8fafc;
          color: var(--text-primary);
        }

        .admin-body-container {
          display: flex;
          flex: 1;
          height: 100%;
          min-height: 0;
          overflow: hidden;
          position: relative;
        }

        .admin-sidebar {
          width: 260px;
          background-color: #ffffff;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100%;
          overflow: hidden;
          z-index: 100;
          box-shadow: 1px 0 4px rgba(0, 0, 0, 0.03);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .admin-mobile-header {
          display: none;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 90;
          align-items: center;
          justify-content: space-between;
        }

        .admin-mobile-bottom-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid var(--border-color);
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
          z-index: 100;
          padding: 0.35rem 0.5rem calc(0.35rem + env(safe-area-inset-bottom, 0px));
        }

        .admin-mobile-bottom-container {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-around;
        }

        .admin-bottom-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.15rem;
          padding: 0.35rem 0.5rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.68rem;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .admin-bottom-tab.active {
          color: var(--accent-orange);
          background: rgba(245, 158, 11, 0.12);
          font-weight: 700;
        }

        .admin-main-content {
          flex: 1;
          min-width: 0;
          height: 100%;
          overflow-y: auto;
          padding: 2rem 2.5rem;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 768px) {
          .admin-root-layout {
            height: auto;
            min-height: 100vh;
            overflow: visible;
          }

          .admin-body-container {
            height: auto;
            overflow: visible;
            display: block;
          }

          .admin-mobile-header {
            display: flex;
          }

          .admin-mobile-bottom-bar {
            display: block;
          }

          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
            box-shadow: 0 0 25px rgba(0, 0, 0, 0.2);
          }

          .admin-sidebar.mobile-open {
            transform: translateX(0);
          }

          .admin-mobile-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(4px);
            z-index: 999;
          }

          .admin-main-content {
            height: auto;
            overflow: visible;
            padding: 1.25rem 1rem 5.5rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
