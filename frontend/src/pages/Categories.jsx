import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

const Categories = () => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Product Categories</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Explore products organized by structured category hierarchies and brands.
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
          <Layers size={32} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Categories Architecture
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
          The Categories module under <code>backend/apps/categories/</code> will serve structured taxonomy endpoints for subcategories, parent categories, and brand classifications in Phase 3.
        </p>
        <span className="badge badge-info">
          <Sparkles size={14} /> Backend App Registered
        </span>
      </div>
    </div>
  );
};

export default Categories;
