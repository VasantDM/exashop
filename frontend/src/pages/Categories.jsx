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
import { getCategories, getCachedCategories } from '../services/catalogService';

const iconMap = {
  Cpu: Cpu,
  Headphones: Headphones,
  Watch: Watch,
  Laptop: Laptop,
  Home: Home,
};

const Categories = () => {
  const cachedCats = getCachedCategories({ all: 'true' }) || getCachedCategories();
  const initialCategories = Array.isArray(cachedCats) ? cachedCats : (cachedCats?.results || []);

  const [categories, setCategories] = useState(initialCategories);
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      if (categories.length === 0) {
        setIsLoading(true);
      }
      try {
        const data = await getCategories({ all: 'true' });
        if (!isMounted) return;
        setCategories(Array.isArray(data) ? data : (data?.results || []));
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchCats();

    return () => {
      isMounted = false;
    };
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
                className="glass-card cat-card"
              >
                {/* Banner Image with Gradient Overlay */}
                <div className="cat-banner-wrap">
                  <img
                    src={cat.display_image}
                    alt={cat.name}
                    className="cat-banner-img"
                  />
                  <div className="cat-banner-overlay" />

                  {/* Icon Badge */}
                  <div className="cat-icon-badge">
                    <IconComponent size={18} color="#ffffff" />
                  </div>

                  {/* Product Count Pill */}
                  <div className="cat-count-pill">
                    {cat.product_count || 0} Products
                  </div>
                </div>

                {/* Content Card Info */}
                <div className="cat-card-body">
                  <div>
                    <h3 className="cat-card-title">
                      {cat.name}
                    </h3>
                    <p className="cat-card-desc">
                      {cat.description || 'Browse leading products and brand hardware in this category.'}
                    </p>
                  </div>

                  {/* Subcategories (if any) */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="cat-subcategories-wrap">
                      {cat.subcategories.map((sub) => (
                        <span key={sub.id} className="cat-sub-tag">
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="cat-footer-link">
                    <span>Explore Products</span>
                    <ArrowRight size={14} />
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

        .cat-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          border-radius: var(--radius-lg);
          text-decoration: none;
        }

        .cat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px -5px rgba(245, 158, 11, 0.2), var(--shadow-md);
        }

        .cat-banner-wrap {
          position: relative;
          height: 180px;
          overflow: hidden;
          background-color: #fafaf9;
        }

        .cat-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .cat-card:hover .cat-banner-img {
          transform: scale(1.08);
        }

        .cat-banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%);
        }

        .cat-icon-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: var(--accent-gradient);
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
        }

        .cat-count-pill {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background-color: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: var(--accent-orange);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
        }

        .cat-card-body {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cat-card-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 0.35rem;
          color: var(--text-primary);
        }

        .cat-card-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 1rem;
        }

        .cat-subcategories-wrap {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          margin-bottom: 0.85rem;
        }

        .cat-sub-tag {
          font-size: 0.72rem;
          background-color: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.12rem 0.45rem;
          border-radius: var(--radius-sm);
          color: var(--accent-orange);
          font-weight: 600;
        }

        .cat-footer-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--accent-orange);
          font-weight: 700;
          font-size: 0.82rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
        }

        @media (max-width: 640px) {
          .categories-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.75rem !important;
          }

          .cat-banner-wrap {
            height: 115px !important;
          }

          .cat-icon-badge {
            width: 30px !important;
            height: 30px !important;
            top: 8px !important;
            left: 8px !important;
          }

          .cat-count-pill {
            bottom: 8px !important;
            right: 8px !important;
            font-size: 0.65rem !important;
            padding: 0.15rem 0.4rem !important;
          }

          .cat-card-body {
            padding: 0.75rem 0.65rem !important;
          }

          .cat-card-title {
            font-size: 0.9rem !important;
            margin-bottom: 0.2rem !important;
          }

          .cat-card-desc {
            display: none !important;
          }

          .cat-subcategories-wrap {
            display: none !important;
          }

          .cat-footer-link {
            font-size: 0.74rem !important;
            padding-top: 0.45rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Categories;
