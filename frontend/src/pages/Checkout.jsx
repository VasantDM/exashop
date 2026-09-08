import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  Plus, 
  Lock, 
  AlertCircle,
  MapPin,
  ShoppingBag,
  Sparkles,
  Search,
  CheckCircle2,
  Smartphone,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAddresses, createAddress } from '../services/authService';
import { createOrder } from '../services/orderService';
import { createPaymentIntent } from '../services/paymentService';
import { lookupPincode } from '../utils/pincodeLookup';
import { openRazorpayCheckout } from '../utils/razorpay';
import PaymentModal from '../components/PaymentModal';

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const { items, totalItems, subtotal, discountTotal, finalTotal, refreshCart } = useCart();

  // Address State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState({ loading: false, message: '', success: false });

  const [newAddress, setNewAddress] = useState({
    full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    phone_number: user?.phone_number || '',
    postal_code: '',
    city: '',
    state: '',
    street_address: '',
    apartment_suite: '',
    country: 'United States',
    address_type: 'shipping'
  });

  // Smart Pincode Lookup Handler
  const handlePincodeChange = async (pinValue) => {
    setNewAddress((prev) => ({ ...prev, postal_code: pinValue }));
    const cleanPin = pinValue.trim().replace(/\s+/g, '');

    if (cleanPin.length >= 5) {
      setPincodeStatus({ loading: true, message: 'Detecting City & State...', success: false });
      const result = await lookupPincode(cleanPin);

      if (result.success) {
        setNewAddress((prev) => ({
          ...prev,
          city: result.city || prev.city,
          state: result.state || prev.state,
          country: result.country || prev.country,
        }));
        setPincodeStatus({
          loading: false,
          message: `Auto-filled: ${result.city}, ${result.state}`,
          success: true
        });
      } else {
        setPincodeStatus({
          loading: false,
          message: 'Pincode not auto-detected. You can enter City & State below.',
          success: false
        });
      }
    } else {
      setPincodeStatus({ loading: false, message: '', success: false });
    }
  };

  // Payment & Options State
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'card_instant' | 'cod'
  const [orderNotes, setOrderNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Gateway Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPaymentIntent, setCurrentPaymentIntent] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);

  // Financial calculations
  const numFinalTotal = parseFloat(finalTotal) || 0;
  const numSubtotal = parseFloat(subtotal) || 0;
  const numDiscount = parseFloat(discountTotal) || 0;
  const isFreeShipping = numFinalTotal >= 100;
  const shippingFee = isFreeShipping ? 0 : 15.00;

  let promoDiscount = 0;
  if (promoCode.trim().toUpperCase() === 'AURA10') promoDiscount = numFinalTotal * 0.10;
  if (promoCode.trim().toUpperCase() === 'AURA20') promoDiscount = numFinalTotal * 0.20;

  const grandTotal = Math.max(0, numFinalTotal - promoDiscount + shippingFee).toFixed(2);

  // Sync registered user details into new address defaults
  useEffect(() => {
    if (user) {
      const resolvedName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '';
      const resolvedPhone = user.phone_number || '';
      setNewAddress((prev) => ({
        ...prev,
        full_name: prev.full_name || resolvedName,
        phone_number: prev.phone_number || resolvedPhone,
      }));
    }
  }, [user]);

  // Load saved addresses for authenticated user
  useEffect(() => {
    if (isAuthenticated) {
      const fetchAddrs = async () => {
        try {
          const addrs = await getAddresses();
          setSavedAddresses(Array.isArray(addrs) ? addrs : []);
          const def = addrs.find((a) => a.is_default) || addrs[0];
          if (def) {
            setSelectedAddressId(def.id);
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
          }
        } catch (err) {
          console.warn('Failed to load addresses:', err);
          setUseNewAddress(true);
        }
      };
      fetchAddrs();
    }
  }, [isAuthenticated]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    // Resolve shipping address object
    let shippingAddressData = null;

    if (!useNewAddress && selectedAddressId) {
      const found = savedAddresses.find((a) => a.id === selectedAddressId);
      if (found) {
        shippingAddressData = {
          full_name: found.full_name,
          phone_number: found.phone_number,
          street_address: found.street_address,
          apartment_suite: found.apartment_suite || '',
          city: found.city,
          state: found.state,
          postal_code: found.postal_code,
          country: found.country,
        };
      }
    } else {
      if (!newAddress.full_name || !newAddress.phone_number || !newAddress.street_address || !newAddress.city || !newAddress.postal_code) {
        setErrorMessage('Please fill in all mandatory shipping address fields (Name, Phone, Street, City, Pincode).');
        return;
      }
      shippingAddressData = { ...newAddress };

      if (isAuthenticated) {
        try {
          await createAddress(newAddress);
        } catch (err) {
          console.warn('Address save non-fatal error:', err);
        }
      }
    }

    if (!shippingAddressData) {
      setErrorMessage('Please select or specify a valid shipping delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on backend
      const orderPayload = {
        shipping_address: shippingAddressData,
        billing_address: shippingAddressData,
        payment_method: paymentMethod,
        order_notes: orderNotes,
      };

      const createdOrder = await createOrder(orderPayload);
      setPendingOrder(createdOrder);

      // 2. Handle Payment Flow based on selected method
      if (paymentMethod === 'cod') {
        await refreshCart();
        navigate(`/orders/${createdOrder.id}?status=success&msg=Order+placed+successfully+via+Cash+on+Delivery`);
        return;
      }

      if (paymentMethod === 'razorpay') {
        const intent = await createPaymentIntent({
          order_id: createdOrder.id,
          payment_method: 'razorpay',
          gateway: 'razorpay',
        });

        if (intent.razorpay_order_id && window.Razorpay) {
          try {
            await openRazorpayCheckout({
              orderId: intent.razorpay_order_id,
              amount: intent.amount,
              currency: intent.currency || 'INR',
              customerName: shippingAddressData.full_name || user?.full_name || user?.username,
              customerEmail: user?.email || '',
              customerPhone: shippingAddressData.phone_number || user?.phone_number || '',
            });

            await refreshCart();
            navigate(`/orders/${createdOrder.id}?status=paid`);
            return;
          } catch (rErr) {
            console.warn('Razorpay checkout cancelled or fallback triggered:', rErr);
            setCurrentPaymentIntent(intent);
            setIsPaymentModalOpen(true);
            return;
          }
        } else {
          setCurrentPaymentIntent(intent);
          setIsPaymentModalOpen(true);
          return;
        }
      }

      if (paymentMethod === 'card_instant') {
        const intent = await createPaymentIntent({
          order_id: createdOrder.id,
          payment_method: 'card_instant',
          gateway: 'stripe',
        });
        setCurrentPaymentIntent(intent);
        setIsPaymentModalOpen(true);
        return;
      }

      await refreshCart();
      navigate(`/orders/${createdOrder.id}?status=pending`);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Failed to complete checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setIsPaymentModalOpen(false);
    await refreshCart();
    if (pendingOrder) {
      navigate(`/orders/${pendingOrder.id}?status=paid&payment_id=${paymentResult.transaction_id || ''}`);
    } else {
      navigate('/orders');
    }
  };

  // If user is not authenticated, prompt to sign in or register
  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '560px', margin: '3.5rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--accent-orange)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '1px solid rgba(245, 158, 11, 0.25)'
          }}>
            <Lock size={30} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Account Required for Checkout
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Please login or create an account to securely save your order invoice and shipping destination.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem' }}>
              Sign In to Your Account
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ padding: '0.85rem' }}>
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '560px', margin: '3.5rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Add items to your cart before proceeding to checkout.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-orange)', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Back to Shopping Cart
        </Link>
        <h1 style={{ fontSize: '2.1rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
          Express <span className="gradient-text">Checkout</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Confirm shipping destination, select payment method, and place order.
        </p>
      </div>

      {/* Main Grid: Checkout Steps + Order Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Form: Steps */}
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Step 1: Shipping Destination */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--accent-gradient)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Shipping Destination
              </h3>
            </div>

            {/* Saved Address Selection */}
            {savedAddresses.length > 0 && !useNewAddress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
                        border: isSelected ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          <MapPin size={16} color={isSelected ? 'var(--accent-orange)' : 'var(--text-muted)'} />
                          <span>{addr.full_name}</span>
                          {addr.is_default && <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Default</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                          {addr.street_address}{addr.apartment_suite ? `, ${addr.apartment_suite}` : ''}, {addr.city}, {addr.state} {addr.postal_code}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', paddingLeft: '1.5rem' }}>
                          Phone: {addr.phone_number}
                        </div>
                      </div>
                      {isSelected && <Check size={20} color="var(--accent-orange)" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Toggle New Address */}
            <div style={{ marginBottom: useNewAddress ? '1.25rem' : 0 }}>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !useNewAddress;
                  setUseNewAddress(nextVal);
                  if (nextVal && user) {
                    const resolvedName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '';
                    const resolvedPhone = user.phone_number || '';
                    setNewAddress((prev) => ({
                      ...prev,
                      full_name: prev.full_name || resolvedName,
                      phone_number: prev.phone_number || resolvedPhone,
                    }));
                  }
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
              >
                {useNewAddress ? 'Select from Saved Addresses' : '+ Enter a Different Shipping Address'}
              </button>
            </div>

            {/* New Address Input Form */}
            {useNewAddress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {/* 1. Recipient Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                      placeholder="e.g. Alex Taylor"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone_number}
                      onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                      placeholder="+91 98765 43210 or +1 (555) 000-0000"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* 2. Pincode / Postal Code First (Auto-detects City & State) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Pincode / Postal Code *
                    </label>
                    {pincodeStatus.message && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        color: pincodeStatus.success ? 'var(--accent-emerald)' : 'var(--accent-orange)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {pincodeStatus.success ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {pincodeStatus.message}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={newAddress.postal_code}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Enter 6-digit Pincode (e.g. 560001) or 5-digit ZIP"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      border: pincodeStatus.success ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                {/* 3. City & State */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      City / District * <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Auto-filled)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="City or District"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      State / Province * <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Auto-filled)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="State"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* 4. Street Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    Street Address (Flat/House No., Building, Street/Road, Area) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.street_address}
                    onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                    placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                {/* 5. Apartment & Country */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      Apartment / Landmark / Suite <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={newAddress.apartment_suite}
                      onChange={(e) => setNewAddress({ ...newAddress, apartment_suite: e.target.value })}
                      placeholder="e.g. Near Metro Station / Floor 4"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Country *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      placeholder="India / United States"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--accent-gradient)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Payment Method
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Razorpay Option */}
              <div
                onClick={() => setPaymentMethod('razorpay')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: paymentMethod === 'razorpay' ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
                  border: paymentMethod === 'razorpay' ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Smartphone size={22} color={paymentMethod === 'razorpay' ? 'var(--accent-orange)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Razorpay / UPI</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GPay, PhonePe, QR, Netbanking</div>
                </div>
              </div>

              {/* Credit Card Option */}
              <div
                onClick={() => setPaymentMethod('card_instant')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: paymentMethod === 'card_instant' ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
                  border: paymentMethod === 'card_instant' ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <CreditCard size={22} color={paymentMethod === 'card_instant' ? 'var(--accent-orange)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Cards</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Visa, MasterCard, RuPay</div>
                </div>
              </div>

              {/* COD Option */}
              <div
                onClick={() => setPaymentMethod('cod')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: paymentMethod === 'cod' ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
                  border: paymentMethod === 'cod' ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Truck size={22} color={paymentMethod === 'cod' ? 'var(--accent-orange)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Cash on Delivery</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pay upon receipt</div>
                </div>
              </div>
            </div>

            {/* Gateway Information Banner */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              <span>
                {paymentMethod === 'razorpay' && 'You will be able to complete payment via UPI Apps, QR Code, or Netbanking in the next step.'}
                {paymentMethod === 'card_instant' && 'Cards are processed securely with 256-bit SSL encryption and 3DS OTP validation.'}
                {paymentMethod === 'cod' && 'Cash collection will occur when the courier arrives at your delivery destination.'}
              </span>
            </div>
          </div>

          {/* Step 3: Order Instructions */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--accent-gradient)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Delivery Instructions (Optional)
              </h3>
            </div>
            <textarea
              rows="2"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Please leave package at the front porch or call upon arrival."
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.88rem' }}
            />
          </div>

          {errorMessage && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#dc2626',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: '800' }}
          >
            {isSubmitting ? 'Processing Order...' : `Authorize & Place Order • ₹${grandTotal}`}
          </button>
        </form>

        {/* Right Sidebar: Itemized Order Summary */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Order Review ({totalItems} items)
            </h3>

            {/* Line items preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={item.product.primary_image}
                    alt={item.product.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} × ₹{item.unit_price}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{parseFloat(item.total_price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹{numSubtotal.toFixed(2)}</span>
              </div>

              {numDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <span>Product Savings</span>
                  <span style={{ fontWeight: '700' }}>-₹{numDiscount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Express Tracked Shipping</span>
                <span style={{ color: isFreeShipping ? 'var(--accent-emerald)' : 'var(--text-primary)', fontWeight: '600' }}>
                  {isFreeShipping ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>Grand Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800' }} className="gradient-text">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Trust Assurance */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              <span>30-Day Money-Back Guarantee Included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentIntent={currentPaymentIntent}
        orderNumber={pendingOrder?.order_number}
        amount={grandTotal}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Checkout;
