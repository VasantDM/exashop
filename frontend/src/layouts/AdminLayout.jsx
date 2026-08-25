import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  Boxes, 
  Store, 
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products & Variants', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { to: '/admin/customers', label: 'Customer Accounts', icon: Users },
    { to: '/admin/inventory', label: 'Inventory & Stock', icon: Boxes },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#070b14', color: 'var(--text-primary)' }}>
      {/* Sleek Dark Admin Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0c1322',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        {/* Brand / Logo Header */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                ShopiGo <span className="gradient-text">Admin</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Store Management Suite
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', padding: '0 0.75rem 0.4rem', letterSpacing: '0.06em' }}>
            Management
          </div>

          {navItems.map((item) => {
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
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)'
                })}
              >
                <Icon size={18} color="var(--accent-primary)" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer: Back to Store & Admin Profile */}
        <div style={{
          padding: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(12, 19, 34, 0.6)'
        }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: '600',
              textDecoration: 'none',
              marginBottom: '1rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
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
              backgroundColor: 'var(--accent-primary)',
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
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
      <main style={{ flex: 1, minWidth: 0, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
