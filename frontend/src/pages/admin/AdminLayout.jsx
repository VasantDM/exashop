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
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isSettingsRoute = 
    location.pathname.startsWith('/admin/settings') || 
    location.pathname.startsWith('/admin/customers');

  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: 'var(--text-primary)' }}>
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        boxShadow: '1px 0 4px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{
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

        <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', padding: '0 0.75rem 0.4rem', letterSpacing: '0.06em' }}>
            Main Management
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
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

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
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

      <main style={{ flex: 1, minWidth: 0, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
