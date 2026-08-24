import React from 'react';
import { User, Shield, Key, History } from 'lucide-react';

const Profile = () => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Customer Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your account credentials, security settings, and order history.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '800'
          }}>
            CU
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Customer User</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="badge badge-info">CUSTOMER Role</span>
              <span className="badge badge-success">JWT Verified</span>
            </div>
          </div>
        </div>

        <div className="grid-3">
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={18} color="var(--accent-primary)" />
              <strong>Role Access</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Supports CUSTOMER and ADMIN roles with granular DRF permissions.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Key size={18} color="var(--accent-emerald)" />
              <strong>Security</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Password rotation, token refresh, and profile management (Phase 2).
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <History size={18} color="var(--accent-cyan)" />
              <strong>Orders</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Track previous orders, delivery status, and invoices (Phase 5).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
