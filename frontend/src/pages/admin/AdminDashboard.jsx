import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Boxes,
  RotateCcw,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { getAdminDashboard } from '../../services/adminService';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError('Could not load executive statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading Store Executive Metrics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '4rem auto' }}>
        <AlertTriangle size={36} color="var(--accent-rose)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>Failed to Load Dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={fetchDashboard} className="btn btn-primary">
          <RotateCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  const { kpis, recent_orders, low_stock_items, sales_trend, categories_overview } = data;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `₹${parseFloat(kpis.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: 'From settled customer orders',
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 95, 70, 0.1))',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      iconColor: 'var(--accent-emerald)',
    },
    {
      title: 'Total Orders',
      value: kpis.total_orders,
      subtitle: `${kpis.pending_orders} pending · ${kpis.processing_orders} processing`,
      icon: ShoppingBag,
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(49, 46, 129, 0.1))',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      iconColor: 'var(--accent-primary)',
    },
    {
      title: 'Catalog Items',
      value: kpis.total_products,
      subtitle: `${kpis.low_stock_count} low-stock alerts`,
      icon: Package,
      gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(131, 24, 67, 0.1))',
      borderColor: 'rgba(236, 72, 153, 0.3)',
      iconColor: '#ec4899',
    },
    {
      title: 'Customer Accounts',
      value: kpis.total_customers,
      subtitle: 'Registered shoppers',
      icon: Users,
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(120, 53, 15, 0.1))',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      iconColor: 'var(--accent-amber)',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            Store <span className="gradient-text">Overview</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Real-time business performance, fulfillment status, and catalog alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchDashboard} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}>
            <RotateCcw size={14} /> Refresh Metrics
          </button>
          <Link to="/admin/products" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
            <Package size={14} /> Manage Products
          </Link>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '1.5rem',
                background: card.gradient,
                borderColor: card.borderColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {card.title}
                </span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.iconColor
                }}>
                  <Icon size={18} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', lineHeight: '1.2', marginBottom: '0.25rem' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Sales Trend + Low Stock Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Left: 7-Day Revenue Trend */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>7-Day Revenue Trend</h3>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Settled Paid Orders</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', height: '180px', paddingTop: '1rem' }}>
            {sales_trend.map((day, idx) => {
              const maxRev = Math.max(...sales_trend.map((s) => s.revenue), 1000);
              const heightPct = Math.max(12, Math.round((day.revenue / maxRev) * 100));

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>
                    {day.revenue > 0 ? `₹${Math.round(day.revenue)}` : '-'}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '38px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #6366f1, rgba(99, 102, 241, 0.2))',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                    title={`${day.date}: ₹${day.revenue} (${day.orders} orders)`}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {day.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Low Stock Radar */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Low Stock Alert</h3>
            </div>
            <Link to="/admin/inventory" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>
              View Inventory →
            </Link>
          </div>

          {low_stock_items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--accent-emerald)', fontSize: '0.88rem' }}>
              ✓ All products and variants are well-stocked!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {low_stock_items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        SKU: {item.sku}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${item.stock === 0 ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                    {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Ledger */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Recent Orders</h3>
          <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>
            View All Orders ({kpis.total_orders}) →
          </Link>
        </div>

        {recent_orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No customer orders placed yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Order #</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Items</th>
                  <th style={{ padding: '0.75rem' }}>Total</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                      <Link to={`/admin/orders`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                        #{ord.order_number}
                      </Link>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontWeight: '600', color: '#ffffff' }}>{ord.customer_name || 'Customer'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ord.customer_email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {ord.total_items} items
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: '#ffffff' }}>
                      ₹{ord.grand_total}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className={`badge ${ord.status === 'delivered' ? 'badge-success' : ord.status === 'cancelled' ? 'badge-danger' : ord.status === 'shipped' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                        {ord.status_display}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: ord.payment_status === 'paid' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                        ● {ord.payment_status_display}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {ord.formatted_date}
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

export default AdminDashboard;
