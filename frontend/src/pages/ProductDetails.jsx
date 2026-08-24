import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          Product Details View #{id || 'Preview'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem' }}>
          Detailed product specifications, dynamic image galleries, stock status, and add-to-cart operations will be linked to Django backend APIs.
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;
