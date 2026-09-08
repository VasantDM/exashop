import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Sparkles
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
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Failed to Load Dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={fetchDashboard} className="btn btn-primary">
          <RotateCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  const { kpis, recent_orders, low_stock_items, sales_trend } = data;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `₹${parseFloat(kpis.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: 'From settled customer orders',
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      borderColor: '#a7f3d0',
      iconColor: '#059669',
    },
    {
      title: 'Total Orders',
      value: kpis.total_orders,
      subtitle: `${kpis.pending_orders} pending · ${kpis.processing_orders} processing`,
      icon: ShoppingBag,
      gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderColor: '#fde68a',
      iconColor: 'var(--accent-orange)',
    },
    {
      title: 'Catalog Items',
      value: kpis.total_products,
      subtitle: `${kpis.low_stock_count} low-stock alerts`,
      icon: Package,
      gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      borderColor: '#fed7aa',
      iconColor: '#ea580c',
    },
    {
      title: 'Customer Accounts',
      value: kpis.total_customers,
      subtitle: 'Registered shoppers',
      icon: Users,
      gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderColor: '#bbf7d0',
      iconColor: '#16a34a',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
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
                justifyContent: 'space-between',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {card.title}
                </span>
                <div style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  <Icon size={20} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: '500' }}>
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Sales Trend & Low Stock Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left: 7-Day Revenue Trend */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>7-Day Revenue Velocity</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Daily order receipts breakdown</div>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Live Graph</span>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', gap: '0.75rem', paddingTop: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            {(sales_trend || []).map((day, idx) => {
              const maxRev = Math.max(...(sales_trend || []).map(d => parseFloat(d.revenue || 0)), 100);
              const heightPercent = Math.max(12, (parseFloat(day.revenue || 0) / maxRev) * 100);

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: 'var(--accent-gradient)',
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
              <AlertTriangle size={18} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Low Stock Alert</h3>
            </div>
            <Link to="/admin/inventory" style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: '700' }}>
              View Inventory →
            </Link>
          </div>

          {low_stock_items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#059669', fontSize: '0.88rem', fontWeight: '600' }}>
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
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        SKU: {item.sku}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${item.stock === 0 ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.72rem' }}>
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
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Recent Orders</h3>
          <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: '700' }}>
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
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', backgroundColor: '#fafaf9' }}>
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
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: 'var(--accent-orange)' }}>
                      <Link to={`/admin/orders`} style={{ color: 'var(--accent-orange)', textDecoration: 'none' }}>
                        #{ord.order_number}
                      </Link>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{ord.customer_name || 'Customer'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ord.customer_email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {ord.total_items} items
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      ₹{ord.grand_total}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className={`badge ${ord.status === 'delivered' ? 'badge-success' : ord.status === 'cancelled' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.72rem' }}>
                        {ord.status_display}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: ord.payment_status === 'paid' ? '#059669' : 'var(--text-secondary)' }}>
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
