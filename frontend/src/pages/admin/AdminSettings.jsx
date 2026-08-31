import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  UserPlus, 
  Users, 
  Shield, 
  CheckCircle, 
  Sliders, 
  Store, 
  Key, 
  Lock, 
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const AdminSettings = () => {
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'ShopiGo / AuraStore',
    supportEmail: 'support@shopigo.com',
    supportPhone: '+91 98765 43210',
    currency: 'INR (₹)',
    defaultRole: 'Customer',
    sessionTimeout: '1440', // minutes (24h)
    orderPrefix: 'ORD-',
    inventoryAlertThreshold: 5,
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Store configuration saved successfully!');
    }, 500);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          backgroundColor: 'var(--accent-emerald)',
          color: '#ffffff',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0 }}>
            Store <span className="gradient-text">Configuration & Settings</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Configure global store properties, default account permissions, and system parameters.
          </p>
        </div>
      </div>

      {/* Quick Navigation Card into Users & Accounts */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin/customers" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{
            padding: '1.5rem',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            backgroundColor: 'rgba(99, 102, 241, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)'
              }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#ffffff' }}>
                  Users & Accounts Directory
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Filter by role (Customers, Admins, Staff), check active/inactive status, and register new users with custom roles.
                </div>
              </div>
            </div>
            <ArrowRight size={20} color="var(--accent-primary)" />
          </div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
        
        {/* Main Store Settings Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Sliders size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Store & Branding
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                Store identity and operational defaults
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Support Phone
                </label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Default Currency
                </label>
                <input
                  type="text"
                  value={settings.currency}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={settings.inventoryAlertThreshold}
                  onChange={(e) => setSettings({ ...settings, inventoryAlertThreshold: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ width: 'fit-content', marginTop: '0.5rem', padding: '0.7rem 1.5rem', fontSize: '0.88rem' }}
            >
              {isSaving ? 'Saving Changes...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        {/* Security & System Policy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--accent-primary)" />
              Authentication & Role Policy
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)'
              }}>
                <div style={{ fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>
                  Public Registration Role: Customer (Strict)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Public storefront signups are locked to the <code>customer</code> role. Role elevation is restricted to authenticated Admin users.
                </div>
              </div>

              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                <div style={{ fontWeight: '700', color: 'var(--accent-emerald)', marginBottom: '0.2rem' }}>
                  Default Account State: Active
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Newly registered accounts are active by default and ready for orders or staff access.
                </div>
              </div>

              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)'
              }}>
                <div style={{ fontWeight: '700', color: '#fb7185', marginBottom: '0.2rem' }}>
                  Soft Deletion Safeguard
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  User removals deactivate accounts (<code>is_active = False</code>) without purging database records, preserving compliance and past order history.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
