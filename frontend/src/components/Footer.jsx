import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Info, 
  Mail, 
  Phone, 
  ExternalLink, 
  Heart, 
  Instagram, 
  Facebook, 
  Youtube, 
  Linkedin, 
  X,
  ChevronRight,
  Headphones,
  ArrowUpRight
} from 'lucide-react';

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const closeModal = () => setActiveModal(null);

  const modalContent = {
    about: {
      title: 'About ExaShop',
      icon: Info,
      badge: 'Our Mission',
      content: (
        <div className="footer-modal-text">
          <p className="footer-modal-lead">
            Welcome to <strong>ExaShop</strong> — your premier destination for curated fashion, next-gen electronics, and lifestyle essentials.
          </p>
          <div className="footer-modal-grid">
            <div className="footer-modal-card">
              <Sparkles size={18} className="modal-icon-accent" />
              <h5>Curated Selection</h5>
              <p>Every product is handpicked and quality-tested by our industry specialists.</p>
            </div>
            <div className="footer-modal-card">
              <ShieldCheck size={18} className="modal-icon-accent" />
              <h5>100% Authentic</h5>
              <p>Direct manufacturer partnerships ensure authentic items with full brand warranties.</p>
            </div>
            <div className="footer-modal-card">
              <Truck size={18} className="modal-icon-accent" />
              <h5>Fast & Secure Delivery</h5>
              <p>Express tracked shipping with real-time updates and tamper-proof packaging.</p>
            </div>
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Founded with a passion for innovation, ExaShop bridges top global brands and discerning shoppers.
          </p>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      icon: ShieldCheck,
      badge: 'Data Security & Trust',
      content: (
        <div className="footer-modal-text">
          <p className="footer-modal-lead">
            At ExaShop, we prioritize your privacy and safeguard your personal data with enterprise-grade encryption.
          </p>
          <div className="footer-policy-section">
            <h6>1. Information We Collect</h6>
            <p>We only collect information necessary to process orders, manage deliveries, and enhance your shopping experience.</p>
            
            <h6>2. Payment Security</h6>
            <p>We do not store complete payment credentials. All transactions are securely processed via PCI-DSS certified gateways.</p>

            <h6>3. Data Protection</h6>
            <p>Your data is never sold to third parties. Information is only shared with verified logistics partners solely for delivery.</p>
          </div>
        </div>
      )
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      badge: 'Customer Agreement',
      content: (
        <div className="footer-modal-text">
          <p className="footer-modal-lead">
            These terms govern your access and use of the ExaShop platform, purchases, and customer services.
          </p>
          <div className="footer-policy-section">
            <h6>1. Orders & Pricing</h6>
            <p>All orders are subject to availability. Prices and promotional discounts are clearly displayed in real-time.</p>
            
            <h6>2. Shipping & Delivery</h6>
            <p>Standard delivery takes 2–5 business days. Express options are available with live tracking.</p>

            <h6>3. Returns & Refunds</h6>
            <p>We offer a hassle-free 7-day return policy for unused items in original packaging.</p>
          </div>
        </div>
      )
    },
    support: {
      title: 'Customer Service & Support',
      icon: Headphones,
      badge: "We're Here For You",
      content: (
        <div className="footer-modal-text">
          <p className="footer-modal-lead">
            Need help with an order, product enquiry, or delivery status? Our dedicated support team is ready to assist you.
          </p>
          <div className="footer-support-contacts">
            <a href="mailto:support@exashop.com" className="support-contact-item">
              <div className="contact-icon-box">
                <Mail size={18} color="var(--accent-orange)" />
              </div>
              <div>
                <div className="contact-label">Email Support</div>
                <div className="contact-val">support@exashop.com</div>
                <span className="contact-sub">Response within 2 hours</span>
              </div>
            </a>

            <a href="tel:+18003927467" className="support-contact-item">
              <div className="contact-icon-box">
                <Phone size={18} color="var(--accent-emerald)" />
              </div>
              <div>
                <div className="contact-label">Toll-Free Hotline</div>
                <div className="contact-val">+1 (800) EXA-SHOP</div>
                <span className="contact-sub">Mon–Sat, 9AM – 8PM EST</span>
              </div>
            </a>
          </div>

          <div className="support-quick-links">
            <h6>Quick Self-Service:</h6>
            <div className="support-actions">
              <Link to="/orders" onClick={closeModal} className="support-action-btn">
                <Truck size={15} /> Track My Order
              </Link>
              <Link to="/profile" onClick={closeModal} className="support-action-btn">
                <ShieldCheck size={15} /> Manage Addresses & Account
              </Link>
            </div>
          </div>
        </div>
      )
    }
  };

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: '#E1306C' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com', color: '#1877F2' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com', color: '#FF0000' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com', color: '#0A66C2' }
  ];

  return (
    <footer className="exashop-footer">
      <div className="footer-container">
        
        {/* ================= 1. BRAND HEADER SECTION (COMPACT) ================= */}
        <div className="footer-brand-hero">
          <div className="footer-brand-top">
            <div className="footer-logo-badge">
              <ShoppingBag size={18} color="#ffffff" />
            </div>
            <h2 className="footer-brand-title">
              Exa<span className="gradient-text">Shop</span>
            </h2>
          </div>
          <p className="footer-tagline">
            <Sparkles size={12} className="tagline-sparkle" />
            Shop what you love.
            <Sparkles size={12} className="tagline-sparkle" />
          </p>
        </div>

        {/* ================= DIVIDER 1 ================= */}
        <div className="footer-divider" />

        {/* ================= 2. 3-COLUMN STRUCTURE (COMPACT) ================= */}
        <div className="footer-columns-grid">
          
          {/* Column 1: SHOP (Explore) */}
          <div className="footer-column footer-shop-column">
            <div className="column-header">
              <span className="column-pill">Explore</span>
              <h3 className="column-title">SHOP</h3>
            </div>
            <ul className="footer-links-list">
              <li>
                <Link to="/" className="footer-link">
                  <Sparkles size={14} className="link-icon" />
                  <span>Discover</span>
                  <ChevronRight size={12} className="link-arrow" />
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-link">
                  <ShoppingBag size={14} className="link-icon" />
                  <span>Products</span>
                  <ChevronRight size={12} className="link-arrow" />
                </Link>
              </li>
              <li>
                <Link to="/categories" className="footer-link">
                  <Layers size={14} className="link-icon" />
                  <span>Categories</span>
                  <ChevronRight size={12} className="link-arrow" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: CUSTOMER SERVICE */}
          <div className="footer-column footer-service-column">
            <div className="column-header">
              <span className="column-pill highlight">Support</span>
              <h3 className="column-title">CUSTOMER SERVICE</h3>
            </div>
            
            <div className="service-content-card">
              <h4 className="service-headline">We're here to help.</h4>
              <p className="service-desc">
                Need help with your order or delivery?
              </p>
              
              <div className="service-buttons-group">
                <button 
                  type="button" 
                  onClick={() => setActiveModal('support')}
                  className="service-help-btn"
                >
                  <Headphones size={13} />
                  <span>Get Help & FAQs</span>
                </button>
                <Link to="/orders" className="service-orders-link">
                  <Truck size={13} />
                  <span>Track Order</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Column 3: COMPANY (About) */}
          <div className="footer-column footer-company-column">
            <div className="column-header">
              <span className="column-pill">About</span>
              <h3 className="column-title">COMPANY</h3>
            </div>
            <ul className="footer-links-list">
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveModal('about')} 
                  className="footer-link-btn"
                >
                  <Info size={14} className="link-icon" />
                  <span>About Us</span>
                  <ChevronRight size={12} className="link-arrow" />
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveModal('privacy')} 
                  className="footer-link-btn"
                >
                  <ShieldCheck size={14} className="link-icon" />
                  <span>Privacy</span>
                  <ChevronRight size={12} className="link-arrow" />
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setActiveModal('terms')} 
                  className="footer-link-btn"
                >
                  <FileText size={14} className="link-icon" />
                  <span>Terms</span>
                  <ChevronRight size={12} className="link-arrow" />
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= DIVIDER 2 ================= */}
        <div className="footer-divider" />

        {/* ================= 3. SOCIAL MEDIA SECTION ================= */}
        <div className="footer-social-wrapper">
          <span className="social-tag-hint">Connect with our community</span>
          <div className="footer-social-row">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-pill-btn"
                  style={{ '--social-accent': social.color }}
                  aria-label={social.name}
                >
                  <div className="social-icon-wrapper">
                    <Icon size={14} />
                  </div>
                  <span className="social-label">{social.name}</span>
                  <ArrowUpRight size={11} className="social-out-arrow" />
                </a>
              );
            })}
          </div>
        </div>

        {/* ================= DIVIDER 3 ================= */}
        <div className="footer-divider" />

        {/* ================= 4. BOTTOM COPYRIGHT & CREDITS ================= */}
        <div className="footer-bottom-row">
          <div className="footer-copyright">
            <span>© 2026 <strong>ExaShop</strong></span>
          </div>

          <div className="footer-credits">
            <span className="credits-text">Created with</span>
            <Heart size={13} className="footer-heart-beat" />
            <span className="credits-text">by</span>
            <a 
              href="https://creanexatechnologies.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="creator-brand-link"
              title="Visit Creanexa Technologies"
            >
              creanexatechnologies.tech
              <ExternalLink size={11} className="creator-out-icon" />
            </a>
          </div>
        </div>

      </div>

      {/* ================= INTERACTIVE MODAL DIALOG ================= */}
      {activeModal && modalContent[activeModal] && (
        <div className="footer-modal-backdrop" onClick={closeModal}>
          <div className="footer-modal-card-box" onClick={(e) => e.stopPropagation()}>
            <div className="footer-modal-head">
              <div className="footer-modal-title-group">
                {React.createElement(modalContent[activeModal].icon, { size: 20, className: 'modal-head-icon' })}
                <div>
                  <span className="modal-top-badge">{modalContent[activeModal].badge}</span>
                  <h3 className="modal-main-heading">{modalContent[activeModal].title}</h3>
                </div>
              </div>
              <button 
                type="button" 
                onClick={closeModal} 
                className="modal-close-button"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="footer-modal-body">
              {modalContent[activeModal].content}
            </div>

            <div className="footer-modal-foot">
              <button type="button" onClick={closeModal} className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= COMPONENT STYLES (LIGHT WHITE & AMBER THEME) ================= */}
      <style>{`
        .exashop-footer {
          background: #fafaf9;
          border-top: 1px solid var(--border-color);
          position: relative;
          padding: 1.75rem 1.25rem 1.25rem;
          margin-top: auto;
          color: var(--text-primary);
        }

        .exashop-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-orange), transparent);
          opacity: 0.8;
        }

        .footer-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Hero Brand */
        .footer-brand-hero {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .footer-brand-top {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-logo-badge {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
          transition: transform 0.25s ease;
        }

        .footer-logo-badge:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .footer-brand-title {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0;
          color: var(--text-primary);
        }

        .footer-tagline {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.2rem;
        }

        .tagline-sparkle {
          color: var(--accent-orange);
          animation: sparkleGlow 2.5s infinite ease-in-out;
        }

        @keyframes sparkleGlow {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        /* Compact Dividers */
        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(231, 229, 228, 0.8) 25%, rgba(231, 229, 228, 0.8) 75%, transparent 100%);
          margin: 0.85rem 0;
        }

        /* Columns Grid */
        .footer-columns-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr 1fr;
          gap: 1.75rem;
          align-items: start;
        }

        .footer-shop-column {
          order: 1;
        }

        .footer-service-column {
          order: 2;
        }

        .footer-company-column {
          order: 3;
        }

        @media (max-width: 860px) {
          .exashop-footer {
            padding-bottom: 6.5rem; /* Clearance for floating mobile navbar */
          }

          .footer-columns-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem 0.75rem;
          }

          .footer-shop-column {
            order: 1;
            grid-column: 1;
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 0.85rem 0.85rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
          }

          .footer-company-column {
            order: 2;
            grid-column: 2;
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 0.85rem 0.85rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
          }

          .footer-service-column {
            order: 3;
            grid-column: 1 / -1;
            margin-top: 0.15rem;
          }

          .footer-link,
          .footer-link-btn {
            width: 100%;
            padding: 0.3rem 0.4rem;
            margin-left: 0;
            border-radius: var(--radius-sm);
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .footer-columns-grid {
            gap: 0.75rem 0.5rem;
          }

          .footer-shop-column,
          .footer-company-column {
            padding: 0.75rem 0.65rem;
          }

          .column-title {
            font-size: 0.76rem !important;
          }

          .column-pill {
            font-size: 0.58rem !important;
            padding: 0.1rem 0.35rem !important;
          }

          .footer-link,
          .footer-link-btn {
            font-size: 0.76rem !important;
            gap: 0.35rem !important;
            padding: 0.25rem 0.35rem !important;
          }

          .service-headline {
            font-size: 0.86rem !important;
          }

          .service-desc {
            font-size: 0.78rem !important;
          }

          .service-help-btn,
          .service-orders-link {
            font-size: 0.74rem !important;
            padding: 0.35rem 0.6rem !important;
          }
        }

        .footer-column {
          display: flex;
          flex-direction: column;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 0.5rem;
        }

        .column-pill {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.12rem 0.4rem;
          border-radius: var(--radius-full);
          background: #f5f5f4;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .column-pill.highlight {
          background: rgba(245, 158, 11, 0.12);
          color: var(--accent-orange);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .column-title {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--text-primary);
        }

        /* Links */
        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .footer-link,
        .footer-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: var(--text-secondary);
          font-size: 0.84rem;
          font-weight: 500;
          padding: 0.2rem 0.45rem;
          margin-left: -0.45rem;
          border-radius: var(--radius-sm);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: fit-content;
        }

        .footer-link .link-icon,
        .footer-link-btn .link-icon {
          color: var(--accent-primary);
          transition: transform 0.2s ease;
        }

        .footer-link .link-arrow,
        .footer-link-btn .link-arrow {
          opacity: 0;
          transform: translateX(-3px);
          transition: all 0.2s ease;
          color: var(--accent-orange);
        }

        .footer-link:hover,
        .footer-link-btn:hover {
          color: var(--accent-orange);
          background: rgba(245, 158, 11, 0.08);
          transform: translateX(3px);
        }

        .footer-link:hover .link-arrow,
        .footer-link-btn:hover .link-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .footer-link:hover .link-icon,
        .footer-link-btn:hover .link-icon {
          transform: scale(1.1);
          color: var(--accent-orange);
        }

        /* Customer Service Box */
        .service-content-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .service-content-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: var(--accent-gradient);
        }

        .service-headline {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .service-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.35;
        }

        .service-buttons-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.3rem;
        }

        .service-help-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          background: var(--accent-gradient);
          color: #ffffff;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
        }

        .service-help-btn:hover {
          background: linear-gradient(135deg, #d97706, #c2410c);
          transform: translateY(-1px);
        }

        .service-orders-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 500;
          border-radius: var(--radius-sm);
          background: #f5f5f4;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .service-orders-link:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: var(--accent-primary);
          color: var(--accent-orange);
        }

        /* Social Media Section */
        .footer-social-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
        }

        .social-tag-hint {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }

        .footer-social-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
        }

        .social-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.32rem 0.75rem;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          text-decoration: none;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }

        .social-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--social-accent);
          transition: transform 0.2s ease;
        }

        .social-out-arrow {
          opacity: 0.35;
          transition: all 0.2s ease;
        }

        .social-pill-btn:hover {
          background: #ffffff;
          color: var(--text-primary);
          border-color: var(--social-accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 10px rgba(245, 158, 11, 0.2);
        }

        .social-pill-btn:hover .social-icon-wrapper {
          transform: scale(1.15);
        }

        .social-pill-btn:hover .social-out-arrow {
          opacity: 1;
          transform: translate(1px, -1px);
          color: var(--social-accent);
        }

        /* Bottom Row */
        .footer-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        @media (max-width: 580px) {
          .footer-bottom-row {
            flex-direction: column;
            text-align: center;
            justify-content: center;
          }
        }

        .footer-credits {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .credits-text {
          color: var(--text-secondary);
        }

        .footer-heart-beat {
          color: #ea580c;
          fill: #ea580c;
          animation: heartBeatPulse 1.6s infinite ease-in-out;
          display: inline-block;
          vertical-align: middle;
        }

        @keyframes heartBeatPulse {
          0% { transform: scale(1); }
          14% { transform: scale(1.25); }
          28% { transform: scale(1); }
          42% { transform: scale(1.25); }
          70% { transform: scale(1); }
        }

        .creator-brand-link {
          color: var(--text-primary);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.12rem 0.45rem;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .creator-brand-link:hover {
          background: rgba(245, 158, 11, 0.22);
          border-color: var(--accent-orange);
          color: var(--accent-orange);
        }

        .creator-out-icon {
          color: var(--accent-orange);
        }

        /* Modal Dialog Styling */
        .footer-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .footer-modal-card-box {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          max-width: 520px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(245, 158, 11, 0.15);
          display: flex;
          flex-direction: column;
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalSlideUp {
          from { transform: translateY(15px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .footer-modal-head {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          background: linear-gradient(135deg, #fffbeb, #ffedd5);
        }

        .footer-modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-head-icon {
          color: var(--accent-orange);
          background: rgba(245, 158, 11, 0.15);
          padding: 5px;
          box-sizing: content-box;
          border-radius: var(--radius-md);
        }

        .modal-top-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--accent-orange);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 0.1rem;
        }

        .modal-main-heading {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-close-button {
          background: #ffffff;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 30px;
          height: 30px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close-button:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .footer-modal-body {
          padding: 1.25rem;
          overflow-y: auto;
        }

        .footer-modal-lead {
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .footer-modal-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.65rem;
        }

        .footer-modal-card {
          background: #fafaf9;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.9rem;
        }

        .modal-icon-accent {
          color: var(--accent-orange);
          margin-bottom: 0.25rem;
        }

        .footer-modal-card h5 {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .footer-modal-card p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .footer-policy-section h6 {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 0.75rem;
          margin-bottom: 0.2rem;
        }

        .footer-policy-section p {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .footer-support-contacts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 500px) {
          .footer-support-contacts {
            grid-template-columns: 1fr;
          }
        }

        .support-contact-item {
          background: #fafaf9;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .support-contact-item:hover {
          background: #ffffff;
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
          transform: translateY(-2px);
        }

        .contact-icon-box {
          background: #ffffff;
          padding: 6px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .contact-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .contact-val {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .contact-sub {
          font-size: 0.7rem;
          color: var(--accent-emerald);
        }

        .support-quick-links h6 {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .support-actions {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .support-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 0.8rem;
          background: #fafaf9;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.82rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .support-action-btn:hover {
          background: rgba(245, 158, 11, 0.12);
          border-color: var(--accent-primary);
          color: var(--accent-orange);
        }

        .footer-modal-foot {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
          background: #fafaf9;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
