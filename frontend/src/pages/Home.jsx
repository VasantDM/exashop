import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Layers, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Truck, 
  RotateCcw, 
  Headphones, 
  CheckCircle2, 
  Heart, 
  ShoppingCart, 
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
import HeroCarousel from '../components/HeroCarousel';

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
    navigator.clipboard.writeText('EXA10');
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
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)'
    },
    {
      icon: ShieldCheck,
      title: '100% Secure Checkout',
      desc: 'Instant UPI, Cards, Netbanking & QR code with 256-bit encryption',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)'
    },
    {
      icon: RotateCcw,
      title: '7-Day Free Replacement',
      desc: 'Hassle-free 100% money back guarantee with doorstep pickup',
      color: '#ea580c',
      bg: 'rgba(234, 88, 12, 0.12)'
    },
    {
      icon: Award,
      title: '2-Year Brand Warranty',
      desc: 'Official certified hardware warranty & lifetime product support',
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.12)'
    },
  ];

  const testimonials = [
    {
      name: 'Aarav Mehta',
      role: 'Verified Buyer • Bengaluru',
      rating: 5,
      comment: 'The noise-cancelling headphones are unbelievable! Deep rich bass, crystal clear vocals, and delivered within 24 hours.',
      product: 'Studio Pro Wireless ANC'
    },
    {
      name: 'Priya Sharma',
      role: 'Verified Buyer • Mumbai',
      rating: 5,
      comment: 'Super smooth ordering experience. Razorpay UPI payment took 5 seconds, and the smartwatch build quality is top tier.',
      product: 'Fit Ultra Smartwatch'
    },
    {
      name: 'Rohan Deshmukh',
      role: 'Verified Buyer • Pune',
      rating: 5,
      comment: 'Exceptional customer service. Returned one size and got replacement in 2 days. ExaShop is now my go-to lifestyle store!',
      product: 'Hi-Fi Earbuds'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      
      {/* 1. Ultra-Premium Hero Carousel Banner in Radiant Warm Amber-Orange Sunrise Glow */}
      <section>
        <HeroCarousel />
      </section>

      {/* 2. Trust & Value Proposition Cards Bar */}
      <section>
        <div className="home-trust-grid">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div 
                key={idx}
                className="glass-card" 
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: badge.bg,
                  color: badge.color,
                  flexShrink: 0
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-orange)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Layers size={14} /> Curated Collections
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginTop: '0.2rem', color: 'var(--text-primary)' }}>
                Browse by Category
              </h2>
            </div>
            <Link to="/categories" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-orange)', fontSize: '0.88rem', fontWeight: '700' }}>
              <span>View All Categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-categories-grid">
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
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: 'var(--accent-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.85rem',
                  transition: 'transform 0.3s ease, background-color 0.3s ease'
                }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <Headphones size={26} />
                  )}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {cat.product_count !== undefined ? `${cat.product_count} Products` : 'Explore Items'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Trending & Featured Products Grid with Filter Tabs */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-orange)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Flame size={15} color="var(--accent-orange)" /> Trending In Store
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', marginTop: '0.2rem', color: 'var(--text-primary)' }}>
              Popular Products
            </h2>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategoryTab('all')}
              style={{
                padding: '0.4rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: '700',
                backgroundColor: selectedCategoryTab === 'all' ? 'var(--accent-primary)' : '#ffffff',
                color: selectedCategoryTab === 'all' ? '#ffffff' : 'var(--text-secondary)',
                border: selectedCategoryTab === 'all' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                boxShadow: selectedCategoryTab === 'all' ? 'var(--shadow-orange)' : 'var(--shadow-sm)',
                cursor: 'pointer'
              }}
            >
              All Products
            </button>
            <button
              onClick={() => setSelectedCategoryTab('featured')}
              style={{
                padding: '0.4rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: '700',
                backgroundColor: selectedCategoryTab === 'featured' ? 'var(--accent-primary)' : '#ffffff',
                color: selectedCategoryTab === 'featured' ? '#ffffff' : 'var(--text-secondary)',
                border: selectedCategoryTab === 'featured' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                boxShadow: selectedCategoryTab === 'featured' ? 'var(--shadow-orange)' : 'var(--shadow-sm)',
                cursor: 'pointer'
              }}
            >
              ⭐ Featured Picks
            </button>
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryTab(cat.slug)}
                style={{
                  padding: '0.4rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  backgroundColor: selectedCategoryTab === cat.slug ? 'var(--accent-primary)' : '#ffffff',
                  color: selectedCategoryTab === cat.slug ? '#ffffff' : 'var(--text-secondary)',
                  border: selectedCategoryTab === cat.slug ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  boxShadow: selectedCategoryTab === cat.slug ? 'var(--shadow-orange)' : 'var(--shadow-sm)',
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
          <div className="home-products-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="glass-card" style={{ height: '360px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }} />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No Products in this Category</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Check back soon or explore our entire product catalog.</p>
            <Link to="/products" className="btn btn-primary">Browse All Products</Link>
          </div>
        ) : (
          <div className="home-products-grid">
            {displayedProducts.slice(0, 8).map((prod) => {
              const isWishlisted = isInWishlist(prod.id);
              const isAdding = addingProductId === prod.id;

              return (
                <div
                  key={prod.id}
                  className="glass-card"
                  style={{
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  {/* Top Image & Floating Badges */}
                  <div style={{ position: 'relative', marginBottom: '0.85rem', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                    <Link to={`/products/${prod.slug}`} style={{ display: 'block' }}>
                      <img
                        src={prod.primary_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'}
                        alt={prod.name}
                        style={{
                          width: '100%',
                          height: '210px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          transition: 'transform 0.4s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    </Link>

                    {/* Stock status badge */}
                    {prod.stock <= 0 && (
                      <span className="badge badge-danger" style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.72rem' }}>
                        Sold Out
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(prod, e)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isWishlisted ? 'var(--accent-rose)' : 'var(--text-secondary)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={15} fill={isWishlisted ? 'var(--accent-rose)' : 'none'} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {prod.category?.name || 'General'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        <Star size={13} fill="var(--accent-primary)" color="var(--accent-primary)" />
                        <span>{prod.average_rating || '5.0'}</span>
                      </div>
                    </div>

                    <Link to={`/products/${prod.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '0.4rem',
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

                    {/* Apparel Variants Preview Pills */}
                    {prod.has_variants && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
                        {prod.available_colors && prod.available_colors.slice(0, 3).map((c) => (
                          <span
                            key={c.name}
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: c.code || '#ea580c',
                              border: '1.5px solid #ffffff',
                              boxShadow: '0 0 0 1px #d6d3d1'
                            }}
                            title={c.name}
                          />
                        ))}
                        {prod.available_sizes && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '0.2rem', fontWeight: '600' }}>
                            {prod.available_sizes.slice(0, 3).join(', ')}{prod.available_sizes.length > 3 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom / Price & CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        ₹{parseFloat(prod.price || 0).toLocaleString('en-IN')}
                      </div>
                      {prod.compare_at_price && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{parseFloat(prod.compare_at_price).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(prod, e)}
                        disabled={isAdding || prod.stock === 0}
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', fontWeight: '700' }}
                        title="Add to cart"
                      >
                        {isAdding ? (
                          'Adding...'
                        ) : prod.stock === 0 ? (
                          'Out of Stock'
                        ) : (
                          <>
                            <ShoppingCart size={14} /> Add
                          </>
                        )}
                      </button>

                      <Link
                        to={`/products/${prod.slug}`}
                        className="btn btn-outline"
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem' }}
                        title="View Product Specs"
                      >
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/products" className="btn btn-outline" style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', fontWeight: '700' }}>
            View Full Product Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 5. Special Promotional Flash Banner in Warm Amber Gradient */}
      <section className="home-promo-banner">
        <div style={{ maxWidth: '580px', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            <BadgePercent size={18} /> Limited Time Special Offer
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.3rem)', fontWeight: '800', lineHeight: 1.2, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
            Get 30% Off on Selected Collections
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Use the official promo code during checkout to unlock instant discounts across all flagship electronics, lifestyle gear, and daily essentials.
          </p>
        </div>

        <div className="promo-code-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
            Coupon Code
          </div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: '900',
            color: 'var(--accent-orange)',
            letterSpacing: '0.1em',
            padding: '0.4rem 0.9rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '2px dashed var(--accent-primary)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.75rem'
          }}>
            EXA10
          </div>
          <button
            type="button"
            onClick={handleCopyPromo}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', fontWeight: '700' }}
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
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-orange)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            <Award size={16} /> Loved by Thousands of Shoppers
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            What Our Customers Say
          </h2>
        </div>

        <div className="home-testimonials-grid">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.55', fontStyle: 'italic', marginBottom: '1rem' }}>
                  "{t.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <span>{t.name}</span>
                  <CheckCircle2 size={14} color="#059669" />
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
        padding: '2.5rem 1.5rem',
        backgroundColor: '#fafaf9',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        maxWidth: '740px',
        margin: '0 auto',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
          color: '#ffffff'
        }}>
          <Sparkles size={24} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          Join the ExaShop VIP Club
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Get 15% off your first purchase, exclusive drop access, and priority seasonal discounts.
        </p>

        {newsletterSubscribed ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10b981',
            color: '#059669',
            fontWeight: '700',
            fontSize: '0.88rem'
          }}>
            <CheckCircle2 size={16} /> Welcome to the VIP Club! Your 15% discount code is on its way.
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.65rem', maxWidth: '460px', margin: '0 auto', flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.35rem', fontSize: '0.88rem', fontWeight: '700' }}
            >
              <Send size={14} /> Subscribe
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

      <style>{`
        .home-hero-section {
          position: relative;
          border-radius: var(--radius-lg);
          padding: 3.5rem 2.5rem;
          background: linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fef3c7 100%);
          border: 1px solid rgba(245, 158, 11, 0.3);
          box-shadow: 0 20px 45px -15px rgba(245, 158, 11, 0.18);
          overflow: hidden;
        }

        .home-hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .home-metrics-strip {
          display: inline-flex;
          align-items: center;
          gap: 1.75rem;
          padding: 0.85rem 1.5rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          flex-wrap: wrap;
        }

        .metric-divider {
          width: 1px;
          height: 28px;
          background-color: var(--border-color);
        }

        .home-trust-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
          gap: 1.25rem;
        }

        .home-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
          gap: 1.25rem;
        }

        .home-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
          gap: 1.5rem;
        }

        .home-promo-banner {
          border-radius: var(--radius-lg);
          padding: 2.5rem 2rem;
          background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 50%, #fcd34d 100%);
          border: 1px solid #f59e0b;
          box-shadow: 0 15px 35px -10px rgba(245, 158, 11, 0.25);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .promo-code-card {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          text-align: center;
          min-width: 220px;
          box-shadow: var(--shadow-md);
        }

        .home-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: 1.25rem;
        }

        @media (max-width: 768px) {
          .home-hero-section {
            padding: 2rem 1.25rem;
          }

          .home-hero-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            margin-bottom: 2rem;
          }

          .home-hero-actions .btn {
            width: 100%;
          }

          .home-metrics-strip {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            width: 100%;
            padding: 1rem;
            box-sizing: border-box;
          }

          .metric-divider {
            display: none;
          }

          .home-promo-banner {
            padding: 1.75rem 1.25rem;
            flex-direction: column;
            align-items: stretch;
          }

          .promo-code-card {
            width: 100%;
            min-width: 0;
          }

          .home-products-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .home-trust-grid {
            grid-template-columns: 1fr;
          }

          .home-categories-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem;
          }

          .home-testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
