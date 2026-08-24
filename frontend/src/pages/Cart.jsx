import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Shopping Cart</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Review items, calculate discounts, and proceed to checkout.
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
          <ShoppingBag size={32} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Cart System Ready for Phase 4
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
          Authenticated customer cart with quantity increment/decrement, live stock verification, subtotal and coupon calculation will be integrated in Phase 4.
        </p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default Cart;
