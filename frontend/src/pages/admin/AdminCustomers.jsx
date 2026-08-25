import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  UserCheck,
  UserX
} from 'lucide-react';
import { getAdminCustomers, toggleAdminCustomerActive } from '../../services/adminService';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminCustomers({ search });
      setCustomers(data.results || data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load customers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleToggleActive = async (cust) => {
    try {
      const res = await toggleAdminCustomerActive(cust.id);
      showToast(res.message);
      loadCustomers();
    } catch (err) {
      console.error(err);
      showToast('Failed to update account status', 'error');
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: toast.type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
          color: '#ffffff',
          padding: '0.8rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0 }}>
            Customer <span className="gradient-text">Accounts</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Registered shoppers directory, order history metrics, and account permission controls.
          </p>
        </div>

        <button onClick={loadCustomers} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}>
          <RotateCcw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by customer name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem 0.6rem 2.4rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </form>
      </div>

      {/* Customer Directory Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>Loading customer accounts...</div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>No customers found matching search.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Shopper</th>
                  <th style={{ padding: '0.75rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Total Orders</th>
                  <th style={{ padding: '0.75rem' }}>Total Spent</th>
                  <th style={{ padding: '0.75rem' }}>Joined Date</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}>
                        {cust.first_name ? cust.first_name[0].toUpperCase() : cust.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#ffffff' }}>{cust.full_name || cust.username}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>@{cust.username}</div>
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ color: '#ffffff' }}>{cust.email}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cust.phone_number || 'No phone'}</div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className={`badge ${cust.role === 'admin' ? 'badge-primary' : 'badge-outline'}`} style={{ fontSize: '0.72rem' }}>
                        {cust.role ? cust.role.toUpperCase() : 'CUSTOMER'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '600', color: '#ffffff' }}>
                      {cust.total_orders} orders
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                      ₹{cust.total_spent}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {cust.joined_date}
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className={`badge ${cust.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                        {cust.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      {cust.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleActive(cust)}
                          className="btn btn-outline"
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            borderColor: cust.is_active ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                            color: cust.is_active ? '#fb7185' : 'var(--accent-emerald)'
                          }}
                          title={cust.is_active ? 'Disable Account' : 'Activate Account'}
                        >
                          {cust.is_active ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <UserX size={13} /> Disable
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <UserCheck size={13} /> Enable
                            </span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
