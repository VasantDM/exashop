import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Flame, 
  Truck, 
  ShieldCheck, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Zap, 
  BadgePercent 
} from 'lucide-react';

const slidesData = [
  {
    id: 1,
    tag: '2026 Curated Modern Collection',
    tagIcon: Sparkles,
    tagColor: 'var(--accent-orange)',
    titlePrefix: 'Shop What You Love With ',
    titleHighlight: 'ExaShop',
    titleSuffix: '',
    subtitle: 'Experience curated electronics, stylish apparel, and lifestyle essentials with fast doorstep delivery, easy returns, and secure payments.',
    primaryBtn: { text: 'Shop New Arrivals', link: '/products', icon: ArrowRight },
    secondaryBtn: { text: 'Explore Categories', link: '/categories', icon: Layers },
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    floatingBadge: '⭐ 4.9 Top Rated Tech',
    floatingPrice: '₹4,999 (Save 25%)',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fef3c7 100%)',
    borderGlow: 'rgba(245, 158, 11, 0.35)',
    metrics: [
      { value: '50,000+', label: 'Happy Customers' },
      { value: '4.9 / 5.0', label: 'Store Rating', isStar: true },
      { value: '100% Safe', label: 'UPI & Cards' }
    ]
  },
  {
    id: 2,
    tag: 'Limited Time Festive Flash Sale',
    tagIcon: Flame,
    tagColor: '#ea580c',
    titlePrefix: 'Upgrade Your Gear With ',
    titleHighlight: '30% Off',
    titleSuffix: ' Today',
    subtitle: 'Unlock instant discounts on ANC audio headsets, smart wearables, and computing essentials with store code EXA10.',
    primaryBtn: { text: 'Claim 30% Off Deals', link: '/products?ordering=-price', icon: Zap },
    secondaryBtn: { text: 'Copy Coupon: EXA10', isCopy: true, icon: BadgePercent },
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    floatingBadge: '🔥 Flash Sale Active',
    floatingPrice: 'Code: EXA10',
    bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fed7aa 100%)',
    borderGlow: 'rgba(234, 88, 12, 0.35)',
    metrics: [
      { value: '30% Off', label: 'On Selected Items' },
      { value: '2-Year', label: 'Brand Warranty' },
      { value: 'Instant', label: 'UPI Cashback' }
    ]
  },
  {
    id: 3,
    tag: 'Priority 24h Express Dispatch',
    tagIcon: Truck,
    tagColor: '#059669',
    titlePrefix: 'Fast Doorstep Delivery ',
    titleHighlight: 'Guaranteed',
    titleSuffix: '',
    subtitle: 'Free priority express shipping on orders above ₹499 with 7-day doorstep replacement and dedicated customer care.',
    primaryBtn: { text: 'Explore All Products', link: '/products', icon: ArrowRight },
    secondaryBtn: { text: 'Track Orders', link: '/orders', icon: ShieldCheck },
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    floatingBadge: '🚚 Priority 2-Day Express',
    floatingPrice: '100% Genuine Stock',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #fef3c7 100%)',
    borderGlow: 'rgba(16, 185, 129, 0.35)',
    metrics: [
      { value: '24-48h', label: 'Doorstep Delivery' },
      { value: '7 Days', label: 'Free Replacement' },
      { value: '24/7 Care', label: 'Live Support' }
    ]
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedPromo, setCopiedPromo] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Touch swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleCopyPromo = () => {
    navigator.clipboard.writeText('EXA10');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2500);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const slide = slidesData[currentSlide];
  const TagIcon = slide.tagIcon;
  const PrimaryIcon = slide.primaryBtn.icon;
  const SecondaryIcon = slide.secondaryBtn.icon;

  return (
    <div 
      className="hero-carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambient Glows */}
      <div 
        className="carousel-ambient-glow top-right"
        style={{ background: `radial-gradient(circle, ${slide.borderGlow} 0%, transparent 70%)` }}
      />
      <div 
        className="carousel-ambient-glow bottom-left"
        style={{ background: 'radial-gradient(circle, rgba(234, 88, 12, 0.18) 0%, transparent 70%)' }}
      />

      {/* Main Slide Card */}
      <div 
        className="hero-slide-card"
        style={{
          background: slide.bgGradient,
          borderColor: slide.borderGlow
        }}
      >
        <div className="hero-slide-grid">
          {/* Left Column: Text, CTAs & Metrics */}
          <div className="hero-content-col">
            {/* Tag Badge */}
            <div 
              className="hero-badge-pill"
              style={{
                color: slide.tagColor,
                borderColor: slide.borderGlow
              }}
            >
              <TagIcon size={14} color={slide.tagColor} />
              <span>{slide.tag}</span>
            </div>

            {/* Title */}
            <h1 className="hero-slide-title">
              {slide.titlePrefix}
              <span className="gradient-text">{slide.titleHighlight}</span>
              {slide.titleSuffix}
            </h1>

            {/* Subtitle */}
            <p className="hero-slide-subtitle">
              {slide.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="hero-slide-actions">
              <Link to={slide.primaryBtn.link} className="btn btn-primary hero-btn-main">
                <span>{slide.primaryBtn.text}</span>
                <PrimaryIcon size={17} />
              </Link>

              {slide.secondaryBtn.isCopy ? (
                <button
                  type="button"
                  onClick={handleCopyPromo}
                  className="btn btn-outline hero-btn-sub"
                >
                  {copiedPromo ? (
                    <>
                      <Check size={16} color="#059669" />
                      <span style={{ color: '#059669' }}>Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <SecondaryIcon size={16} />
                      <span>{slide.secondaryBtn.text}</span>
                    </>
                  )}
                </button>
              ) : (
                <Link to={slide.secondaryBtn.link} className="btn btn-outline hero-btn-sub">
                  <SecondaryIcon size={16} />
                  <span>{slide.secondaryBtn.text}</span>
                </Link>
              )}
            </div>

            {/* Quick Metrics Strip */}
            <div className="hero-metrics-container">
              {slide.metrics.map((m, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <div className="hero-metric-sep" />}
                  <div className="hero-metric-unit">
                    <div className="metric-val">
                      {m.isStar && <Star size={15} fill="var(--accent-primary)" color="var(--accent-primary)" />}
                      <span>{m.value}</span>
                    </div>
                    <div className="metric-lbl">{m.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Product Artwork Showcase */}
          <div className="hero-visual-col">
            <div className="hero-image-card">
              <img 
                src={slide.image} 
                alt={slide.titleHighlight} 
                className="hero-showcase-img"
              />
              
              {/* Floating Pill Badges on image */}
              <div className="floating-hero-pill top-pill">
                {slide.floatingBadge}
              </div>

              <div className="floating-hero-pill bottom-pill">
                {slide.floatingPrice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next Navigation Chevron Controls */}
      <button 
        onClick={prevSlide}
        className="carousel-nav-btn prev-btn"
        aria-label="Previous Slide"
        title="Previous"
      >
        <ChevronLeft size={20} />
      </button>

      <button 
        onClick={nextSlide}
        className="carousel-nav-btn next-btn"
        aria-label="Next Slide"
        title="Next"
      >
        <ChevronRight size={20} />
      </button>

      {/* Interactive Pagination Dot Indicators */}
      <div className="carousel-indicators-bar">
        {slidesData.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className={`carousel-dot ${isActive ? 'active' : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
              title={`Slide ${idx + 1}`}
            />
          );
        })}
      </div>

      <style>{`
        .hero-carousel-wrapper {
          position: relative;
          width: 100%;
          border-radius: var(--radius-lg);
          user-select: none;
        }

        .carousel-ambient-glow {
          position: absolute;
          width: 380px;
          height: 380px;
          filter: blur(50px);
          pointer-events: none;
          z-index: 1;
        }

        .carousel-ambient-glow.top-right {
          top: -15%;
          right: -8%;
        }

        .carousel-ambient-glow.bottom-left {
          bottom: -15%;
          left: -8%;
        }

        .hero-slide-card {
          position: relative;
          z-index: 2;
          border-radius: var(--radius-lg);
          padding: 3rem 2.5rem;
          border: 1px solid var(--border-color);
          box-shadow: 0 16px 40px -12px rgba(245, 158, 11, 0.18);
          overflow: hidden;
          transition: all 0.4s ease;
        }

        .hero-slide-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.95fr;
          gap: 2.5rem;
          align-items: center;
        }

        .hero-content-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          z-index: 2;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.95rem;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-color);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
          box-shadow: var(--shadow-sm);
        }

        .hero-slide-title {
          font-size: clamp(2rem, 4vw, 3.4rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
          color: var(--text-primary);
          animation: slideInText 0.35s ease;
        }

        .hero-slide-subtitle {
          font-size: clamp(0.92rem, 1.8vw, 1.15rem);
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1.75rem;
          max-width: 620px;
          animation: slideInText 0.45s ease;
        }

        .hero-slide-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .hero-btn-main {
          padding: 0.85rem 1.85rem;
          font-size: 0.98rem;
          font-weight: 800;
          border-radius: var(--radius-md);
        }

        .hero-btn-sub {
          padding: 0.85rem 1.6rem;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: var(--radius-md);
        }

        .hero-metrics-container {
          display: inline-flex;
          align-items: center;
          gap: 1.5rem;
          padding: 0.75rem 1.35rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          flex-wrap: wrap;
        }

        .hero-metric-sep {
          width: 1px;
          height: 26px;
          background-color: var(--border-color);
        }

        .hero-metric-unit .metric-val {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .hero-metric-unit .metric-lbl {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Right Column Showcase Visual */
        .hero-visual-col {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .hero-image-card {
          position: relative;
          width: 100%;
          max-width: 380px;
          height: 320px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.15);
          border: 2px solid #ffffff;
          background-color: #ffffff;
        }

        .hero-showcase-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          animation: zoomIn 0.5s ease;
        }

        .hero-image-card:hover .hero-showcase-img {
          transform: scale(1.06);
        }

        .floating-hero-pill {
          position: absolute;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 800;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        }

        .floating-hero-pill.top-pill {
          top: 14px;
          left: 14px;
          background: rgba(255, 255, 255, 0.92);
          color: var(--text-primary);
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .floating-hero-pill.bottom-pill {
          bottom: 14px;
          right: 14px;
          background: var(--accent-gradient);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
        }

        /* Prev / Next Nav Buttons */
        .carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all var(--transition-fast);
        }

        .carousel-nav-btn:hover {
          background: #ffffff;
          border-color: var(--accent-primary);
          color: var(--accent-orange);
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.25);
        }

        .carousel-nav-btn.prev-btn {
          left: -18px;
        }

        .carousel-nav-btn.next-btn {
          right: -18px;
        }

        /* Indicators */
        .carousel-indicators-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.25rem;
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          background-color: #d6d3d1;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-dot.active {
          width: 28px;
          background: var(--accent-gradient);
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35);
        }

        @keyframes slideInText {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes zoomIn {
          from { opacity: 0.8; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Mobile View Rules */
        @media (max-width: 768px) {
          .hero-slide-card {
            padding: 1.5rem 1.15rem;
          }

          .hero-slide-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .hero-visual-col {
            order: -1; /* Place image on top on mobile app layout */
          }

          .hero-image-card {
            height: 180px;
            max-width: 100%;
          }

          .hero-slide-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }

          .hero-btn-main,
          .hero-btn-sub {
            width: 100%;
            justify-content: center;
          }

          .hero-metrics-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.65rem;
            width: 100%;
            padding: 0.75rem;
            box-sizing: border-box;
          }

          .hero-metric-sep {
            display: none;
          }

          .carousel-nav-btn {
            display: none; /* Fluid touch-swipe on mobile */
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
