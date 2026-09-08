import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  ArrowRight, 
  Cpu, 
  Headphones, 
  Watch, 
  Laptop, 
  Home, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { getCategories } from '../services/catalogService';

const iconMap = {
  Cpu: Cpu,
  Headphones: Headphones,
  Watch: Watch,
  Laptop: Laptop,
  Home: Home,
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      setIsLoading(true);
      try {
        const data = await getCategories({ all: 'true' });
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Explore <span className="gradient-text">Categories</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Browse our structured taxonomy of electronics, accessories, audio systems, and smart home tech.
        </p>
      </div>

      {isLoading ? (
        <div className="categories-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ height: '240px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Layers size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>No categories found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Check back shortly as new categories are populated into the catalog.
          </p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Layers;

            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="glass-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Banner Image with Gradient Overlay */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', backgroundColor: '#fafaf9' }}>
                  <img
                    src={cat.display_image}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)'
                  }} />

                  {/* Icon Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'var(--accent-gradient)',
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
                  }}>
                    <IconComponent size={20} color="#ffffff" />
                  </div>

                  {/* Product Count Pill */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: 'var(--accent-orange)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {cat.product_count || 0} Products
                  </div>
                </div>

                {/* Content Card Info */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                      {cat.description || 'Browse leading products and brand hardware in this category.'}
                    </p>
                  </div>

                  {/* Subcategories (if any) */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {cat.subcategories.map((sub) => (
                        <span key={sub.id} style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--accent-orange)',
                          fontWeight: '600'
                        }}>
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--accent-orange)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.9rem'
                  }}>
                    <span>Explore Products</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 640px) {
          .categories-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Categories;
