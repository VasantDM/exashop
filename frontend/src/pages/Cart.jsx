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
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Review your selected line items, verify inventory, and proceed to checkout.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={clearCart}
            className="btn btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
          >
            <RotateCcw size={14} /> Clear Cart
          </button>
        </div>
      </div>

      {/* Main Grid: Cart Line Items + Order Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left: Line Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {items.map((item) => {
            const isMaxStock = item.quantity >= item.stock_available;

            return (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                {/* Product Thumbnail */}
                <Link to={`/products/${item.product.slug}`} style={{ flexShrink: 0 }}>
                  <img
                    src={item.product.primary_image}
                    alt={item.product.name}
                    style={{
                      width: '90px',
                      height: '90px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)'
                    }}
                  />
                </Link>

                {/* Details */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                      {item.product.brand_name || 'Brand'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      SKU: {item.product.sku}
                    </span>
                  </div>

                  <Link to={`/products/${item.product.slug}`}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.3rem', lineHeight: '1.3' }}>
                      {item.product.name}
                    </h3>
                  </Link>

                  {/* Selected Color & Size Attributes */}
                  {(item.color_name || item.size) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.2rem 0 0.45rem', flexWrap: 'wrap' }}>
                      {item.color_name && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.76rem',
                          backgroundColor: 'var(--bg-surface)',
                          padding: '0.15rem 0.5rem',
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
                          fontSize: '0.76rem',
                          backgroundColor: 'var(--bg-surface)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)'
                        }}>
                          Size: <strong style={{ color: '#ffffff' }}>{item.size}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-amber)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                      <AlertTriangle size={13} />
                      <span>Max available stock reached ({item.stock_available} units)</span>
                    </div>
                  )}
                </div>

                {/* Quantity Controls & Line Total */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* Quantity Stepper */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '0.4rem 0.75rem', color: '#ffffff', background: 'none' }}
                      title="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '0.4rem 0.6rem', fontWeight: '700', fontSize: '0.85rem', minWidth: '28px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isMaxStock}
                      style={{
                        padding: '0.4rem 0.75rem',
                        color: isMaxStock ? 'var(--text-muted)' : '#ffffff',
                        background: 'none',
                        cursor: isMaxStock ? 'not-allowed' : 'pointer'
                      }}
                      title="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      ₹{parseFloat(item.total_price).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Line Total
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setItemToRemove(item)}
                    style={{
                      background: 'none',
                      color: 'var(--text-muted)',
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--accent-rose)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.88rem', fontWeight: '600' }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
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
                <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Grand Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }} className="gradient-text">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo Code (Try 'AURA10')"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
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
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginBottom: '1.25rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            {/* Trust Guarantee */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Remove from Cart / Move to Wishlist Confirmation Modal */}
      {itemToRemove && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
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
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: '#0f172a',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), var(--shadow-glow)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15))',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800', fontSize: '1.1rem' }}>
                <Heart size={20} color="#ec4899" />
                <span>Remove Item from Cart</span>
              </div>
              <button
                onClick={() => setItemToRemove(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
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
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {itemToRemove.product.name}
                  </h4>
                  {(itemToRemove.color_name || itemToRemove.size) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginBottom: '0.2rem' }}>
                      {[itemToRemove.color_name && `Color: ${itemToRemove.color_name}`, itemToRemove.size && `Size: ${itemToRemove.size}`].filter(Boolean).join(' • ')}
                    </div>
                  )}
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    ₹{itemToRemove.unit_price} × {itemToRemove.quantity} = <strong style={{ color: '#ffffff' }}>₹{parseFloat(itemToRemove.total_price).toFixed(2)}</strong>
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
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)'
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
                      borderColor: 'rgba(244, 63, 94, 0.4)',
                      color: '#fb7185',
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
