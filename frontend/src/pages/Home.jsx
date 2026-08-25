import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Layers, 
  ShieldCheck, 
  Star,
  Lock, 
  ArrowRight,
  Sparkles,
  Package,
  CreditCard,
  Zap,
  TrendingUp
} from 'lucide-react';
import HealthWidget from '../components/HealthWidget';
import { getFeaturedProducts } from '../services/catalogService';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeaturedProducts();
        setFeaturedProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const modularApps = [
    { name: 'Users & Auth', desc: 'Custom User model, JWT token lifecycle, role-based customer & admin access', icon: Lock, status: 'Completed', active: true },
    { name: 'Products Catalog', desc: 'SKU, pricing, discount calculations, inventory stock, rich image gallery', icon: Package, status: 'Active (Phase 3)', active: true },
    { name: 'Categories & Brands', desc: 'Hierarchical taxonomy, slugged URL routing, category-level filtering', icon: Layers, status: 'Active (Phase 3)', active: true },
    { name: 'Shopping Cart', desc: 'User-bound cart items, stock validations, real-time subtotal & discounts', icon: ShoppingBag, status: 'Phase 4', active: false },
    { name: 'Orders Engine', desc: 'Order state lifecycle (PENDING to DELIVERED), invoice totals, addresses', icon: ArrowRight, status: 'Phase 5', active: false },
    { name: 'Payments Gateway', desc: 'Secure transaction processing, status callbacks, multi-currency support', icon: CreditCard, status: 'Phase 6', active: false },
    { name: 'Reviews & Ratings', desc: 'Verified customer ratings, text reviews, aggregate product scores', icon: Star, status: 'Phase 7', active: false },
    { name: 'Admin Operations', desc: 'Full inventory control, order dispatching, revenue analytics console', icon: ShieldCheck, status: 'Phase 7', active: false },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 3.5rem',
        maxWidth: '920px',
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
          <Sparkles size={16} /> Phase 3: Catalog & Search Active
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
          maxWidth: '740px',
          margin: '0 auto 2rem'
        }}>
          Engineered with <strong>Python Django REST Framework</strong>, <strong>PostgreSQL 18</strong>, and <strong>React.js</strong>. Versioned REST APIs (<code>/api/v1/</code>), SimpleJWT authentication, and catalog engine.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            Explore Catalog <ArrowRight size={18} />
          </Link>
          <Link to="/categories" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <Layers size={18} /> Categories
          </Link>
        </div>
      </section>

      {/* Featured Products Showcase Section */}
      {featuredProducts.length > 0 && (
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <TrendingUp size={15} /> Trending Now
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
                Featured Products
              </h2>
            </div>
            <Link to="/products?featured=true" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: '600' }}>
              View All Featured <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {featuredProducts.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Link to={`/products/${prod.slug}`} style={{ display: 'block', position: 'relative', marginBottom: '0.85rem', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                  <img
                    src={prod.primary_image}
                    alt={prod.name}
                    style={{
                      width: '100%',
                      height: '190px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  {prod.has_discount && (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'var(--accent-rose)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      -{prod.discount_percentage}% OFF
                    </span>
                  )}
                </Link>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{prod.brand_name || 'Electronics'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-amber)' }}>
                      <Star size={12} fill="currentColor" /> {prod.average_rating || '5.0'}
                    </span>
                  </div>

                  <Link to={`/products/${prod.slug}`}>
                    <h3 style={{
                      fontSize: '0.98rem',
                      fontWeight: '700',
                      marginBottom: '0.75rem',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '2.6rem'
                    }}>
                      {prod.name}
                    </h3>
                  </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                      ₹{prod.current_price}
                    </span>
                  </div>
                  <Link to={`/products/${prod.slug}`} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                    View Specs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Live System Health Widget */}
      <HealthWidget />

      {/* Modular Architecture Grid */}
      <section style={{ marginTop: '3.5rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Modular Architecture Progress
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
                    background: app.active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: app.active ? 'var(--accent-primary)' : 'var(--text-muted)',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <span className={`badge ${app.status.includes('Completed') || app.status.includes('Active') ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                    {app.status}
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
