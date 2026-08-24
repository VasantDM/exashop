import React from 'react';
import { ShieldCheck, Package, ShoppingCart, Users, DollarSign, ExternalLink } from 'lucide-react';

const AdminDashboard = () => {
  const adminStats = [
    { label: 'Total Products', value: 'Phase 3', icon: Package, color: 'var(--accent-primary)' },
    { label: 'Total Orders', value: 'Phase 5', icon: ShoppingCart, color: 'var(--accent-emerald)' },
    { label: 'Registered Customers', value: 'Phase 2', icon: Users, color: 'var(--accent-cyan)' },
    { label: 'Total Revenue', value: 'Phase 6', icon: DollarSign, color: 'var(--accent-amber)' },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Admin Console</h1>
            <span className="badge badge-info">ADMIN Architecture</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Central administration hub for catalog, orders, users, and store analytics.
          </p>
        </div>

        <a
          href="http://127.0.0.1:8000/admin/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ fontSize: '0.85rem' }}
        >
          Open Django Admin <ExternalLink size={14} />
        </a>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {adminStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {stat.label}
                </span>
                <div style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  color: stat.color
                }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          Role-Based Access Control (RBAC) Architecture
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          The backend supports <code>ADMIN</code> and <code>CUSTOMER</code> roles. In Phase 7, this admin console will connect with Django REST API admin endpoints with JWT role enforcement to allow dynamic management of products, inventory stock, order dispatches, and user permissions.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
