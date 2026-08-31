import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Layers, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Package, 
  CreditCard, 
  Zap, 
  TrendingUp,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Heart,
  ShoppingCart,
  Clock,
  ChevronRight,
  Flame,
  Award,
  BadgePercent,
  Check,
  Send
} from 'lucide-react';
import { getFeaturedProducts, getProducts, getCategories } from '../services/catalogService';
import { useCart } from '../context/CartContext';
import VariantModal from '../components/VariantModal';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState(null);

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const [featuredData, prodsData, catsData] = await Promise.allSettled([
          getFeaturedProducts(),
          getProducts({ page_size: 12 }),
          getCategories(),
        ]);

        if (featuredData.status === 'fulfilled') {
          setFeaturedProducts(Array.isArray(featuredData.value) ? featuredData.value : (featuredData.value?.results || []));
        }
        if (prodsData.status === 'fulfilled') {
          setAllProducts(prodsData.value?.results || (Array.isArray(prodsData.value) ? prodsData.value : []));
        }
        if (catsData.status === 'fulfilled') {
          setCategories(Array.isArray(catsData.value) ? catsData.value : (catsData.value?.results || []));
        }
      } catch (err) {
        console.error('Failed to load home page catalog:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.has_variants && product.variants && product.variants.length > 0) {
      setVariantModalProduct(product);
      return;
    }
    setAddingProductId(product.id);
    try {
      await addToCart(product.id, 1);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleWishlistToggle = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleCopyPromo = () => {
    navigator.clipboard.writeText('AURA10');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2500);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  // Filter products by selected category tab
  const displayedProducts = selectedCategoryTab === 'all'
    ? allProducts
    : selectedCategoryTab === 'featured'
    ? featuredProducts
    : allProducts.filter(p => p.category?.slug === selectedCategoryTab || p.category_name?.toLowerCase() === selectedCategoryTab.toLowerCase());

  const trustBadges = [
    {
      icon: Truck,
      title: 'Free Express Shipping',
      desc: 'Free priority 2-day delivery on all orders above ₹499',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)'
    },
    {
      icon: ShieldCheck,
      title: '100% Secure Razorpay',
      desc: 'Instant UPI, Cards, Netbanking & QR code with 256-bit encryption',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)'
    },
    {
      icon: RotateCcw,
      title: '7-Day Free Replacement',
      desc: 'Hassle-free 100% money back guarantee with doorstep pickup',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)'
    },
    {
      icon: Award,
      title: '2-Year Brand Warranty',
      desc: 'Official certified hardware warranty & lifetime product support',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)'
    },
  ];

  const testimonials = [
    {
      name: 'Aarav Mehta',
      role: 'Verified Buyer • Bengaluru',
      rating: 5,
      comment: 'The noise-cancelling headphones are unbelievable! Deep rich bass, crystal clear vocals, and delivered within 24 hours via Razorpay checkout.',
      product: 'AuraStudio Pro Wireless ANC'
    },
    {
      name: 'Priya Sharma',
      role: 'Verified Buyer • Mumbai',
      rating: 5,
      comment: 'Super smooth ordering experience. Razorpay UPI payment took 5 seconds, and the smartwatch build quality feels like a ₹20,000 device.',
      product: 'AuraFit Ultra Smartwatch'
    },
    {
      name: 'Rohan Deshmukh',
      role: 'Verified Buyer • Pune',
      rating: 5,
      comment: 'Exceptional customer service. Returned one size and got replacement in 2 days. AuraStore is now my go-to electronics brand!',
      product: 'AuraPod Hi-Fi Earbuds'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
      {/* 1. Ultra-Premium Hero Section */}
      <section style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(2.5rem, 5vw, 4.5rem) clamp(1.5rem, 4vw, 3.5rem)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), var(--shadow-glow)',
        overflow: 'hidden'
      }}>
        {/* Ambient background glow orbs */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} color="var(--accent-amber)" /> 2026 Audio & Smart Tech Collection
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
            fontWeight: '800',
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            color: '#ffffff'
          }}>
            Elevate Your Everyday <span className="gradient-text">Sound & Style</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: '2.25rem',
            maxWidth: '680px'
          }}>
            Experience studio-engineered acoustics, intelligent active noise cancellation, and luxury wearable technology built for audiophiles and modern creators.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Link 
              to="/products" 
              className="btn btn-primary" 
              style={{ 
                padding: '0.9rem 2rem', 
                fontSize: '1.05rem', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)'
              }}
            >
              Shop New Arrivals <ArrowRight size={18} />
            </Link>

            <Link 
              to="/categories" 
              className="btn btn-outline" 
              style={{ 
                padding: '0.9rem 1.75rem', 
                fontSize: '1.05rem', 
                fontWeight: '700',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <Layers size={18} /> Explore Categories
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            flexWrap: 'wrap',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>50,000+</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Delivered Orders</div>
            </div>
            <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-color)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
                <Star size={18} fill="var(--accent-amber)" color="var(--accent-amber)" /> 4.9 / 5.0
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Customer Reviews</div>
            </div>
            <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border-color)' }} />
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>100% Secure</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Razorpay UPI & Cards</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust & Value Proposition Cards Bar */}
      <section>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div 
                key={idx}
                className="glass-card" 
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: badge.bg,
                  color: badge.color,
                  flexShrink: 0
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.3rem' }}>
                    {badge.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Shop By Category Showcase */}
      {categories.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Layers size={14} /> Curated Collections
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', marginTop: '0.25rem', color: '#ffffff' }}>
                Browse by Category
              </h2>
            </div>
            <Link to="/categories" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: '700' }}>
              <span>View All Categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.25rem'
          }}>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="glass-card"
                style={{
                  padding: '1.5rem 1.25rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  transition: 'transform 0.3s ease, background-color 0.3s ease'
                }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <Headphones size={28} />
                  )}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.3rem' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {cat.product_count !== undefined ? `${cat.product_count} Products` : 'Explore Items'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Trending & Featured Products Grid with Filter Tabs */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Flame size={15} color="var(--accent-rose)" /> Trending In Store
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', marginTop: '0.25rem', color: '#ffffff' }}>
              Popular Products
            </h2>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategoryTab('all')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: '700',
                backgroundColor: selectedCategoryTab === 'all' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: selectedCategoryTab === 'all' ? '#ffffff' : 'var(--text-secondary)',
                border: selectedCategoryTab === 'all' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
            >
              All Products
            </button>
            <button
              onClick={() => setSelectedCategoryTab('featured')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: '700',
                backgroundColor: selectedCategoryTab === 'featured' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: selectedCategoryTab === 'featured' ? '#ffffff' : 'var(--text-secondary)',
                border: selectedCategoryTab === 'featured' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
            >
              ⭐ Featured Only
            </button>
            {categories.slice(0, 3).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategoryTab(cat.slug)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  backgroundColor: selectedCategoryTab === cat.slug ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: selectedCategoryTab === cat.slug ? '#ffffff' : 'var(--text-secondary)',
                  border: selectedCategoryTab === cat.slug ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="glass-card" style={{ height: '380px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }} />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>No Products in this Category</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Check back soon or explore our entire product catalog.</p>
            <Link to="/products" className="btn btn-primary">Browse All Products</Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.5rem'
          }}>
            {displayedProducts.slice(0, 8).map((prod) => {
              const isWishlisted = isInWishlist(prod.id);
              const isAdding = addingProductId === prod.id;

              return (
                <div
                  key={prod.id}
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'transform 0.3s ease, border-color 0.3s ease'
                  }}
                >
                  {/* Top Image & Floating Badges */}
                  <div style={{ position: 'relative', marginBottom: '1rem', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                    <Link to={`/products/${prod.slug}`} style={{ display: 'block' }}>
                      <img
                        src={prod.primary_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'}
                        alt={prod.name}
                        style={{
                          width: '100%',
                          height: '210px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface)',
                          transition: 'transform 0.4s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    </Link>

                    {/* Discount Badge */}
                    {prod.has_discount && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 2px 8px rgba(244, 63, 94, 0.4)'
                      }}>
                        -{prod.discount_percentage}% OFF
                      </span>
                    )}

                    {/* Wishlist Floating Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(prod, e)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: isWishlisted ? '#ec4899' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, background-color 0.2s ease'
                      }}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart size={16} fill={isWishlisted ? '#ec4899' : 'none'} />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
                          {prod.brand_name || prod.category_name || 'Aura Electronics'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-amber)', fontWeight: '700' }}>
                          <Star size={13} fill="currentColor" /> {prod.average_rating || '4.9'}
                        </span>
                      </div>

                      <Link to={`/products/${prod.slug}`}>
                        <h3 style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#ffffff',
                          marginBottom: '0.75rem',
                          lineHeight: '1.35',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '2.7rem'
                        }}>
                          {prod.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Price & Action Row */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.85rem' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>
                          ₹{prod.current_price}
                        </span>
                        {prod.has_discount && prod.original_price && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ₹{prod.original_price}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(prod, e)}
                          disabled={isAdding || prod.stock === 0}
                          className="btn btn-primary"
                          style={{
                            padding: '0.6rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            width: '100%',
                            opacity: prod.stock === 0 ? 0.6 : 1
                          }}
                        >
                          {isAdding ? (
                            'Adding...'
                          ) : prod.stock === 0 ? (
                            'Out of Stock'
                          ) : (
                            <>
                              <ShoppingCart size={15} /> Add to Cart
                            </>
                          )}
                        </button>

                        <Link
                          to={`/products/${prod.slug}`}
                          className="btn btn-outline"
                          style={{ padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                          title="View Product Specs"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/products" className="btn btn-outline" style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', fontWeight: '700' }}>
            View Full Product Catalog <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 5. Special Promotional Flash Banner */}
      <section style={{
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.35) 0%, rgba(236, 72, 153, 0.35) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div style={{ maxWidth: '580px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            <BadgePercent size={18} /> Limited Time Special Offer
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', lineHeight: 1.2, color: '#ffffff', marginBottom: '0.75rem' }}>
            Get 30% Off on Flagship Studio Gear
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.98rem', lineHeight: 1.6 }}>
            Use the official promo code during checkout to unlock instant discounts across all flagship audio and wireless wearable items.
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          padding: '1.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          minWidth: '260px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Coupon Code
          </div>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: '900',
            color: '#ffffff',
            letterSpacing: '0.1em',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            border: '2px dashed var(--accent-primary)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.85rem'
          }}>
            AURA10
          </div>
          <button
            type="button"
            onClick={handleCopyPromo}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', fontWeight: '700' }}
          >
            {copiedPromo ? (
              <>
                <Check size={14} /> Code Copied!
              </>
            ) : (
              'Copy Coupon Code'
            )}
          </button>
        </div>
      </section>

      {/* 6. Customer Reviews & Social Proof */}
      <section>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            <Award size={16} /> Loved by Thousands of Audiophiles
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            What Our Customers Say
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--accent-amber)', marginBottom: '0.85rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.92rem', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  "{t.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', fontSize: '0.92rem', color: '#ffffff' }}>
                  <span>{t.name}</span>
                  <CheckCircle2 size={14} color="var(--accent-emerald)" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t.role} • {t.product}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. VIP Club / Newsletter Signup */}
      <section style={{
        borderRadius: 'var(--radius-lg)',
        padding: '3rem 2rem',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        maxWidth: '780px',
        margin: '0 auto',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={26} color="#ffffff" />
        </div>

        <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
          Join the AuraStore VIP Club
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.75rem' }}>
          Get 15% off your first purchase, exclusive drops access, and priority invitations to seasonal promotions.
        </p>

        {newsletterSubscribed ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-emerald)',
            color: 'var(--accent-emerald)',
            fontWeight: '700'
          }}>
            <CheckCircle2 size={18} /> Welcome to the VIP Club! Your 15% discount code is on its way.
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '480px', margin: '0 auto', flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '0.8rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem', fontWeight: '700' }}
            >
              <Send size={15} /> Subscribe
            </button>
          </form>
        )}
      </section>

      {/* Variant Selection Modal Popup */}
      <VariantModal
        isOpen={Boolean(variantModalProduct)}
        onClose={() => setVariantModalProduct(null)}
        product={variantModalProduct}
      />
    </div>
  );
};

export default Home;
