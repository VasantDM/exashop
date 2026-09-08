import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Heart,
  Zap, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Share2, 
  Sparkles,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { getProductBySlugOrId } from '../services/catalogService';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id: slugOrId } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, isInCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'specs' | 'shipping'

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getProductBySlugOrId(slugOrId);
        setProduct(data);
        if (data.available_colors && data.available_colors.length > 0) {
          setSelectedColor(data.available_colors[0].name);
          if (data.available_colors[0].image_url) {
            setSelectedImage(data.available_colors[0].image_url);
          } else if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0].display_image);
          } else {
            setSelectedImage(data.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
          }
        } else if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].display_image);
        } else {
          setSelectedImage(data.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
        }

        if (data.available_sizes && data.available_sizes.length > 0) {
          setSelectedSize(data.available_sizes[0]);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError('Product not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [slugOrId]);

  // Find currently matched variant based on selected color and size
  const currentVariant = product?.variants?.find(
    (v) => (v.color_name === selectedColor || !selectedColor) && (v.size === selectedSize || !selectedSize)
  );

  const availableStock = currentVariant 
    ? currentVariant.stock 
    : (product?.has_variants ? 0 : product?.stock || 0);

  const isBuyable = product?.has_variants ? (currentVariant && currentVariant.stock > 0) : product?.in_stock;

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.has_variants && (!currentVariant || currentVariant.stock <= 0)) {
      return;
    }
    if (!product.has_variants && product.stock <= 0) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity, { variantId: currentVariant?.id });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !isBuyable) return;
    try {
      await addToCart(product.id, quantity, { variantId: currentVariant?.id });
      navigate('/cart');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="glass-card" style={{ maxWidth: '560px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          {error || 'The requested product could not be located in our catalog.'}
        </p>
        <Link to="/products" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images.map((img) => img.display_image)
    : [product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const inWish = isInWishlist(product.id);

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: 'var(--text-secondary)' }}>Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category.slug}`} style={{ color: 'var(--text-secondary)' }}>
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{product.name}</span>
      </div>

      {/* Main Product Showcase Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
        {/* Left Column: Image Gallery */}
        <div>
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem', overflow: 'hidden', textAlign: 'center', position: 'relative' }}>
            <img
              src={selectedImage || product.primary_image}
              alt={product.name}
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                transition: 'transform 0.3s ease'
              }}
            />

            {/* Wishlist floating toggle button */}
            <button
              onClick={() => toggleWishlist(product)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(17, 24, 39, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: inWish ? '#ec4899' : '#ffffff',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
              title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={20} fill={inWish ? '#ec4899' : 'none'} />
            </button>
          </div>

          {/* Thumbnails Row */}
          {galleryImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {galleryImages.map((imgUrl, idx) => {
                const isSelected = selectedImage === imgUrl;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      padding: '4px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'calc(var(--radius-md) - 4px)' }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Actions */}
        <div>
          {/* Brand & Category badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {product.brand && (
              <span className="badge badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {product.brand.name}
              </span>
            )}
            {product.category && (
              <span className="badge badge-outline" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {product.category.name}
              </span>
            )}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              SKU: <strong style={{ color: 'var(--text-secondary)' }}>{currentVariant?.sku || product.sku}</strong>
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '0.75rem', lineHeight: '1.3', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-orange)' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} fill={s <= Math.round(Number(product.average_rating || 5)) ? 'currentColor' : 'none'} />
              ))}
              <strong style={{ marginLeft: '0.35rem', color: 'var(--text-primary)' }}>{product.average_rating || '5.0'}</strong>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>{product.reviews_count || 0} customer reviews</span>
          </div>

          {/* Pricing Box */}
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', backgroundColor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                ₹{currentVariant?.current_price || product.current_price}
              </span>
              {product.has_discount && (
                <>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{product.price}
                  </span>
                  <span style={{
                    backgroundColor: 'rgba(234, 88, 12, 0.12)',
                    color: 'var(--accent-orange)',
                    border: '1px solid rgba(234, 88, 12, 0.3)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}>
                    Save {product.discount_percentage}%
                  </span>
                </>
              )}
            </div>

            {/* Stock status indicator */}
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span className={`pulse-dot ${isBuyable ? 'success' : 'danger'}`}></span>
              <span style={{ color: isBuyable ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: '600' }}>
                {product.has_variants ? (
                  isBuyable ? (
                    `In Stock (${availableStock} available for ${selectedColor} / Size ${selectedSize})`
                  ) : (
                    `Out of Stock for ${selectedColor} / Size ${selectedSize}`
                  )
                ) : (
                  product.in_stock ? `In Stock (${product.stock} units available)` : 'Currently Out of Stock'
                )}
              </span>
            </div>
          </div>

          {/* Apparel Color Swatches Selector */}
          {product.available_colors && product.available_colors.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Color: <strong style={{ color: 'var(--accent-orange)' }}>{selectedColor}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {product.available_colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        if (c.image_url) setSelectedImage(c.image_url);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.15)' : '#ffffff',
                        border: isSelected ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      title={`Select color: ${c.name}`}
                    >
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: c.code || '#ea580c',
                        border: '1px solid #ddd',
                        display: 'inline-block',
                        boxShadow: isSelected ? '0 0 8px rgba(245, 158, 11, 0.6)' : 'none'
                      }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '600', color: isSelected ? 'var(--accent-orange)' : 'var(--text-secondary)' }}>
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Apparel Size Selector Grid */}
          {product.available_sizes && product.available_sizes.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Size: <strong style={{ color: 'var(--accent-orange)' }}>{selectedSize}</strong>
                </span>
                {currentVariant && (
                  <span style={{ fontSize: '0.78rem', color: isBuyable ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {isBuyable ? `✓ ${currentVariant.stock} in stock` : '✕ Sold out in this color'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {product.available_sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  const vMatch = product.variants?.find((v) => (v.color_name === selectedColor || !selectedColor) && v.size === sz);
                  const szStock = vMatch ? vMatch.stock : 0;
                  const isSzOut = szStock <= 0;

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        minWidth: '48px',
                        height: '42px',
                        padding: '0 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--accent-orange)' : '#ffffff',
                        color: isSelected ? '#ffffff' : (isSzOut ? 'var(--text-muted)' : 'var(--text-primary)'),
                        border: isSelected ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                        fontWeight: isSelected ? '800' : '600',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        position: 'relative',
                        textDecoration: isSzOut ? 'line-through' : 'none',
                        opacity: isSzOut ? 0.45 : 1,
                        boxShadow: isSelected ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none',
                        transition: 'all var(--transition-fast)'
                      }}
                      title={isSzOut ? `${sz} (Out of Stock for ${selectedColor})` : `${sz} (${szStock} available)`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short description */}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            {product.short_description || product.description?.slice(0, 180) + '...'}
          </p>

          {/* Purchase Controls */}
          {isBuyable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {/* Quantity selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Quantity:</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ padding: '0.5rem 0.9rem', color: 'var(--text-primary)', fontSize: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0.5rem 0.8rem', fontWeight: '700', fontSize: '0.9rem', minWidth: '32px', textAlign: 'center', color: 'var(--text-primary)' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    disabled={quantity >= availableStock}
                    style={{
                      padding: '0.5rem 0.9rem',
                      color: quantity >= availableStock ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontSize: '1rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: quantity >= availableStock ? 'not-allowed' : 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>

                {quantity >= availableStock && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={13} /> Max available stock reached ({availableStock})
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`btn ${isInCart(product.id, currentVariant?.id) ? 'btn-outline' : 'btn-primary'}`}
                  style={{
                    padding: '0.85rem 1.5rem',
                    fontSize: '0.95rem',
                    borderColor: isInCart(product.id, currentVariant?.id) ? 'var(--accent-emerald)' : undefined,
                    color: isInCart(product.id, currentVariant?.id) ? 'var(--accent-emerald)' : undefined,
                    backgroundColor: isInCart(product.id, currentVariant?.id) ? 'rgba(16, 185, 129, 0.12)' : undefined
                  }}
                >
                  {isAdding ? (
                    'Adding...'
                  ) : isInCart(product.id, currentVariant?.id) ? (
                    <>
                      <Check size={18} /> In Cart (Already Added)
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn btn-outline"
                  style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem', borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)' }}
                >
                  <Zap size={18} /> Buy Now
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              color: '#fb7185',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <AlertTriangle size={18} />
              <span>
                {product.has_variants 
                  ? `Selected option (${selectedColor} / Size ${selectedSize}) is currently out of stock. Please select another size or color.` 
                  : 'This product is currently out of stock.'}
              </span>
              <button onClick={() => toggleWishlist(product)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: inWish ? '#ea580c' : 'var(--text-primary)' }}>
                <Heart size={14} fill={inWish ? '#ea580c' : 'none'} /> {inWish ? 'Wishlisted' : 'Save to Wishlist'}
              </button>
            </div>
          )}

          {/* Guarantee Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
              <Truck size={20} color="var(--accent-orange)" style={{ margin: '0 auto 0.35rem' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>Free Delivery</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Orders over ₹999</div>
            </div>

            <div style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
              <ShieldCheck size={20} color="var(--accent-emerald)" style={{ margin: '0 auto 0.35rem' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>2-Year Warranty</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>100% Genuine</div>
            </div>

            <div style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
              <RotateCcw size={20} color="var(--accent-orange)" style={{ margin: '0 auto 0.35rem' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>Easy Returns</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>30-day policy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Shipping */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('description')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 1rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: activeTab === 'description' ? 'var(--accent-orange)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'description' ? '2px solid var(--accent-orange)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Description & Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 1rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: activeTab === 'specs' ? 'var(--accent-orange)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'specs' ? '2px solid var(--accent-orange)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 1rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: activeTab === 'shipping' ? 'var(--accent-orange)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'shipping' ? '2px solid var(--accent-orange)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Shipping & Warranty
          </button>
        </div>

        {activeTab === 'description' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '1rem' }}>{product.description}</p>
          </div>
        )}

        {activeTab === 'specs' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', width: '30%' }}>Product SKU</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{product.sku}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Category</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{product.category?.name || 'N/A'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Brand Manufacturer</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{product.brand?.name || 'N/A'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Inventory Units</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{product.stock} units</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Customer Rating</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{product.average_rating} / 5.0 ({product.reviews_count} reviews)</td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'shipping' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>Standard Domestic Shipping:</strong> 2-4 business days via Express Tracked Parcel. Free on orders over $100.
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>Warranty Protection:</strong> Includes standard 24-month manufacturer defect protection and accidental damage coverage options.
            </p>
            <p>
              <strong>Returns Policy:</strong> Hassle-free 30-day return window in original packaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
