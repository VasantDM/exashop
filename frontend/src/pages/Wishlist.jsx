import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShoppingCart, Trash2, ArrowRight, Star, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const handleMoveToCart = async (product) => {
    await addToCart(product.id, 1);
    await toggleWishlist(product);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '560px', margin: '3.5rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--accent-orange)',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.25)'
          }}>
            <Lock size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Sign In to View Wishlist
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Please log in to your account to save your favorite products, sync across devices, and manage your wishlist.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
              Sign In <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div style={{ maxWidth: '560px', margin: '3.5rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{
            background: 'rgba(234, 88, 12, 0.12)',
            color: '#ea580c',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 15px rgba(234, 88, 12, 0.25)'
          }}>
            <Heart size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Your Wishlist is Empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Save items you love by clicking the heart icon on any product card or detail page.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
            Explore Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '2.1rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
            My <span className="gradient-text">Wishlist</span>
          </h1>
          <span className="badge badge-info" style={{ fontSize: '0.8rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-orange)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Products you saved for later. Move them to your cart when you're ready to purchase.
        </p>
      </div>

      {/* Grid of Wishlist items */}
      <div className="wishlist-grid">
        {wishlist.map((item) => {
          const product = item.product || item;

          return (
            <div
              key={item.id || product.id}
              className="glass-card wishlist-card"
            >
              {/* Product Image */}
              <div className="wishlist-img-wrap">
                <Link to={`/products/${product.slug}`} style={{ display: 'block' }}>
                  <img
                    src={product.primary_image}
                    alt={product.name}
                    className="wishlist-img"
                  />
                </Link>

                {product.has_discount && (
                  <span className="wishlist-discount-badge">
                    -{product.discount_percentage}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product);
                  }}
                  className="wishlist-heart-btn"
                  title="Remove from wishlist"
                >
                  <Heart size={16} fill="var(--accent-rose)" />
                </button>
              </div>

              {/* Product Info */}
              <div>
                <div className="wishlist-meta">
                  <span className="wishlist-cat">
                    {product.category?.name || 'Item'}
                  </span>
                  <div className="wishlist-rating">
                    <Star size={12} fill="var(--accent-primary)" color="var(--accent-primary)" />
                    <span>{product.average_rating || '5.0'}</span>
                  </div>
                </div>

                <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <h3 className="wishlist-title">
                    {product.name}
                  </h3>
                </Link>
              </div>

              {/* Pricing & Move to Cart CTA */}
              <div className="wishlist-footer">
                <div className="wishlist-price-row">
                  <span className="wishlist-price-current">
                    ₹{product.current_price}
                  </span>
                  {product.has_discount && (
                    <span className="wishlist-price-original">
                      ₹{product.price}
                    </span>
                  )}
                </div>

                <div className="wishlist-actions">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock <= 0}
                    className="btn btn-primary wishlist-cart-btn"
                  >
                    <ShoppingCart size={14} /> <span>{product.stock > 0 ? 'Move to Cart' : 'Out'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="btn btn-outline wishlist-trash-btn"
                    title="Delete from Wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .wishlist-card {
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          border-radius: var(--radius-lg);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .wishlist-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -4px rgba(245, 158, 11, 0.16), var(--shadow-md);
        }

        .wishlist-img-wrap {
          position: relative;
          margin-bottom: 0.85rem;
          overflow: hidden;
          border-radius: var(--radius-md);
          background-color: #fafaf9;
        }

        .wishlist-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: var(--radius-md);
          transition: transform 0.4s ease;
        }

        .wishlist-img:hover {
          transform: scale(1.06);
        }

        .wishlist-discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: var(--accent-orange);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.4);
        }

        .wishlist-heart-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(6px);
          border: 1px solid var(--border-color);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-rose);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          cursor: pointer;
        }

        .wishlist-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.35rem;
        }

        .wishlist-cat {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-orange);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .wishlist-rating {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .wishlist-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.65rem;
        }

        .wishlist-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          margin-top: 0.5rem;
        }

        .wishlist-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.65rem;
        }

        .wishlist-price-current {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .wishlist-price-original {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .wishlist-actions {
          display: flex;
          gap: 0.4rem;
        }

        .wishlist-cart-btn {
          flex: 1;
          padding: 0.5rem 0.75rem;
          font-size: 0.82rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }

        .wishlist-trash-btn {
          padding: 0.5rem 0.65rem;
          color: var(--accent-rose);
          border-color: rgba(244, 63, 94, 0.3);
        }

        @media (max-width: 640px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.75rem !important;
          }

          .wishlist-card {
            padding: 0.65rem !important;
            border-radius: var(--radius-md) !important;
          }

          .wishlist-img-wrap {
            margin-bottom: 0.45rem !important;
          }

          .wishlist-img {
            height: 135px !important;
            border-radius: 8px !important;
          }

          .wishlist-heart-btn {
            width: 28px !important;
            height: 28px !important;
            top: 6px !important;
            right: 6px !important;
          }

          .wishlist-discount-badge {
            top: 6px !important;
            left: 6px !important;
            font-size: 0.65rem !important;
            padding: 0.15rem 0.4rem !important;
          }

          .wishlist-meta {
            font-size: 0.7rem !important;
            margin-bottom: 0.2rem !important;
          }

          .wishlist-cat {
            font-size: 0.68rem !important;
          }

          .wishlist-title {
            font-size: 0.82rem !important;
            height: 2.1rem !important;
            line-height: 1.25 !important;
            margin-bottom: 0.25rem !important;
          }

          .wishlist-footer {
            padding-top: 0.4rem !important;
            margin-top: 0.35rem !important;
          }

          .wishlist-price-row {
            margin-bottom: 0.4rem !important;
          }

          .wishlist-price-current {
            font-size: 0.95rem !important;
          }

          .wishlist-cart-btn {
            padding: 0.38rem 0.5rem !important;
            font-size: 0.72rem !important;
          }

          .wishlist-trash-btn {
            padding: 0.38rem 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
