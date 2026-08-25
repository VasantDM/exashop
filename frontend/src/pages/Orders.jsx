import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ArrowRight, 
  ShoppingBag,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../services/orderService';

const statusConfig = {
  pending: { label: 'Pending Confirmation', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock },
  processing: { label: 'Processing & Packing', color: 'var(--accent-primary)', bg: 'rgba(99, 102, 241, 0.15)', icon: Package },
  shipped: { label: 'Shipped / In Transit', color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.15)', icon: Truck },
  delivered: { label: 'Delivered', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'var(--accent-rose)', bg: 'rgba(244, 63, 94, 0.15)', icon: XCircle },
};

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
        const data = await getOrders(params);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, selectedStatus]);

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '560px', margin: '3.5rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem' }}>
            Sign In to View Orders
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Please log in to track your past purchases, invoices, and shipment tracking numbers.
          </p>
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const filterTabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
          Your <span className="gradient-text">Orders</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Review historical purchases, download invoices, and track live shipment statuses.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {filterTabs.map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card" style={{ height: '140px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            No Orders Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {selectedStatus === 'all'
              ? "You haven't placed any orders yet. Discover our latest electronics and audio products."
              : `You don't have any orders currently in '${selectedStatus}' status.`}
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem'
                }}
              >
                {/* Left: Info & Status */}
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                      {order.order_number}
                    </span>
                    <span style={{
                      backgroundColor: config.bg,
                      color: config.color,
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <StatusIcon size={12} />
                      <span>{order.status_display}</span>
                    </span>
                    <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                      {order.payment_status_display}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                    Placed on <strong style={{ color: '#ffffff' }}>{order.formatted_date}</strong> • {order.total_items} {order.total_items === 1 ? 'item' : 'items'}
                  </div>

                  {/* Thumbnail gallery preview */}
                  {order.items_preview && order.items_preview.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {order.items_preview.map((item, idx) => (
                        <div key={idx} style={{ position: 'relative' }} title={item.name}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-surface)'
                            }}
                          />
                          {item.quantity > 1 && (
                            <span style={{
                              position: 'absolute',
                              bottom: '-4px',
                              right: '-4px',
                              backgroundColor: 'var(--accent-primary)',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: '800',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {item.quantity}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Grand Total & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>
                      ₹{order.grand_total}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total Invoice
                    </div>
                  </div>

                  <Link
                    to={`/orders/${order.order_number}`}
                    className="btn btn-outline"
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <span>View Invoice & Track</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
