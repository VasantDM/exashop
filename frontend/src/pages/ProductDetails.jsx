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
  AlertTriangle,
  Package,
  Layers,
  Award,
  CheckCircle2,
  Clock
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
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Product Not Found</h2>
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
    <div className="product-details-page">
      {/* Breadcrumb Navigation */}
      <div className="product-breadcrumb">
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
      <div className="product-showcase-grid">
        {/* Left Column: Image Gallery */}
        <div className="product-gallery-col">
          <div className="product-main-image-card">
            <img
              src={selectedImage || product.primary_image}
              alt={product.name}
              className="product-main-img"
            />

            {/* Wishlist floating toggle button */}
            <button
              onClick={() => toggleWishlist(product)}
              className="wishlist-float-btn"
              title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label="Wishlist Toggle"
            >
              <Heart size={20} color={inWish ? '#ea580c' : '#ffffff'} fill={inWish ? '#ea580c' : 'none'} />
            </button>
          </div>

          {/* Thumbnails Row */}
          {galleryImages.length > 1 && (
            <div className="product-thumbnails-row">
              {galleryImages.map((imgUrl, idx) => {
                const isSelected = selectedImage === imgUrl;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`thumb-btn ${isSelected ? 'active' : ''}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="thumb-img"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Actions */}
        <div className="product-info-col">
          {/* Brand & Category badges */}
          <div className="product-meta-badges">
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
            <span className="sku-tag">
              SKU: <strong style={{ color: 'var(--text-secondary)' }}>{currentVariant?.sku || product.sku}</strong>
            </span>
          </div>

          {/* Title */}
          <h1 className="product-title">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="product-rating-row">
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
          <div className="product-price-box">
            <div className="price-values-row">
              <span className="current-price-val">
                ₹{currentVariant?.current_price || product.current_price}
              </span>
              {product.has_discount && (
                <>
                  <span className="original-price-val">
                    ₹{product.price}
                  </span>
                  <span className="discount-pill">
                    Save {product.discount_percentage}%
                  </span>
                </>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="stock-status-row">
              <span className={`pulse-dot ${isBuyable ? 'success' : 'danger'}`}></span>
              <span style={{ color: isBuyable ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: '600', fontSize: '0.85rem' }}>
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
            <div className="selector-group">
              <div className="selector-label">
                Color: <strong style={{ color: 'var(--accent-orange)' }}>{selectedColor}</strong>
              </div>
              <div className="color-swatches-wrap">
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
                      className={`color-btn ${isSelected ? 'active' : ''}`}
                      title={`Select color: ${c.name}`}
                    >
                      <span className="color-circle" style={{ backgroundColor: c.code || '#ea580c' }} />
                      <span className="color-name-text">
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
            <div className="selector-group">
              <div className="selector-header">
                <span className="selector-label">
                  Size: <strong style={{ color: 'var(--accent-orange)' }}>{selectedSize}</strong>
                </span>
                {currentVariant && (
                  <span style={{ fontSize: '0.78rem', color: isBuyable ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {isBuyable ? `✓ ${currentVariant.stock} in stock` : '✕ Sold out in this color'}
                  </span>
                )}
              </div>
              <div className="size-grid-wrap">
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
                      className={`size-btn ${isSelected ? 'active' : ''} ${isSzOut ? 'out-of-stock' : ''}`}
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
          <p className="product-short-desc">
            {product.short_description || product.description?.slice(0, 180) + '...'}
          </p>

          {/* Purchase Controls */}
          {isBuyable ? (
            <div className="purchase-controls-wrap">
              {/* Quantity selector */}
              <div className="quantity-row">
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Quantity:</span>
                <div className="quantity-stepper">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="stepper-btn"
                  >
                    -
                  </button>
                  <span className="stepper-val">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    disabled={quantity >= availableStock}
                    className="stepper-btn"
                    style={{
                      color: quantity >= availableStock ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: quantity >= availableStock ? 'not-allowed' : 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>

                {quantity >= availableStock && (
                  <span className="stock-alert-msg">
                    <AlertTriangle size={13} /> Max stock ({availableStock})
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="action-buttons-grid">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`btn ${isInCart(product.id, currentVariant?.id) ? 'btn-outline' : 'btn-primary'} main-action-btn`}
                  style={{
                    borderColor: isInCart(product.id, currentVariant?.id) ? 'var(--accent-emerald)' : undefined,
                    color: isInCart(product.id, currentVariant?.id) ? 'var(--accent-emerald)' : undefined,
                    backgroundColor: isInCart(product.id, currentVariant?.id) ? 'rgba(16, 185, 129, 0.12)' : undefined
                  }}
                >
                  {isAdding ? (
                    'Adding...'
                  ) : isInCart(product.id, currentVariant?.id) ? (
                    <>
                      <Check size={18} /> In Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn btn-outline main-action-btn buy-now-btn"
                >
                  <Zap size={18} /> Buy Now
                </button>
              </div>
            </div>
          ) : (
            <div className="out-of-stock-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle size={18} />
                <span>
                  {product.has_variants 
                    ? `Selected option (${selectedColor} / Size ${selectedSize}) is out of stock. Choose another option.` 
                    : 'This product is currently out of stock.'}
                </span>
              </div>
              <button onClick={() => toggleWishlist(product)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: inWish ? '#ea580c' : 'var(--text-primary)', marginTop: '0.5rem' }}>
                <Heart size={14} fill={inWish ? '#ea580c' : 'none'} /> {inWish ? 'Wishlisted' : 'Save to Wishlist'}
              </button>
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="product-guarantee-row">
            <div className="guarantee-box">
              <Truck size={20} color="var(--accent-orange)" style={{ margin: '0 auto 0.35rem' }} />
              <div className="guarantee-title">Free Delivery</div>
              <div className="guarantee-subtitle">Orders over ₹999</div>
            </div>

            <div className="guarantee-box">
              <ShieldCheck size={20} color="var(--accent-emerald)" style={{ margin: '0 auto 0.35rem' }} />
              <div className="guarantee-title">2-Year Warranty</div>
              <div className="guarantee-subtitle">100% Genuine</div>
            </div>

            <div className="guarantee-box">
              <RotateCcw size={20} color="var(--accent-orange)" style={{ margin: '0 auto 0.35rem' }} />
              <div className="guarantee-title">Easy Returns</div>
              <div className="guarantee-subtitle">30-day policy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Shipping */}
      <div className="product-tabs-card glass-card">
        {/* Responsive Horizontal Scrollable / Pill Tabs */}
        <div className="tabs-header-bar">
          <button
            onClick={() => setActiveTab('description')}
            className={`tab-toggle-btn ${activeTab === 'description' ? 'active' : ''}`}
          >
            <Package size={16} />
            <span>Description & Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`tab-toggle-btn ${activeTab === 'specs' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Technical Specifications</span>
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`tab-toggle-btn ${activeTab === 'shipping' ? 'active' : ''}`}
          >
            <Truck size={16} />
            <span>Shipping & Warranty</span>
          </button>
        </div>

        {/* Tab 1: Description & Overview */}
        {activeTab === 'description' && (
          <div className="tab-content-area">
            <h3 className="tab-section-title">Product Overview</h3>
            <p className="tab-text-paragraph">{product.description}</p>
            
            {/* Highlights Grid */}
            <div className="highlights-grid">
              <div className="highlight-card">
                <div className="highlight-icon">
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                </div>
                <div>
                  <div className="highlight-title">Genuine Authenticity</div>
                  <div className="highlight-desc">Verified store stock with serial tracking.</div>
                </div>
              </div>

              <div className="highlight-card">
                <div className="highlight-icon">
                  <Award size={18} color="var(--accent-orange)" />
                </div>
                <div>
                  <div className="highlight-title">Premium Build</div>
                  <div className="highlight-desc">Manufactured using strict quality-tested materials.</div>
                </div>
              </div>

              <div className="highlight-card">
                <div className="highlight-icon">
                  <Clock size={18} color="var(--accent-primary)" />
                </div>
                <div>
                  <div className="highlight-title">Express Dispatch</div>
                  <div className="highlight-desc">Orders ship within 24 hours of placement.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Technical Specifications */}
        {activeTab === 'specs' && (
          <div className="tab-content-area">
            <h3 className="tab-section-title">Technical Specifications</h3>
            
            <div className="specs-list-container">
              <div className="spec-row">
                <span className="spec-label">Product SKU</span>
                <span className="spec-value">{product.sku}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Category</span>
                <span className="spec-value">{product.category?.name || 'Standard'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Brand / Manufacturer</span>
                <span className="spec-value">{product.brand?.name || 'ExaShop Certified'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Inventory Units</span>
                <span className="spec-value">{product.stock} units available</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Customer Rating</span>
                <span className="spec-value">⭐ {product.average_rating || '5.0'} / 5.0 ({product.reviews_count || 0} reviews)</span>
              </div>
              {product.available_colors && product.available_colors.length > 0 && (
                <div className="spec-row">
                  <span className="spec-label">Available Colors</span>
                  <span className="spec-value">{product.available_colors.map(c => c.name).join(', ')}</span>
                </div>
              )}
              {product.available_sizes && product.available_sizes.length > 0 && (
                <div className="spec-row">
                  <span className="spec-label">Available Sizes</span>
                  <span className="spec-value">{product.available_sizes.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Shipping & Warranty */}
        {activeTab === 'shipping' && (
          <div className="tab-content-area">
            <h3 className="tab-section-title">Shipping, Warranty & Return Policies</h3>
            
            <div className="policy-cards-grid">
              {/* Shipping Policy Card */}
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-icon-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-orange)' }}>
                    <Truck size={22} />
                  </div>
                  <div>
                    <h4 className="policy-title">Domestic & Express Shipping</h4>
                    <span className="policy-badge">Free over ₹999</span>
                  </div>
                </div>
                <p className="policy-desc">
                  Orders are dispatched within 24 hours. Standard delivery takes <strong>2-4 business days</strong> with live end-to-end tracking updates via SMS & Email.
                </p>
              </div>

              {/* Warranty Policy Card */}
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-icon-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 className="policy-title">2-Year Official Warranty</h4>
                    <span className="policy-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>100% Covered</span>
                  </div>
                </div>
                <p className="policy-desc">
                  Full 24-month manufacturer defect protection covering internal components, electronic faults, and manufacturing irregularities with door-to-door replacement service.
                </p>
              </div>

              {/* Returns Policy Card */}
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-icon-badge" style={{ backgroundColor: 'rgba(234, 88, 12, 0.15)', color: 'var(--accent-orange)' }}>
                    <RotateCcw size={22} />
                  </div>
                  <div>
                    <h4 className="policy-title">30-Day Hassle-Free Returns</h4>
                    <span className="policy-badge">Instant Refund</span>
                  </div>
                </div>
                <p className="policy-desc">
                  Enjoy complete peace of mind. Return within 30 days in original packaging if you change your mind for an immediate refund or replacement.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .product-details-page {
          width: 100%;
        }

        .product-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .product-showcase-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          margin-bottom: 2.5rem;
          align-items: start;
        }

        .product-main-image-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 1rem;
          text-align: center;
          position: relative;
          box-shadow: var(--shadow-sm);
        }

        .product-main-img {
          width: 100%;
          max-height: 420px;
          object-fit: contain;
          border-radius: var(--radius-md);
          transition: transform 0.3s ease;
        }

        .wishlist-float-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: transform 0.2s ease;
        }

        .wishlist-float-btn:hover {
          transform: scale(1.08);
        }

        .product-thumbnails-row {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          -webkit-overflow-scrolling: touch;
        }

        .thumb-btn {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-md);
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          padding: 4px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }

        .thumb-btn.active {
          border: 2px solid var(--accent-orange);
          box-shadow: 0 0 8px rgba(234, 88, 12, 0.3);
        }

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: calc(var(--radius-md) - 4px);
        }

        .product-meta-badges {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .sku-tag {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-left: auto;
        }

        .product-title {
          font-size: 1.85rem;
          fontWeight: 800;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .product-rating-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          font-size: 0.85rem;
        }

        .product-price-box {
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          background-color: rgba(245, 158, 11, 0.06);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-lg);
        }

        .price-values-row {
          display: flex;
          align-items: baseline;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .current-price-val {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .original-price-val {
          font-size: 1.15rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .discount-pill {
          background-color: rgba(234, 88, 12, 0.12);
          color: var(--accent-orange);
          border: 1px solid rgba(234, 88, 12, 0.3);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .stock-status-row {
          margin-top: 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .selector-group {
          margin-bottom: 1.35rem;
        }

        .selector-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          display: block;
        }

        .selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .color-swatches-wrap {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .color-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .color-btn.active {
          background-color: rgba(245, 158, 11, 0.15);
          border: 2px solid var(--accent-orange);
        }

        .color-circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid #ddd;
          display: inline-block;
        }

        .color-name-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .color-btn.active .color-name-text {
          color: var(--accent-orange);
          font-weight: 700;
        }

        .size-grid-wrap {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .size-btn {
          min-width: 46px;
          height: 40px;
          padding: 0 0.75rem;
          border-radius: var(--radius-md);
          background-color: #ffffff;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .size-btn.active {
          background-color: var(--accent-orange);
          color: #ffffff;
          border: 2px solid var(--accent-orange);
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.25);
        }

        .size-btn.out-of-stock {
          text-decoration: line-through;
          opacity: 0.45;
        }

        .product-short-desc {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .purchase-controls-wrap {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .quantity-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .quantity-stepper {
          display: flex;
          align-items: center;
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .stepper-btn {
          padding: 0.45rem 0.85rem;
          color: var(--text-primary);
          font-size: 1rem;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .stepper-val {
          padding: 0.45rem 0.75rem;
          font-weight: 700;
          font-size: 0.9rem;
          min-width: 30px;
          text-align: center;
          color: var(--text-primary);
        }

        .stock-alert-msg {
          font-size: 0.78rem;
          color: var(--accent-orange);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .action-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .main-action-btn {
          padding: 0.85rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 700;
          width: 100%;
        }

        .buy-now-btn {
          border-color: var(--accent-orange);
          color: var(--accent-orange);
        }

        .buy-now-btn:hover {
          background-color: rgba(234, 88, 12, 0.08);
        }

        .out-of-stock-card {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          color: #dc2626;
          font-size: 0.9rem;
          margin-bottom: 1.75rem;
        }

        .product-guarantee-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.25rem;
        }

        .guarantee-box {
          text-align: center;
          padding: 0.6rem 0.35rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .guarantee-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .guarantee-subtitle {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        /* Tabs Card Styling */
        .product-tabs-card {
          padding: 2rem;
          border-radius: var(--radius-lg);
          background: #ffffff;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .tabs-header-bar {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0.75rem;
          margin-bottom: 1.75rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .tabs-header-bar::-webkit-scrollbar {
          display: none;
        }

        .tab-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 1.1rem;
          border-radius: var(--radius-md);
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .tab-toggle-btn:hover {
          color: var(--accent-orange);
          background: rgba(245, 158, 11, 0.05);
        }

        .tab-toggle-btn.active {
          color: var(--accent-orange);
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.35);
          font-weight: 700;
        }

        .tab-content-area {
          animation: fadeIn 0.25s ease-out;
        }

        .tab-section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .tab-text-paragraph {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .highlight-card {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .highlight-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .highlight-desc {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Specs List */
        .specs-list-container {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .spec-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
        }

        .spec-row:nth-child(even) {
          background-color: var(--bg-secondary);
        }

        .spec-row:last-child {
          border-bottom: none;
        }

        .spec-label {
          font-weight: 700;
          color: var(--text-secondary);
          min-width: 140px;
        }

        .spec-value {
          font-weight: 600;
          color: var(--text-primary);
          text-align: right;
        }

        /* Shipping & Warranty Policy Cards */
        .policy-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .policy-card {
          padding: 1.35rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .policy-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .policy-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .policy-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 0.2rem;
        }

        .policy-badge {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-orange);
          background: rgba(234, 88, 12, 0.1);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .policy-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile View Rules */
        @media (max-width: 768px) {
          .product-showcase-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .product-main-img {
            max-height: 320px;
          }

          .product-title {
            font-size: 1.45rem;
          }

          .current-price-val {
            font-size: 1.65rem;
          }

          .product-tabs-card {
            padding: 1.25rem 1rem;
          }

          .tabs-header-bar {
            gap: 0.4rem;
            padding-bottom: 0.5rem;
            margin-bottom: 1.25rem;
          }

          .tab-toggle-btn {
            padding: 0.5rem 0.85rem;
            font-size: 0.82rem;
          }

          .action-buttons-grid {
            grid-template-columns: 1fr;
          }

          .spec-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
            padding: 0.75rem 1rem;
          }

          .spec-value {
            text-align: left;
          }

          .sku-tag {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
