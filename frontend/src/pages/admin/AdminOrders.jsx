import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  Truck, 
  CheckCircle2, 
  RotateCcw,
  Edit3,
  ExternalLink,
  X
} from 'lucide-react';
import { getAdminOrders, updateAdminOrderStatus } from '../../services/adminService';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminOrders({ status: statusFilter, search });
      setOrders(data.results || data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load customer orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const openStatusModal = (ord) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setTrackingNumber(ord.tracking_number || '');
    setStatusMessage('');
    setIsModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateAdminOrderStatus(selectedOrder.order_number, {
        status: newStatus,
        tracking_number: trackingNumber,
        message: statusMessage
      });
      showToast(`Order #${selectedOrder.order_number} advanced to ${newStatus.toUpperCase()}!`);
      setIsModalOpen(false);
      loadOrders();
    } catch (err) {
      console.error(err);
      showToast('Failed to update order status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
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
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            Order <span className="gradient-text">Fulfillment Hub</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Process customer purchases, assign courier tracking IDs, and advance delivery lifecycles.
          </p>
        </div>

        <button onClick={loadOrders} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}>
          <RotateCcw size={14} /> Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--accent-primary)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? 'var(--shadow-orange)' : 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by order number (#ORD-...), customer name, email, or tracking number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem 0.6rem 2.4rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </form>
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>Loading orders ledger...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>No orders found for this filter.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', backgroundColor: '#fafaf9' }}>
                  <th style={{ padding: '0.75rem' }}>Order Number</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Items</th>
                  <th style={{ padding: '0.75rem' }}>Grand Total</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem' }}>Tracking</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: 'var(--accent-orange)' }}>
                      <Link to={`/orders/${ord.order_number}`} style={{ color: 'var(--accent-orange)', textDecoration: 'none' }}>
                        #{ord.order_number}
                      </Link>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{ord.customer_name || 'Registered Customer'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ord.customer_email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {ord.total_items} items
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      ₹{ord.grand_total}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className={`badge ${ord.status === 'delivered' ? 'badge-success' : ord.status === 'cancelled' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.72rem' }}>
                        {ord.status_display}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: ord.payment_status === 'paid' ? '#059669' : 'var(--text-secondary)' }}>
                        ● {ord.payment_status_display} ({ord.payment_method})
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', fontSize: '0.78rem', color: ord.tracking_number ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
                      {ord.tracking_number || '-'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => openStatusModal(ord)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Update Status / Tracking"
                        >
                          <Edit3 size={13} /> Update Status
                        </button>
                        <Link
                          to={`/orders/${ord.order_number}`}
                          target="_blank"
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                          title="View Customer Invoice"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Stepper Modal */}
      {isModalOpen && selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Update Order #{selectedOrder.order_number}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Customer: {selectedOrder.customer_name} ({selectedOrder.customer_email})
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Fulfillment Lifecycle Stage *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                >
                  <option value="pending">Pending (Awaiting payment/confirmation)</option>
                  <option value="processing">Processing (Packing in warehouse)</option>
                  <option value="shipped">Shipped (Dispatched with courier)</option>
                  <option value="delivered">Delivered (Completed delivery)</option>
                  <option value="cancelled">Cancelled (Order voided/refunded)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Courier Tracking Number (e.g. BlueDart / Delhivery / FedEx)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BLUEDART-948172635"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Timeline Activity Log Message (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Package dispatched via express air courier."
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Updating...' : 'Save & Notify Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
