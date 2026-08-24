import React from 'react';
import { ShoppingBag, Filter, Search, Sparkles } from 'lucide-react';

const Products = () => {
  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse high quality products with advanced search, filtering, and pagination.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            <Filter size={16} /> Filters
          </button>
        </div>
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
          Catalog Module Ready for Phase 3
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
          Database models (Products, Brands, Categories, Images), Django REST API endpoints with pagination and filtering will be implemented in Phase 3.
        </p>
        <span className="badge badge-info">
          <Sparkles size={14} /> Phase 1 Setup Active
        </span>
      </div>
    </div>
  );
};

export default Products;
