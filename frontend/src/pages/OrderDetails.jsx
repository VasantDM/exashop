import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          Order #{id || 'Preview'} Details
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem' }}>
          Detailed invoice breakdown, delivery timeline, shipping address, and tracking status.
        </p>
      </div>
    </div>
  );
};

export default OrderDetails;
