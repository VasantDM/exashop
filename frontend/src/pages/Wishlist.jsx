import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShoppingCart, Trash2, ArrowRight, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const handleMoveToCart = async (product) => {
    await addToCart(product.id, 1);
    await toggleWishlist(product);
  };

  if (wishlist.length === 0) {
    return (
      <div style={{ maxWidth: '560px', margin: '3.5rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{
            background: 'rgba(236, 72, 153, 0.12)',
            color: '#ec4899',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.25)'
          }}>
            <Heart size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>
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
          <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
            {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Products you saved for later. Move them to your cart when you're ready to purchase.
        </p>
      </div>

      {/* Grid of Wishlist items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
              <Link to={`/products/${product.slug}`} style={{ display: 'block', position: 'relative', marginBottom: '1rem', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
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
                    background: 'var(--accent-rose)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)'
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
                    background: 'rgba(17, 24, 39, 0.8)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ec4899',
                    cursor: 'pointer'
                  }}
                  title="Remove from Wishlist"
                >
                  <Heart size={16} fill="#ec4899" />
                </button>
              </Link>

              {/* Product Info */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>{product.brand_name || 'Brand'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-amber)' }}>
                    <Star size={12} fill="currentColor" /> {product.average_rating || '5.0'}
                  </span>
                </div>

                <Link to={`/products/${product.slug}`}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    marginBottom: '0.75rem',
                    lineHeight: '1.35',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '2.7rem'
                  }}>
                    {product.name}
                  </h3>
                </Link>
              </div>

              {/* Pricing & Move to Cart CTA */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
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
                    style={{ padding: '0.5rem 0.7rem', color: 'var(--accent-rose)' }}
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
    </div>
  );
};

export default Wishlist;
