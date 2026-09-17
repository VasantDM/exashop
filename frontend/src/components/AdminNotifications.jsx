import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  X, 
  ChevronRight, 
  Clock,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  Boxes
} from 'lucide-react';
import { getAdminNotifications } from '../services/adminService';

// Web Audio API Gentle Two-Tone Chime Generator (No external audio file needed)
const playOrderChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2 (Higher harmony)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.debug('Web Audio chime not supported or muted:', e);
  }
};

// Format Relative Time (e.g., 'Just now', '5m ago', '2h ago', 'Yesterday')
const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Recent';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);

    if (diffSecs < 45) return 'Just now';
    if (diffSecs < 3600) {
      const mins = Math.max(1, Math.floor(diffSecs / 60));
      return `${mins}m ago`;
    }
    if (diffSecs < 86400) {
      const hours = Math.floor(diffSecs / 3600);
      return `${hours}h ago`;
    }
    const days = Math.floor(diffSecs / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
};

const READ_STORAGE_KEY = 'shopigo_admin_read_notifications_v1';
const SOUND_STORAGE_KEY = 'shopigo_admin_notification_sound_v1';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'orders' | 'inventory'
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(READ_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Floating live toast popup when a brand new order arrives
  const [floatingToast, setFloatingToast] = useState(null);

  const containerRef = useRef(null);
  const prevLatestOrderIdRef = useRef(null);
  const isInitialFetchRef = useRef(true);

  // Save read IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(readIds));
    } catch (e) {
      console.error(e);
    }
  }, [readIds]);

  // Save sound preference
  const toggleSound = (e) => {
    e.stopPropagation();
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(nextVal));
    } catch (e) {
      console.error(e);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch Notifications from Backend
  const fetchNotifications = useCallback(async (isPolling = false) => {
    if (!isPolling) setIsLoading(true);
    try {
      const res = await getAdminNotifications();
      const notifs = res.notifications || [];
      setNotifications(notifs);

      const latestOrderId = res.latest_order_id;

      // Check if new order arrived while user is browsing (excluding initial load)
      if (!isInitialFetchRef.current && latestOrderId && prevLatestOrderIdRef.current && latestOrderId !== prevLatestOrderIdRef.current) {
        // Find the newest order
        const newestOrder = notifs.find(n => n.type === 'order' && n.order_id === latestOrderId);
        if (newestOrder) {
          // Trigger audio chime
          if (soundEnabled) {
            playOrderChime();
          }
          // Show floating toast alert
          setFloatingToast({
            title: `New Order Placed!`,
            message: `${newestOrder.customer_name} • ₹${newestOrder.amount?.toLocaleString()} (#${newestOrder.order_number})`,
            orderNumber: newestOrder.order_number,
            timestamp: Date.now()
          });
        }
      }

      if (latestOrderId) {
        prevLatestOrderIdRef.current = latestOrderId;
      }
      isInitialFetchRef.current = false;
    } catch (err) {
      console.debug('Failed to fetch admin notifications:', err);
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  }, [soundEnabled]);

  // Initial Load and Auto-Polling every 20 seconds
  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Auto-dismiss floating toast after 6 seconds
  useEffect(() => {
    if (!floatingToast) return;
    const timer = setTimeout(() => {
      setFloatingToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [floatingToast]);

  // Compute Unread Counts
  const unreadNotifications = notifications.filter(n => !readIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const ordersCount = notifications.filter(n => n.type === 'order').length;
  const inventoryCount = notifications.filter(n => n.type === 'stock_alert').length;

  // Filtered Notifications based on active tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'inventory') return n.type === 'stock_alert';
    return true;
  });

  // Mark all as read
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    const allIds = notifications.map(n => n.id);
    setReadIds(Array.from(new Set([...readIds, ...allIds])));
  };

  // Mark single as read and navigate
  const handleNotificationClick = (notif) => {
    if (!readIds.includes(notif.id)) {
      setReadIds(prev => [...prev, notif.id]);
    }
    setIsOpen(false);

    if (notif.type === 'order') {
      navigate(`/admin/orders?search=${encodeURIComponent(notif.order_number || '')}`);
    } else if (notif.type === 'stock_alert') {
      navigate('/admin/inventory');
    } else if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="admin-notifications-wrapper" ref={containerRef}>
      {/* Floating Alert Toast when a New Order arrives */}
      {floatingToast && (
        <div className="admin-order-alert-toast" role="alert">
          <div className="alert-toast-icon">
            <ShoppingBag size={20} />
          </div>
          <div className="alert-toast-body">
            <div className="alert-toast-title">
              <span>{floatingToast.title}</span>
              <span className="alert-toast-badge">JUST NOW</span>
            </div>
            <div className="alert-toast-message">{floatingToast.message}</div>
          </div>
          <button 
            className="alert-toast-action"
            onClick={() => {
              navigate(`/admin/orders?search=${encodeURIComponent(floatingToast.orderNumber || '')}`);
              setFloatingToast(null);
            }}
          >
            View Order
          </button>
          <button 
            className="alert-toast-close"
            onClick={() => setFloatingToast(null)}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Bell Icon Trigger */}
      <button
        type="button"
        className={`admin-bell-button ${isOpen ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        title="Store Notifications & Live Orders"
      >
        <Bell size={19} className="bell-icon" />

        {/* Pulsing ring indicator when there are unread items */}
        {unreadCount > 0 && (
          <span className="admin-bell-ping-ring" />
        )}

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="admin-bell-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="admin-notifications-dropdown animate-fade-in">
          {/* Header */}
          <div className="notif-dropdown-header">
            <div className="notif-header-title-row">
              <div className="notif-title-group">
                <span className="notif-title">Notifications</span>
                <span className="notif-live-indicator">
                  <span className="live-dot" /> Live Feed
                </span>
              </div>
              <div className="notif-header-actions">
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`notif-icon-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
                  title={soundEnabled ? "Mute order sound chime" : "Enable order sound chime"}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="notif-mark-all-btn"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="notif-filter-tabs">
              <button
                type="button"
                className={`notif-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All <span className="tab-count">{notifications.length}</span>
              </button>
              <button
                type="button"
                className={`notif-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders <span className="tab-count">{ordersCount}</span>
              </button>
              <button
                type="button"
                className={`notif-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                Stock Alerts <span className="tab-count">{inventoryCount}</span>
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="notif-list-container">
            {isLoading && notifications.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-spinner" />
                <p>Loading live notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notif-empty-state">
                <div className="empty-icon-circle">
                  <PackageCheck size={28} />
                </div>
                <h4>All Caught Up!</h4>
                <p>No {activeTab !== 'all' ? activeTab : ''} notifications right now. New customer orders will appear here automatically.</p>
              </div>
            ) : (
              <div className="notif-items-list">
                {filteredNotifications.map((notif) => {
                  const isRead = readIds.includes(notif.id);
                  const isOrder = notif.type === 'order';

                  return (
                    <div
                      key={notif.id}
                      className={`notif-item-card ${isRead ? 'read' : 'unread'} ${isOrder ? 'order-card' : 'stock-card'}`}
                      onClick={() => handleNotificationClick(notif)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* Avatar / Category Icon */}
                      <div className={`notif-item-icon ${isOrder ? 'icon-order' : 'icon-stock'}`}>
                        {isOrder ? <ShoppingBag size={18} /> : <AlertTriangle size={18} />}
                      </div>

                      {/* Details */}
                      <div className="notif-item-body">
                        <div className="notif-item-top">
                          <span className="notif-item-title">{notif.title}</span>
                          <span className="notif-item-time">{formatTimeAgo(notif.created_at)}</span>
                        </div>

                        <p className="notif-item-msg">{notif.message}</p>

                        {/* Metadata Tags */}
                        <div className="notif-item-meta">
                          {isOrder && (
                            <>
                              <span className={`status-pill pill-${notif.status || 'pending'}`}>
                                {notif.status ? notif.status.toUpperCase() : 'PENDING'}
                              </span>
                              {notif.payment_status && (
                                <span className={`payment-pill pill-pay-${notif.payment_status}`}>
                                  {notif.payment_status === 'paid' ? '● Paid' : '● Unpaid'}
                                </span>
                              )}
                            </>
                          )}
                          {!isOrder && notif.stock !== undefined && (
                            <span className="stock-alert-pill">
                              {notif.stock <= 0 ? 'Out of Stock' : `${notif.stock} units remaining`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread Accent Dot */}
                      {!isRead && <span className="notif-unread-dot" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="notif-dropdown-footer">
            <button
              type="button"
              className="notif-footer-link"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/orders');
              }}
            >
              <ShoppingBag size={14} />
              <span>All Orders</span>
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              className="notif-footer-link"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/inventory');
              }}
            >
              <Boxes size={14} />
              <span>Stock Radar</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .admin-notifications-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .admin-bell-button {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md, 10px);
          background: #ffffff;
          border: 1px solid var(--border-color, #e2e8f0);
          color: var(--text-secondary, #475569);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
        }

        .admin-bell-button:hover,
        .admin-bell-button.active {
          background: #f8fafc;
          border-color: rgba(245, 158, 11, 0.4);
          color: var(--accent-orange, #f59e0b);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
        }

        .admin-bell-button.has-unread {
          color: var(--accent-orange, #f59e0b);
        }

        .admin-bell-ping-ring {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ef4444;
          opacity: 0.75;
          animation: bellPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes bellPing {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          70%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        .admin-bell-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 5px rgba(239, 68, 68, 0.4);
          line-height: 1;
        }

        /* Dropdown Popover Window */
        .admin-notifications-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 380px;
          max-width: calc(100vw - 24px);
          background: #ffffff;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 16px;
          box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04);
          z-index: 1100;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: notifSlideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes notifSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .notif-dropdown-header {
          padding: 1rem 1.1rem 0.65rem;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          background: #fafaf9;
        }

        .notif-header-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .notif-title-group {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .notif-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          letter-spacing: -0.01em;
        }

        .notif-live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: #16a34a;
          background: rgba(34, 197, 94, 0.12);
          padding: 0.18rem 0.5rem;
          border-radius: 999px;
          border: 1px solid rgba(34, 197, 94, 0.25);
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          animation: livePulse 1.5s infinite;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .notif-header-actions {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .notif-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: #ffffff;
          color: var(--text-secondary, #64748b);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .notif-icon-btn.sound-on {
          color: var(--accent-orange, #f59e0b);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .notif-icon-btn:hover {
          background: #f1f5f9;
        }

        .notif-mark-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.28rem 0.55rem;
          border-radius: 6px;
          background: #ffffff;
          border: 1px solid var(--border-color, #e2e8f0);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .notif-mark-all-btn:hover {
          background: #f8fafc;
          color: var(--accent-orange, #f59e0b);
          border-color: rgba(245, 158, 11, 0.3);
        }

        /* Tabs */
        .notif-filter-tabs {
          display: flex;
          gap: 0.35rem;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 8px;
        }

        .notif-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.35rem 0.5rem;
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-secondary, #64748b);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .notif-tab-btn.active {
          background: #ffffff;
          color: var(--text-primary, #0f172a);
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .tab-count {
          font-size: 0.68rem;
          background: rgba(0, 0, 0, 0.06);
          padding: 0.05rem 0.35rem;
          border-radius: 999px;
          font-weight: 700;
        }

        .notif-tab-btn.active .tab-count {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-orange, #f59e0b);
        }

        /* List container */
        .notif-list-container {
          max-height: 380px;
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .notif-empty-state {
          padding: 2.5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent-orange, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.85rem;
        }

        .notif-empty-state h4 {
          margin: 0 0 0.35rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
        }

        .notif-empty-state p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted, #94a3b8);
          line-height: 1.4;
          max-width: 260px;
        }

        .notif-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid rgba(245, 158, 11, 0.2);
          border-top-color: var(--accent-orange, #f59e0b);
          border-radius: 50%;
          animation: notifSpin 0.75s linear infinite;
          margin-bottom: 0.75rem;
        }

        @keyframes notifSpin {
          to { transform: rotate(360deg); }
        }

        /* Items */
        .notif-items-list {
          display: flex;
          flex-direction: column;
        }

        .notif-item-card {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-color, #f1f5f9);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .notif-item-card:hover {
          background: #f8fafc;
        }

        .notif-item-card.unread {
          background: rgba(245, 158, 11, 0.04);
        }

        .notif-item-card.unread:hover {
          background: rgba(245, 158, 11, 0.08);
        }

        .notif-item-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-order {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.2));
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .icon-stock {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.2));
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .notif-item-body {
          flex: 1;
          min-width: 0;
        }

        .notif-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.2rem;
        }

        .notif-item-title {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notif-item-time {
          font-size: 0.7rem;
          color: var(--text-muted, #94a3b8);
          font-weight: 500;
          flex-shrink: 0;
        }

        .notif-item-msg {
          margin: 0 0 0.4rem;
          font-size: 0.78rem;
          color: var(--text-secondary, #475569);
          line-height: 1.35;
          word-break: break-word;
        }

        .notif-item-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .status-pill {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.12rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .pill-pending {
          background: #fef3c7;
          color: #b45309;
        }

        .pill-processing {
          background: #e0e7ff;
          color: #4338ca;
        }

        .pill-shipped {
          background: #e0f2fe;
          color: #0369a1;
        }

        .pill-delivered {
          background: #dcfce7;
          color: #15803d;
        }

        .pill-cancelled {
          background: #fee2e2;
          color: #b91c1c;
        }

        .payment-pill {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.12rem 0.4rem;
          border-radius: 4px;
        }

        .pill-pay-paid {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .pill-pay-pending,
        .pill-pay-failed {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .stock-alert-pill {
          font-size: 0.65rem;
          font-weight: 700;
          color: #dc2626;
          background: #fee2e2;
          padding: 0.12rem 0.45rem;
          border-radius: 4px;
        }

        .notif-unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-orange, #f59e0b);
          box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
          position: absolute;
          top: 1rem;
          right: 0.85rem;
        }

        /* Footer */
        .notif-dropdown-footer {
          padding: 0.6rem 0.85rem;
          border-top: 1px solid var(--border-color, #e2e8f0);
          background: #fafaf9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .notif-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-orange, #f59e0b);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.3rem 0.5rem;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .notif-footer-link:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        /* Floating Alert Toast */
        .admin-order-alert-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(245, 158, 11, 0.4);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.2);
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          max-width: 420px;
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .alert-toast-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4);
        }

        .alert-toast-body {
          flex: 1;
          min-width: 0;
        }

        .alert-toast-title {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          margin-bottom: 0.15rem;
        }

        .alert-toast-badge {
          font-size: 0.6rem;
          font-weight: 800;
          background: #dcfce7;
          color: #15803d;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .alert-toast-message {
          font-size: 0.78rem;
          color: var(--text-secondary, #475569);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .alert-toast-action {
          padding: 0.38rem 0.75rem;
          border-radius: 6px;
          background: var(--accent-gradient, linear-gradient(135deg, #f59e0b, #ea580c));
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
          transition: opacity 0.15s ease;
        }

        .alert-toast-action:hover {
          opacity: 0.92;
        }

        .alert-toast-close {
          background: none;
          border: none;
          color: var(--text-muted, #94a3b8);
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .alert-toast-close:hover {
          color: var(--text-primary, #0f172a);
          background: #f1f5f9;
        }

        @media (max-width: 768px) {
          .admin-notifications-dropdown {
            position: fixed;
            top: 60px;
            left: 10px;
            right: 10px;
            width: auto;
            max-width: none;
            max-height: calc(100vh - 120px);
          }

          .notif-list-container {
            max-height: 50vh;
          }

          .admin-order-alert-toast {
            top: 10px;
            left: 10px;
            right: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminNotifications;
