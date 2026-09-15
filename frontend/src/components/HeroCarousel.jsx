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
  BadgePercent,
  ShoppingBag
} from 'lucide-react';

const slidesData = [
  {
    id: 1,
    tag: '2026 Curated Modern Tech',
    tagIcon: Sparkles,
    tagColor: '#ea580c',
    titlePrefix: 'Shop What You Love With ',
    titleHighlight: 'ExaShop',
    titleSuffix: '',
    subtitle: 'Discover premium studio acoustics, next-gen electronics, and everyday essentials with 100% genuine warranties and express doorstep delivery.',
    primaryBtn: { text: 'Shop New Arrivals', link: '/products', icon: ArrowRight },
    secondaryBtn: { text: 'Explore Categories', link: '/categories', icon: Layers },
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    floatingBadge: '⭐ 4.9 Studio Acoustic Sound',
    floatingPrice: '₹4,999 (Save 25%)',
    bgGradient: 'radial-gradient(ellipse at 80% 50%, rgba(251, 191, 36, 0.18) 0%, rgba(254, 243, 199, 0.45) 40%, #ffffff 80%)',
    ambientColor: 'rgba(245, 158, 11, 0.22)',
    metrics: [
      { value: '50,000+', label: 'Happy Customers' },
      { value: '4.9 / 5.0', label: 'Store Rating', isStar: true },
      { value: '100% Safe', label: 'Verified Payments' }
    ]
  },
  {
    id: 2,
    tag: 'Limited Festive Flash Sale',
    tagIcon: Flame,
    tagColor: '#ea580c',
    titlePrefix: 'Upgrade Your Gear With ',
    titleHighlight: '30% Off',
    titleSuffix: ' Today',
    subtitle: 'Unlock instant savings across smart wearables, computing accessories, and audio gear using exclusive store promo code EXA10 at checkout.',
    primaryBtn: { text: 'Claim 30% Off Deals', link: '/products?ordering=-price', icon: Zap },
    secondaryBtn: { text: 'Copy Coupon: EXA10', isCopy: true, icon: BadgePercent },
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    floatingBadge: '🔥 Flash Sale Active',
    floatingPrice: 'Use Code: EXA10',
    bgGradient: 'radial-gradient(ellipse at 80% 50%, rgba(234, 88, 12, 0.16) 0%, rgba(255, 237, 213, 0.5) 40%, #ffffff 80%)',
    ambientColor: 'rgba(234, 88, 12, 0.22)',
    metrics: [
      { value: '30% Off', label: 'Selected Tech' },
      { value: '2-Year', label: 'Brand Warranty' },
      { value: 'Instant', label: 'UPI Cashback' }
    ]
  },
  {
    id: 3,
    tag: 'Trending Streetwear & Apparel',
    tagIcon: ShoppingBag,
    tagColor: '#d97706',
    titlePrefix: 'Elevate Your Daily Style With ',
    titleHighlight: 'Premium Apparel',
    titleSuffix: '',
    subtitle: 'Crafted from 100% heavyweight bio-washed cotton for tailored comfort, minimalist street aesthetics, and long-lasting durability.',
    primaryBtn: { text: 'Browse Fashion', link: '/products?category=fashion-apparel', icon: ArrowRight },
    secondaryBtn: { text: 'Explore Sizes', link: '/products', icon: Layers },
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    floatingBadge: '✨ 100% Heavyweight Cotton',
    floatingPrice: 'Starting at ₹899',
    bgGradient: 'radial-gradient(ellipse at 80% 50%, rgba(217, 119, 6, 0.15) 0%, rgba(254, 243, 199, 0.45) 40%, #ffffff 80%)',
    ambientColor: 'rgba(217, 119, 6, 0.2)',
    metrics: [
      { value: '100% Cotton', label: 'Bio-Washed Fabric' },
      { value: 'Pre-Shrunk', label: 'Tailored Fit' },
      { value: '30 Days', label: 'Easy Returns' }
    ]
  },
  {
    id: 4,
    tag: 'Priority 24h Express Dispatch',
    tagIcon: Truck,
    tagColor: '#059669',
    titlePrefix: 'Fast Doorstep Delivery ',
    titleHighlight: 'Guaranteed',
    titleSuffix: ' Across India',
    subtitle: 'Enjoy lightning-fast order processing with free express shipping on orders over ₹499 and 7-day doorstep replacement guarantee.',
    primaryBtn: { text: 'Explore All Products', link: '/products', icon: ArrowRight },
    secondaryBtn: { text: 'Track Order', link: '/orders', icon: ShieldCheck },
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    floatingBadge: '🚚 Express 24h Dispatch',
    floatingPrice: '100% Genuine Stock',
    bgGradient: 'radial-gradient(ellipse at 80% 50%, rgba(16, 185, 129, 0.15) 0%, rgba(209, 250, 229, 0.45) 40%, #ffffff 80%)',
    ambientColor: 'rgba(16, 185, 129, 0.2)',
    metrics: [
      { value: '24-48h', label: 'Express Delivery' },
      { value: '7 Days', label: 'Free Replacement' },
      { value: '24/7 Care', label: 'Live Support' }
    ]
  }
];

const AUTO_SCROLL_DELAY = 3000; // Smooth 3 seconds auto-scroll as requested

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedPromo, setCopiedPromo] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
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

  // Smooth 3-Second Auto-Scroll
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_SCROLL_DELAY);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, currentSlide]);

  const handleCopyPromo = (e) => {
    if (e) e.preventDefault();
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
    if (Math.abs(diff) > 40) {
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
      className="hero-banner-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Seamless Ambient Glow Aura */}
      <div 
        className="hero-ambient-aura"
        style={{ background: slide.ambientColor }}
      />

      {/* Main Seamless Hero Stage (No boxy card frame) */}
      <div 
        className="hero-stage"
        style={{ background: slide.bgGradient }}
      >
        <div className="hero-layout-grid" key={slide.id}>
          {/* Left Column: Text, CTAs & Metrics */}
          <div className="hero-text-content">
            {/* Tag Badge */}
            <div 
              className="hero-tag-badge"
              style={{ color: slide.tagColor }}
            >
              <TagIcon size={15} color={slide.tagColor} />
              <span>{slide.tag}</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-headline">
              {slide.titlePrefix}
              <span className="gradient-text">{slide.titleHighlight}</span>
              {slide.titleSuffix}
            </h1>

            {/* Subtitle Description */}
            <p className="hero-desc">
              {slide.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="hero-action-buttons">
              <Link to={slide.primaryBtn.link} className="btn btn-primary hero-cta-btn">
                <span>{slide.primaryBtn.text}</span>
                <PrimaryIcon size={18} />
              </Link>

              {slide.secondaryBtn.isCopy ? (
                <button
                  type="button"
                  onClick={handleCopyPromo}
                  className="btn btn-outline hero-secondary-btn"
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
                <Link to={slide.secondaryBtn.link} className="btn btn-outline hero-secondary-btn">
                  <SecondaryIcon size={16} />
                  <span>{slide.secondaryBtn.text}</span>
                </Link>
              )}
            </div>

            {/* Trust Metrics Strip */}
            <div className="hero-trust-bar">
              {slide.metrics.map((m, mIdx) => (
                <React.Fragment key={mIdx}>
                  {mIdx > 0 && <div className="hero-trust-sep" />}
                  <div className="hero-trust-item">
                    <div className="trust-val">
                      {m.isStar && <Star size={14} fill="var(--accent-primary)" color="var(--accent-primary)" />}
                      <span>{m.value}</span>
                    </div>
                    <div className="trust-lbl">{m.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Column: Seamless Product Visual Showcase (No boxed card wrapper) */}
          <div className="hero-showcase-visual">
            <div className="visual-media-stage">
              <img 
                src={slide.image} 
                alt={slide.titleHighlight} 
                className="visual-featured-image"
              />
              
              {/* Floating Ambient Info Chips */}
              <div className="floating-chip top-chip">
                {slide.floatingBadge}
              </div>

              <div className="floating-chip bottom-chip">
                {slide.floatingPrice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next Nav Chevrons */}
      <button 
        type="button"
        onClick={prevSlide}
        className="hero-arrow-btn prev-arrow"
        aria-label="Previous Slide"
        title="Previous"
      >
        <ChevronLeft size={22} />
      </button>

      <button 
        type="button"
        onClick={nextSlide}
        className="hero-arrow-btn next-arrow"
        aria-label="Next Slide"
        title="Next"
      >
        <ChevronRight size={22} />
      </button>

      {/* Minimalist Pagination Dot Indicators */}
      <div className="hero-pagination-dots">
        {slidesData.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`hero-dot-pill ${isActive ? 'active' : ''}`}
              aria-label={`Slide ${idx + 1}`}
              title={`Slide ${idx + 1}: ${s.tag}`}
            />
          );
        })}
      </div>

      <style>{`
        .hero-banner-container {
          position: relative;
          width: 100%;
          border-radius: 24px;
          user-select: none;
          margin-bottom: 0.5rem;
        }

        /* Ambient Glow Backdrop */
        .hero-ambient-aura {
          position: absolute;
          inset: -12px;
          border-radius: 36px;
          filter: blur(45px);
          z-index: 1;
          opacity: 0.75;
          transition: background 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        /* Seamless Hero Stage (Clean edge, no boxy card borders) */
        .hero-stage {
          position: relative;
          z-index: 2;
          border-radius: 24px;
          padding: 3.2rem 3rem;
          border: 1px solid rgba(245, 158, 11, 0.2);
          box-shadow: 0 12px 35px -8px rgba(245, 158, 11, 0.12), 0 2px 10px rgba(0, 0, 0, 0.03);
          overflow: hidden;
          transition: background 0.6s ease;
        }

        .hero-layout-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.95fr;
          gap: 3rem;
          align-items: center;
          width: 100%;
          animation: heroFadeSlideIn 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes heroFadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Left Content Column */
        .hero-text-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          z-index: 2;
        }

        .hero-tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.1rem;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.3);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.1);
        }

        .hero-headline {
          font-size: clamp(2.2rem, 4.4vw, 3.6rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 1.1rem;
          color: var(--text-primary, #0f172a);
        }

        .hero-desc {
          font-size: clamp(0.95rem, 1.8vw, 1.15rem);
          color: var(--text-secondary, #57534e);
          line-height: 1.65;
          margin-bottom: 2rem;
          max-width: 620px;
        }

        /* Action Buttons */
        .hero-action-buttons {
          display: flex;
          align-items: center;
          gap: 1.1rem;
          margin-bottom: 2.2rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .hero-cta-btn {
          padding: 0.95rem 2rem;
          font-size: 1rem;
          font-weight: 800;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--accent-gradient, linear-gradient(135deg, #f59e0b, #ea580c));
          color: #ffffff;
          box-shadow: 0 6px 18px rgba(234, 88, 12, 0.32);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: none;
        }

        .hero-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(234, 88, 12, 0.45);
        }

        .hero-secondary-btn {
          padding: 0.95rem 1.75rem;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color, #e7e5e4);
          color: var(--text-primary, #0f172a);
          transition: all 0.2s ease;
        }

        .hero-secondary-btn:hover {
          background: #ffffff;
          border-color: #ea580c;
          color: #ea580c;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        }

        /* Trust Metrics Strip */
        .hero-trust-bar {
          display: inline-flex;
          align-items: center;
          gap: 1.6rem;
          padding: 0.75rem 1.4rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          flex-wrap: wrap;
        }

        .hero-trust-sep {
          width: 1px;
          height: 28px;
          background-color: var(--border-color, #e7e5e4);
        }

        .hero-trust-item .trust-val {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 1.22rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          line-height: 1.2;
        }

        .hero-trust-item .trust-lbl {
          font-size: 0.72rem;
          color: var(--text-secondary, #57534e);
          font-weight: 600;
        }

        /* Right Column: Seamless Showcase (No boxed card) */
        .hero-showcase-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .visual-media-stage {
          position: relative;
          width: 100%;
          max-width: 440px;
          height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visual-featured-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 20px 45px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          animation: visualPopIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes visualPopIn {
          from {
            opacity: 0.6;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .visual-media-stage:hover .visual-featured-image {
          transform: scale(1.03);
        }

        /* Floating Ambient Info Chips */
        .floating-chip {
          position: absolute;
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 800;
          backdrop-filter: blur(14px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
          z-index: 10;
          animation: floatSine 3.5s ease-in-out infinite alternate;
        }

        @keyframes floatSine {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-6px); }
        }

        .floating-chip.top-chip {
          top: 18px;
          left: 18px;
          background: rgba(255, 255, 255, 0.95);
          color: var(--text-primary, #0f172a);
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .floating-chip.bottom-chip {
          bottom: 18px;
          right: 18px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);
          animation-delay: 1.75s;
        }

        /* Nav Chevrons */
        .hero-arrow-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(245, 158, 11, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary, #0f172a);
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }

        .hero-arrow-btn:hover {
          background: #ffffff;
          border-color: #ea580c;
          color: #ea580c;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(234, 88, 12, 0.25);
        }

        .hero-arrow-btn.prev-arrow {
          left: -18px;
        }

        .hero-arrow-btn.next-arrow {
          right: -18px;
        }

        /* Minimalist Clean Pagination Dots */
        .hero-pagination-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          margin-top: 1.35rem;
        }

        .hero-dot-pill {
          width: 9px;
          height: 9px;
          border-radius: 20px;
          background-color: #d6d3d1;
          border: none;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
        }

        .hero-dot-pill:hover {
          background-color: #a8a29e;
        }

        .hero-dot-pill.active {
          width: 28px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35);
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .hero-stage {
            padding: 2.4rem 2rem;
          }

          .hero-layout-grid {
            gap: 2rem;
          }

          .visual-media-stage {
            height: 280px;
            max-width: 360px;
          }
        }

        @media (max-width: 768px) {
          .hero-stage {
            padding: 1.8rem 1.25rem;
          }

          .hero-layout-grid {
            grid-template-columns: 1fr;
            gap: 1.75rem;
          }

          .hero-showcase-visual {
            order: -1;
          }

          .visual-media-stage {
            height: 220px;
            max-width: 100%;
          }

          .hero-action-buttons {
            flex-direction: column;
            align-items: stretch;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
          }

          .hero-cta-btn,
          .hero-secondary-btn {
            width: 100%;
            justify-content: center;
          }

          .hero-trust-bar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            width: 100%;
            padding: 0.85rem;
            box-sizing: border-box;
          }

          .hero-trust-sep {
            display: none;
          }

          .hero-arrow-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
