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
              className="glass-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* Product Image */}
              <Link to={`/products/${product.slug}`} style={{ display: 'block', position: 'relative', marginBottom: '1rem', overflow: 'hidden', borderRadius: 'var(--radius-md)', backgroundColor: '#fafaf9' }}>
                <img
                  src={product.primary_image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '210px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)'
                  }}
                />

                {product.has_discount && (
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'var(--accent-orange)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)'
                  }}>
                    -{product.discount_percentage}% OFF
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid var(--border-color)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-rose)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer'
                  }}
                  title="Remove from wishlist"
                >
                  <Heart size={16} fill="var(--accent-rose)" />
                </button>
              </Link>

              {/* Product Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-orange)', textTransform: 'uppercase' }}>
                    {product.category?.name || 'Item'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    <Star size={13} fill="var(--accent-primary)" color="var(--accent-primary)" />
                    <span>{product.average_rating || '5.0'}</span>
                  </div>
                </div>

                <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                    lineHeight: '1.35',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.name}
                  </h3>
                </Link>
              </div>

              {/* Pricing & Move to Cart CTA */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{product.current_price}
                  </span>
                  {product.has_discount && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{product.price}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock <= 0}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.82rem',
                      opacity: product.stock <= 0 ? 0.5 : 1,
                      cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ShoppingCart size={15} /> {product.stock > 0 ? 'Move to Cart' : 'Out of Stock'}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 0.7rem', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                    title="Delete from Wishlist"
                  >
                    <Trash2 size={16} />
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
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 640px) {
          .wishlist-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;
