import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Layers, 
  ShieldCheck, 
  Database, 
  Server, 
  Lock, 
  ArrowRight,
  Sparkles,
  Package,
  CreditCard,
  Star
} from 'lucide-react';
import HealthWidget from '../components/HealthWidget';

const Home = () => {
  const modularApps = [
    { name: 'Users & Auth', desc: 'Custom User model, JWT token lifecycle, role-based customer & admin access', icon: Lock, phase: 'Phase 2' },
    { name: 'Products Catalog', desc: 'SKU, pricing, discount calculations, inventory stock, rich image gallery', icon: Package, phase: 'Phase 3' },
    { name: 'Categories & Brands', desc: 'Hierarchical taxonomy, slugged URL routing, category-level filtering', icon: Layers, phase: 'Phase 3' },
    { name: 'Shopping Cart', desc: 'User-bound cart items, stock validations, real-time subtotal & discounts', icon: ShoppingBag, phase: 'Phase 4' },
    { name: 'Orders Engine', desc: 'Order state lifecycle (PENDING to DELIVERED), invoice totals, addresses', icon: ArrowRight, phase: 'Phase 5' },
    { name: 'Payments Gateway', desc: 'Secure transaction processing, status callbacks, multi-currency support', icon: CreditCard, phase: 'Phase 6' },
    { name: 'Reviews & Ratings', desc: 'Verified customer ratings, text reviews, aggregate product scores', icon: Star, phase: 'Phase 3/7' },
    { name: 'Admin Operations', desc: 'Full inventory control, order dispatching, revenue analytics console', icon: ShieldCheck, phase: 'Phase 7' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 3.5rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818cf8',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} /> Phase 1 Setup Initialized & Verified
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: '800',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem'
        }}>
          Next-Generation <span className="gradient-text">E-Commerce Platform</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2rem',
          maxWidth: '720px',
          margin: '0 auto 2rem'
        }}>
          Engineered with <strong>Python Django REST Framework</strong>, <strong>PostgreSQL 18</strong>, and <strong>React.js</strong>. Built with clean architecture, versioned REST APIs (<code>/api/v1/</code>), and JWT security.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Explore Products <ArrowRight size={18} />
          </Link>
          <Link to="/admin" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Admin Console
          </Link>
        </div>
      </section>

      {/* Live System Health Widget */}
      <HealthWidget />

      {/* Modular Architecture Grid */}
      <section style={{ marginTop: '3.5rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Modular Django Backend Architecture
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Each business capability is encapsulated into an independent app under <code>backend/apps/</code>.
          </p>
        </div>

        <div className="grid-4">
          {modularApps.map((app) => {
            const Icon = app.icon;
            return (
              <div key={app.name} className="glass-card" style={{ padding: '1.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-primary)',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {app.phase}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                  {app.name}
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {app.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
