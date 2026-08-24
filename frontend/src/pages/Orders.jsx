import React from 'react';
import { Package, Clock, CheckCircle2 } from 'lucide-react';

const Orders = () => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Your Orders</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Track recent purchases, shipments, and order statuses.
        </p>
      </div>

      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--accent-primary)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Package size={32} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Orders System Ready for Phase 5
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
          Orders backend models (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED) and historical order views will be available in Phase 5.
        </p>
      </div>
    </div>
  );
};

export default Orders;
