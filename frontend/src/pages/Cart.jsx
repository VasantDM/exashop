import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Tag, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Heart,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    items, 
    totalItems, 
    subtotal, 
    discountTotal, 
    finalTotal, 
    updateQuantity, 
    removeFromCart, 
    moveToWishlist,
    clearCart, 
    isLoading 
  } = useCart();

  const [itemToRemove, setItemToRemove] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const numFinalTotal = parseFloat(finalTotal) || 0;
  const numSubtotal = parseFloat(subtotal) || 0;
  const numDiscount = parseFloat(discountTotal) || 0;

  // Free shipping threshold: $100
  const isFreeShipping = numFinalTotal >= 100 || numFinalTotal === 0;
  const shippingCost = isFreeShipping ? 0 : 15.00;

  // Coupon discount calculation
  let promoDiscount = 0;
  if (appliedCoupon === 'AURA10') {
    promoDiscount = numFinalTotal * 0.10;
  } else if (appliedCoupon === 'AURA20') {
    promoDiscount = numFinalTotal * 0.20;
  }

  const grandTotal = Math.max(0, numFinalTotal - promoDiscount + shippingCost).toFixed(2);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'AURA10') {
      setAppliedCoupon('AURA10');
    } else if (code === 'AURA20') {
      setAppliedCoupon('AURA20');
    } else {
      setCouponError("Invalid coupon code. Try 'AURA10' or 'AURA20'.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '580px', margin: '3.5rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--accent-primary)',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <ShoppingBag size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>
            Sign In to Access Your Cart
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Please log in to your account to view your cart items, apply discounts, and complete your order.
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

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '580px', margin: '3.5rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--accent-primary)',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <ShoppingBag size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>
            Your Shopping Cart is Empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Looks like you haven't added any products to your cart yet. Explore our top electronic items and audio gear.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      {/* Header */}
      <div className="cart-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="cart-main-title">
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.3rem' }}>
            Review your selected line items, verify inventory, and proceed to checkout.
          </p>
        </div>

        <div>
          <button
            onClick={clearCart}
            className="btn btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <RotateCcw size={14} /> Clear Cart
          </button>
        </div>
      </div>

      {/* Main Grid: Cart Line Items + Order Summary */}
      <div className="cart-main-grid">
        {/* Left: Line Items List */}
        <div className="cart-items-column">
          {items.map((item) => {
            const isMaxStock = item.quantity >= item.stock_available;

            return (
              <div
                key={item.id}
                className="glass-card cart-item-card"
              >
                {/* Product Thumbnail */}
                <Link to={`/products/${item.product.slug}`} className="cart-item-thumb-link">
                  <img
                    src={item.product.primary_image}
                    alt={item.product.name}
                    className="cart-item-thumb-img"
                  />
                </Link>

                {/* Details */}
                <div className="cart-item-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                      {item.product.brand_name || 'Brand'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      SKU: {item.product.sku}
                    </span>
                  </div>

                  <Link to={`/products/${item.product.slug}`}>
                    <h3 className="cart-item-name">
                      {item.product.name}
                    </h3>
                  </Link>

                  {/* Selected Color & Size Attributes */}
                  {(item.color_name || item.size) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.2rem 0 0.45rem', flexWrap: 'wrap' }}>
                      {item.color_name && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.74rem',
                          backgroundColor: 'var(--bg-surface)',
                          padding: '0.12rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)'
                        }}>
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: item.color_code || '#4f46e5',
                            display: 'inline-block'
                          }} />
                          Color: <strong>{item.color_name}</strong>
                        </span>
                      )}
                      {item.size && (
                        <span style={{
                          fontSize: '0.74rem',
                          backgroundColor: 'var(--bg-surface)',
                          padding: '0.12rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)'
                        }}>
                          Size: <strong style={{ color: 'var(--text-primary)' }}>{item.size}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      ₹{item.unit_price}
                    </span>
                    {item.has_discount && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{item.original_unit_price}
                      </span>
                    )}
                  </div>

                  {/* Stock Limit Notice */}
                  {isMaxStock && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-amber)', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                      <AlertTriangle size={13} />
                      <span>Max available stock reached ({item.stock_available} units)</span>
                    </div>
                  )}
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="cart-item-actions-row">
                  {/* Quantity Stepper */}
                  <div className="cart-stepper-wrap">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="cart-stepper-btn"
                      title="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="cart-stepper-val">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isMaxStock}
                      className="cart-stepper-btn"
                      style={{
                        color: isMaxStock ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: isMaxStock ? 'not-allowed' : 'pointer'
                      }}
                      title="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="cart-item-total-col">
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      ₹{parseFloat(item.total_price).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Line Total
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setItemToRemove(item)}
                    className="cart-item-remove-btn"
                    title="Remove item"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-orange)', fontSize: '0.88rem', fontWeight: '700' }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="cart-summary-wrapper">
          <div className="glass-card" style={{ padding: '1.75rem 1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Order Summary
            </h3>

            {/* Price Calculations Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal ({totalItems} items)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹{numSubtotal.toFixed(2)}</span>
              </div>

              {numDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <span>Product Savings</span>
                  <span style={{ fontWeight: '700' }}>-₹{numDiscount.toFixed(2)}</span>
                </div>
              )}

              {appliedCoupon && promoDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <span>Promo Code ({appliedCoupon})</span>
                  <span style={{ fontWeight: '700' }}>-₹{promoDiscount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Shipping</span>
                <span style={{ color: isFreeShipping ? 'var(--accent-emerald)' : 'var(--text-primary)', fontWeight: '600' }}>
                  {isFreeShipping ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                </span>
              </div>

              {isFreeShipping ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Truck size={13} /> You unlocked Free Express Shipping!
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Add ₹{(100 - numFinalTotal).toFixed(2)} more to qualify for Free Shipping.
                </div>
              )}

              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>Grand Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-orange)' }} className="gradient-text">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo Code (Try 'AURA10')"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Tag size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <button type="submit" className="btn btn-outline" style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}>
                Apply
              </button>
            </form>

            {couponError && (
              <div style={{ color: 'var(--accent-rose)', fontSize: '0.78rem', marginBottom: '1rem', marginTop: '-0.75rem' }}>
                {couponError}
              </div>
            )}

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: '700' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            {/* Trust Guarantee */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center' }}>
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-page-wrapper {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .cart-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .cart-main-title {
          font-size: 2.1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0;
          color: var(--text-primary);
        }

        .cart-main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }

        .cart-items-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 0;
        }

        .cart-item-card {
          padding: 1.25rem;
          display: flex;
          gap: 1.25rem;
          align-items: center;
          position: relative;
          box-sizing: border-box;
          width: 100%;
        }

        .cart-item-thumb-link {
          flex-shrink: 0;
        }

        .cart-item-thumb-img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: var(--radius-md);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
        }

        .cart-item-details {
          flex: 1;
          min-width: 0;
        }

        .cart-item-name {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          line-height: 1.3;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cart-item-actions-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-shrink: 0;
        }

        .cart-stepper-wrap {
          display: flex;
          align-items: center;
          background-color: #fafaf9;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .cart-stepper-btn {
          padding: 0.4rem 0.7rem;
          color: var(--text-primary);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-stepper-val {
          padding: 0.4rem 0.5rem;
          font-weight: 700;
          font-size: 0.85rem;
          min-width: 26px;
          text-align: center;
          color: var(--text-primary);
        }

        .cart-item-total-col {
          text-align: right;
          min-width: 75px;
        }

        .cart-item-remove-btn {
          background: none;
          color: var(--text-muted);
          padding: 0.4rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .cart-item-remove-btn:hover {
          color: var(--accent-rose);
        }

        .cart-summary-wrapper {
          position: sticky;
          top: 90px;
          min-width: 0;
        }

        /* Mobile App View Rules */
        @media (max-width: 860px) {
          .cart-main-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .cart-summary-wrapper {
            position: static;
          }

          .cart-main-title {
            font-size: 1.6rem;
          }

          .cart-item-card {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 0.85rem;
            padding: 1rem;
          }

          .cart-item-thumb-img {
            width: 80px;
            height: 80px;
          }

          .cart-item-actions-row {
            grid-column: span 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid var(--border-color);
            padding-top: 0.75rem;
            margin-top: 0.35rem;
            gap: 0.75rem;
          }
        }
      `}</style>

      {/* Remove from Cart / Move to Wishlist Confirmation Modal */}
      {itemToRemove && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '480px',
            width: '100%',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                <Heart size={20} color="var(--accent-orange)" />
                <span>Remove Item from Cart</span>
              </div>
              <button
                onClick={() => setItemToRemove(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              {/* Product Preview Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem'
              }}>
                <img
                  src={itemToRemove.product.primary_image}
                  alt={itemToRemove.product.name}
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                    {itemToRemove.product.name}
                  </h4>
                  {(itemToRemove.color_name || itemToRemove.size) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', marginBottom: '0.2rem', fontWeight: '600' }}>
                      {[itemToRemove.color_name && `Color: ${itemToRemove.color_name}`, itemToRemove.size && `Size: ${itemToRemove.size}`].filter(Boolean).join(' • ')}
                    </div>
                  )}
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    ₹{itemToRemove.unit_price} × {itemToRemove.quantity} = <strong style={{ color: 'var(--text-primary)' }}>₹{parseFloat(itemToRemove.total_price).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
                Would you like to move this product to your <strong>Wishlist</strong> so you can easily purchase it later, or remove it directly from your cart?
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={async () => {
                    await moveToWishlist(itemToRemove.id, itemToRemove.product);
                    setItemToRemove(null);
                  }}
                  className="btn btn-primary"
                  style={{
                    padding: '0.8rem',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'var(--accent-gradient)'
                  }}
                >
                  <Heart size={16} fill="#ffffff" /> Yes, Move to Wishlist & Remove
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    onClick={async () => {
                      await removeFromCart(itemToRemove.id);
                      setItemToRemove(null);
                    }}
                    className="btn btn-outline"
                    style={{
                      padding: '0.75rem',
                      fontSize: '0.85rem',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Trash2 size={15} /> Remove Directly
                  </button>

                  <button
                    onClick={() => setItemToRemove(null)}
                    className="btn btn-outline"
                    style={{ padding: '0.75rem', fontSize: '0.85rem' }}
                  >
                    Keep in Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
