import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { getAdminDashboard } from '../../services/adminService';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [error, setError] = useState(null);

  // Weekly Graph Date Selector States
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  const [selectedDate, setSelectedDate] = useState('');
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'orders'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const dateInputRef = useRef(null);

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      } catch (err) {
        dateInputRef.current.focus();
      }
    }
  };

  const fetchDashboard = useCallback(async (customParams = {}, updateFullPage = true) => {
    if (updateFullPage) {
      setIsLoading(true);
    } else {
      setIsGraphLoading(true);
    }
    setError(null);

    try {
      const params = {
        week_offset: customParams.week_offset !== undefined ? customParams.week_offset : weekOffset,
        start_date: customParams.start_date || (selectedDate || undefined),
      };

      const res = await getAdminDashboard(params);
      setData(res);

      if (res.week_info) {
        setWeekOffset(res.week_info.week_offset);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError('Could not load executive statistics.');
    } finally {
      setIsLoading(false);
      setIsGraphLoading(false);
    }
  }, [weekOffset, selectedDate]);

  useEffect(() => {
    fetchDashboard({}, true);
  }, []);

  // Handle Weekly Navigation Buttons (Previous Week / Next Week)
  const handlePrevWeek = () => {
    const nextOffset = weekOffset - 1;
    setWeekOffset(nextOffset);
    setSelectedDate('');
    fetchDashboard({ week_offset: nextOffset, start_date: '' }, false);
  };

  const handleNextWeek = () => {
    if (weekOffset >= 0 && data?.week_info?.is_current_week) return;
    const nextOffset = weekOffset + 1;
    setWeekOffset(nextOffset);
    setSelectedDate('');
    fetchDashboard({ week_offset: nextOffset, start_date: '' }, false);
  };

  const handleResetToCurrentWeek = () => {
    setWeekOffset(0);
    setSelectedDate('');
    fetchDashboard({ week_offset: 0, start_date: '' }, false);
  };

  const handleCustomDateChange = (e) => {
    const newDate = e.target.value;
    if (!newDate) return;
    setSelectedDate(newDate);
    fetchDashboard({ start_date: newDate }, false);
  };

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
        <button onClick={() => fetchDashboard({}, true)} className="btn btn-primary">
          <RotateCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  const { kpis, recent_orders, low_stock_items, sales_trend, week_info } = data;

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

  // Calculate Graph Scaling Values
  const trendItems = sales_trend || [];
  const maxMetricValue = Math.max(
    ...trendItems.map((d) => (activeMetric === 'revenue' ? parseFloat(d.revenue || 0) : d.orders || 0)),
    activeMetric === 'revenue' ? 100 : 5
  );

  const weekRevenueFormatted = `₹${(week_info?.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const weekOrdersFormatted = `${week_info?.total_orders || 0} orders`;
  const weekAvgDaily = `₹${(week_info?.avg_daily_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} / day`;

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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => fetchDashboard({}, true)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}>
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

      {/* Grid: Weekly Sales Trend Graph & Low Stock Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* ================= Weekly Sales Trend Graph ================= */}
        <div className="glass-card" style={{ padding: '1.75rem', position: 'relative', overflow: 'visible' }}>
          
          {/* Graph Header: Title & Quick Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--accent-orange)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Weekly Performance Graph
                </h3>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Daily sales & order receipts breakdown
              </div>
            </div>

            {/* Metric Mode Toggle: Revenue vs Orders */}
            <div className="metric-toggle-group">
              <button
                type="button"
                onClick={() => setActiveMetric('revenue')}
                className={`metric-toggle-btn ${activeMetric === 'revenue' ? 'active' : ''}`}
              >
                ₹ Revenue
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('orders')}
                className={`metric-toggle-btn ${activeMetric === 'orders' ? 'active' : ''}`}
              >
                📦 Orders
              </button>
            </div>
          </div>

          {/* Weekly Date Selector Toolbar: Unified Single Line with Icon-Only Nav & Embedded Date Picker Pill */}
          <div className="week-selector-toolbar-unified">
            {/* Left Button: Previous Week (Icon Only) */}
            <button
              type="button"
              onClick={handlePrevWeek}
              className="week-icon-btn"
              title="Previous Week"
              aria-label="Previous Week"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Center: Selected Week Date Range Badge (Click opens native calendar) */}
            <div 
              className="week-badge-pill-interactive" 
              onClick={handleOpenDatePicker}
              title="Click to open calendar and choose a date / week"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDatePicker();
                }
              }}
            >
              <Calendar size={15} color="var(--accent-orange)" />
              <span className="week-range-text">
                {week_info?.formatted_range || 'Current Week'}
              </span>
              {week_info?.is_current_week && (
                <span className="current-week-tag">This Week</span>
              )}

              {/* Invisible native date input */}
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate || week_info?.start_date || ''}
                onChange={handleCustomDateChange}
                onClick={(e) => {
                  // Allow direct click on input to also open picker
                  try {
                    if (typeof e.target.showPicker === 'function') {
                      e.target.showPicker();
                    }
                  } catch (err) {}
                }}
                className="pill-date-input-overlay"
                aria-label="Pick date for week"
              />
            </div>

            {/* Right Button: Next Week (Icon Only) */}
            <button
              type="button"
              onClick={handleNextWeek}
              disabled={week_info?.is_current_week || weekOffset >= 0}
              className={`week-icon-btn ${(week_info?.is_current_week || weekOffset >= 0) ? 'disabled' : ''}`}
              title={week_info?.is_current_week ? 'Already on current week' : 'Next Week'}
              aria-label="Next Week"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Quick Jump Shortcuts Row */}
          <div className="week-quick-shortcuts">
            <button
              type="button"
              onClick={handleResetToCurrentWeek}
              className={`shortcut-chip ${weekOffset === 0 && !selectedDate ? 'active' : ''}`}
            >
              This Week (Live)
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset(-1);
                setSelectedDate('');
                fetchDashboard({ week_offset: -1, start_date: '' }, false);
              }}
              className={`shortcut-chip ${weekOffset === -1 ? 'active' : ''}`}
            >
              Last Week
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset(-2);
                setSelectedDate('');
                fetchDashboard({ week_offset: -2, start_date: '' }, false);
              }}
              className={`shortcut-chip ${weekOffset === -2 ? 'active' : ''}`}
            >
              2 Wks Ago
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset(-3);
                setSelectedDate('');
                fetchDashboard({ week_offset: -3, start_date: '' }, false);
              }}
              className={`shortcut-chip ${weekOffset === -3 ? 'active' : ''}`}
            >
              3 Wks Ago
            </button>
          </div>

          {/* Weekly Summary KPIs Mini-Bar */}
          <div className="week-summary-strip">
            <div className="summary-stat">
              <span className="stat-label">Week Total:</span>
              <span className="stat-val highlight">
                {activeMetric === 'revenue' ? weekRevenueFormatted : weekOrdersFormatted}
              </span>
            </div>
            <div className="summary-stat-sep" />
            <div className="summary-stat">
              <span className="stat-label">Daily Avg:</span>
              <span className="stat-val">{weekAvgDaily}</span>
            </div>
            {week_info?.best_day && (
              <>
                <div className="summary-stat-sep" />
                <div className="summary-stat">
                  <span className="stat-label">Peak:</span>
                  <span className="stat-val">
                    {week_info.best_day.day_name} (₹{week_info.best_day.revenue.toLocaleString('en-IN')})
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Interactive Weekly Bar Chart Visualization */}
          <div className={`chart-stage-container ${isGraphLoading ? 'loading' : ''}`}>
            {isGraphLoading && (
              <div className="chart-loading-overlay">
                <div className="chart-spinner" />
                <span>Loading week metrics...</span>
              </div>
            )}

            <div className="bars-flex-container">
              {trendItems.map((day, idx) => {
                const dayVal = activeMetric === 'revenue' ? parseFloat(day.revenue || 0) : (day.orders || 0);
                const heightPercent = maxMetricValue > 0 ? Math.max(8, (dayVal / maxMetricValue) * 100) : 8;
                const isHovered = hoveredBarIndex === idx;

                const formattedDisplayVal = activeMetric === 'revenue'
                  ? (dayVal >= 1000 ? `₹${(dayVal / 1000).toFixed(1)}k` : `₹${dayVal}`)
                  : `${dayVal}`;

                return (
                  <div
                    key={idx}
                    className={`bar-column ${isHovered ? 'hovered' : ''} ${day.is_today ? 'is-today' : ''}`}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Floating Detailed Tooltip on Hover */}
                    {isHovered && (
                      <div className="bar-hover-tooltip">
                        <div className="tooltip-date">{day.full_day_name || day.day_name}, {day.date}</div>
                        <div className="tooltip-row">
                          <span>Revenue:</span>
                          <strong>₹{parseFloat(day.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="tooltip-row">
                          <span>Orders:</span>
                          <strong>{day.orders} {day.orders === 1 ? 'order' : 'orders'}</strong>
                        </div>
                        {week_info?.total_revenue > 0 && activeMetric === 'revenue' && (
                          <div className="tooltip-share">
                            {((parseFloat(day.revenue || 0) / week_info.total_revenue) * 100).toFixed(1)}% of week
                          </div>
                        )}
                      </div>
                    )}

                    {/* Value Pill on Top of Bar */}
                    <span className="bar-top-value">
                      {dayVal > 0 ? formattedDisplayVal : '-'}
                    </span>

                    {/* Bar Pillar */}
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${heightPercent}%`,
                          background: dayVal > 0 
                            ? (day.is_today ? 'linear-gradient(180deg, #ea580c 0%, #f59e0b 100%)' : 'var(--accent-gradient)')
                            : '#e7e5e4'
                        }}
                      />
                    </div>

                    {/* X-Axis Labels */}
                    <div className="bar-axis-label">
                      <span className="day-name">{day.day_name}</span>
                      <span className="day-date">{day.date}</span>
                      {day.is_today && <span className="today-dot" title="Today" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= Right: Low Stock Radar ================= */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
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

      {/* Internal Page Styles */}
      <style>{`
        /* Metric Toggle Buttons */
        .metric-toggle-group {
          display: flex;
          background: var(--bg-surface, #f5f5f4);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--border-color, #e7e5e4);
        }

        .metric-toggle-btn {
          border: none;
          background: transparent;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary, #57534e);
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .metric-toggle-btn.active {
          background: #ffffff;
          color: var(--accent-orange, #ea580c);
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        /* Unified Single-Line Weekly Toolbar */
        .week-selector-toolbar-unified {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafaf9;
          border: 1px solid var(--border-color, #e7e5e4);
          border-radius: 14px;
          padding: 0.45rem 0.6rem;
          margin-bottom: 0.85rem;
          gap: 0.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        .week-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid var(--border-color, #e7e5e4);
          color: var(--text-primary, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        .week-icon-btn:hover:not(.disabled) {
          background: #ffffff;
          border-color: var(--accent-orange, #ea580c);
          color: var(--accent-orange, #ea580c);
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(234, 88, 12, 0.18);
        }

        .week-icon-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f5f5f4;
          border-color: #e7e5e4;
        }

        .week-badge-pill-interactive {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 1.5px solid rgba(245, 158, 11, 0.4);
          padding: 0.45rem 1.1rem;
          border-radius: 20px;
          box-shadow: 0 1px 4px rgba(245, 158, 11, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          max-width: 100%;
          overflow: hidden;
        }

        .week-badge-pill-interactive:hover {
          border-color: var(--accent-orange, #ea580c);
          box-shadow: 0 2px 10px rgba(234, 88, 12, 0.2);
          transform: translateY(-1px);
        }

        .week-range-text {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          white-space: nowrap;
        }

        .current-week-tag {
          font-size: 0.68rem;
          font-weight: 800;
          color: #059669;
          background: rgba(16, 185, 129, 0.15);
          padding: 0.15rem 0.45rem;
          border-radius: 10px;
          white-space: nowrap;
        }

        .pill-date-input-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 5;
        }

        /* Shortcuts */
        .week-quick-shortcuts {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 1rem;
          overflow-x: auto;
          padding-bottom: 0.2rem;
        }

        .shortcut-chip {
          background: transparent;
          border: 1px solid var(--border-color, #e7e5e4);
          color: var(--text-secondary, #57534e);
          font-size: 0.74rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 16px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .shortcut-chip:hover {
          border-color: var(--accent-orange, #ea580c);
          color: var(--accent-orange, #ea580c);
        }

        .shortcut-chip.active {
          background: rgba(234, 88, 12, 0.12);
          border-color: var(--accent-orange, #ea580c);
          color: var(--accent-orange, #ea580c);
          font-weight: 800;
        }

        /* Week Summary Strip */
        .week-summary-strip {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.6rem 0.85rem;
          background: var(--bg-surface, #f5f5f4);
          border-radius: 10px;
          margin-bottom: 1.25rem;
          font-size: 0.8rem;
          flex-wrap: wrap;
        }

        .summary-stat {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .stat-label {
          color: var(--text-secondary, #57534e);
          font-weight: 600;
        }

        .stat-val {
          font-weight: 800;
          color: var(--text-primary, #0f172a);
        }

        .stat-val.highlight {
          color: var(--accent-orange, #ea580c);
        }

        .summary-stat-sep {
          width: 1px;
          height: 16px;
          background: var(--border-color, #e7e5e4);
        }

        /* Chart Stage & Bars */
        .chart-stage-container {
          position: relative;
          height: 200px;
          padding-top: 1.5rem;
          border-bottom: 1px solid var(--border-color, #e7e5e4);
        }

        .chart-stage-container.loading {
          opacity: 0.6;
        }

        .chart-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary, #57534e);
          z-index: 10;
        }

        .chart-spinner {
          width: 22px;
          height: 22px;
          border: 2.5px solid #e7e5e4;
          border-top-color: var(--accent-orange, #ea580c);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .bars-flex-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 100%;
          gap: 0.65rem;
          position: relative;
        }

        .bar-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          position: relative;
          cursor: pointer;
        }

        .bar-top-value {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-secondary, #57534e);
          margin-bottom: 0.35rem;
          transition: color 0.15s ease, transform 0.15s ease;
        }

        .bar-column.hovered .bar-top-value {
          color: var(--accent-orange, #ea580c);
          transform: translateY(-2px);
        }

        .bar-track {
          width: 100%;
          max-width: 44px;
          height: 120px;
          display: flex;
          align-items: flex-end;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 6px 6px 0 0;
          overflow: hidden;
        }

        .bar-fill {
          width: 100%;
          border-radius: 6px 6px 0 0;
          transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
        }

        .bar-column.hovered .bar-fill {
          box-shadow: 0 0 12px rgba(234, 88, 12, 0.45);
          filter: brightness(1.05);
        }

        .bar-axis-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 0.5rem;
          position: relative;
        }

        .day-name {
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          line-height: 1.1;
        }

        .day-date {
          font-size: 0.68rem;
          color: var(--text-muted, #a8a29e);
          margin-top: 0.15rem;
        }

        .today-dot {
          width: 5px;
          height: 5px;
          background: #ea580c;
          border-radius: 50%;
          position: absolute;
          bottom: -7px;
        }

        /* Detailed Tooltip on Hover */
        .bar-hover-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #ffffff;
          padding: 0.6rem 0.85rem;
          border-radius: 10px;
          font-size: 0.75rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          white-space: nowrap;
          z-index: 50;
          pointer-events: none;
          animation: tooltipFadeIn 0.15s ease-out;
        }

        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translate(-50%, 4px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .tooltip-date {
          font-weight: 800;
          color: #fbbf24;
          margin-bottom: 0.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding-bottom: 0.25rem;
        }

        .tooltip-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 0.2rem;
          color: #cbd5e1;
        }

        .tooltip-row strong {
          color: #ffffff;
        }

        .tooltip-share {
          margin-top: 0.35rem;
          font-size: 0.7rem;
          color: #10b981;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .week-selector-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .week-nav-btn {
            justify-content: center;
            width: 100%;
          }

          .chart-stage-container {
            height: 180px;
          }

          .bar-track {
            height: 100px;
          }

          .bar-top-value {
            font-size: 0.65rem;
          }

          .day-name {
            font-size: 0.68rem;
          }

          .day-date {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
