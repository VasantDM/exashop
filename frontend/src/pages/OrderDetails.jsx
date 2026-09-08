import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  MapPin, 
  CreditCard, 
  Printer, 
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Smartphone,
  Zap,
  Lock
} from 'lucide-react';
import { getOrderDetails, cancelOrder } from '../services/orderService';
import { getOrderPayments, createPaymentIntent } from '../services/paymentService';
import { openRazorpayCheckout } from '../utils/razorpay';
import PaymentModal from '../components/PaymentModal';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', desc: 'Order confirmed and registered.' },
  { key: 'processing', label: 'Processing', desc: 'Packed and prepared for dispatch.' },
  { key: 'shipped', label: 'Shipped', desc: 'In transit with delivery courier.' },
  { key: 'delivered', label: 'Delivered', desc: 'Successfully delivered to recipient.' },
];

const getStepIndex = (status) => {
  switch (status) {
    case 'pending': return 0;
    case 'processing': return 1;
    case 'shipped': return 2;
    case 'delivered': return 3;
    default: return -1;
  }
};

const OrderDetails = () => {
  const { id: orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  // Payment Retry Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPaymentIntent, setCurrentPaymentIntent] = useState(null);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);

  const fetchOrderAndPayments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getOrderDetails(orderNumber);
      setOrder(data);

      try {
        const payData = await getOrderPayments(orderNumber);
        setPayments(Array.isArray(payData) ? payData : []);
      } catch (pErr) {
        console.warn('Could not load payment records:', pErr);
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError('Order not found or access unauthorized.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndPayments();
  }, [orderNumber]);

  const handleOpenPaymentModal = async (gateway = 'razorpay') => {
    setIsInitiatingPayment(true);
    try {
      const intent = await createPaymentIntent({
        orderNumber: order.order_number,
        gateway
      });
      setCurrentPaymentIntent(intent);

      if (gateway === 'razorpay') {
        await openRazorpayCheckout({
          paymentIntent: intent,
          onSuccess: async () => {
            setIsPaymentModalOpen(false);
            await fetchOrderAndPayments();
          },
          onError: (err) => {
            console.error('Razorpay popup error:', err);
            setIsPaymentModalOpen(true);
          },
          onDismiss: () => {
            setIsPaymentModalOpen(true);
          }
        });
      } else {
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      alert(err.data?.detail || 'Failed to initialize payment gateway.');
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    await fetchOrderAndPayments();
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelOrder(orderNumber);
      setOrder(res.order);
      setCancelModal(false);
    } catch (err) {
      alert(err.data?.detail || 'Could not cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading order invoice & tracking timeline...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="glass-card" style={{ maxWidth: '560px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem' }}>Order Not Located</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          {error || 'Unable to load invoice details for this order.'}
        </p>
        <Link to="/orders" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div>
      {/* Breadcrumb & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={15} /> Orders
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{order.order_number}</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={15} /> Print Invoice
          </button>

          {order.can_cancel && (
            <button
              onClick={() => setCancelModal(true)}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Order #{order.order_number}
              </h1>
              <span className={`badge ${isCancelled ? 'badge-danger' : order.status === 'delivered' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.8rem', padding: '0.2rem 0.65rem' }}>
                {order.status_display}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Calendar size={14} />
              <span>Placed on {order.formatted_date}</span>
              {order.tracking_number && (
                <>
                  <span>•</span>
                  <span>Tracking: <strong style={{ color: 'var(--text-primary)' }}>{order.tracking_number}</strong></span>
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }} className="gradient-text">
              ₹{order.grand_total}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Payment: {order.payment_status_display} ({order.payment_method_display})
            </div>
          </div>
        </div>

        {/* Visual Progress Stepper (if not cancelled) */}
        {!isCancelled ? (
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', position: 'relative' }}>
              {statusSteps.map((step, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <div key={step.key} style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      margin: '0 auto 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isPassed ? 'var(--accent-orange)' : '#ffffff',
                      border: isPassed ? '2px solid var(--accent-orange)' : '2px solid var(--border-color)',
                      color: isPassed ? '#ffffff' : 'var(--text-muted)',
                      boxShadow: isCurrent ? '0 2px 10px rgba(234, 88, 12, 0.35)' : 'none',
                      transition: 'all var(--transition-fast)'
                    }}>
                      {isPassed ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: isPassed ? '700' : '500', color: isPassed ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fb7185',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <XCircle size={20} />
            <span>This order was cancelled. Any deducted product inventory was refunded back to stock.</span>
          </div>
        )}
      </div>

      {/* Main Breakdown Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Items List & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Itemized Products Card */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Itemized Line Items ({order.total_items})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '1rem'
                  }}
                >
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-md)', backgroundColor: '#fafaf9', border: '1px solid var(--border-color)' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                      SKU: {item.product_sku}
                    </div>
                    {item.product_slug ? (
                      <Link to={`/products/${item.product_slug}`} style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {item.product_name}
                      </Link>
                    ) : (
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {item.product_name}
                      </span>
                    )}

                    {(item.color_name || item.size) && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', marginTop: '0.15rem', fontWeight: '600' }}>
                        {[item.color_name && `Color: ${item.color_name}`, item.size && `Size: ${item.size}`].filter(Boolean).join(' • ')}
                      </div>
                    )}

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      ₹{item.unit_price} × {item.quantity} units
                    </div>
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{parseFloat(item.total_price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Events Card */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Order Lifecycle Activity Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.timeline.map((event, idx) => (
                <div key={event.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--accent-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <Clock size={15} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {event.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {event.formatted_time} • Status: <strong style={{ color: 'var(--text-secondary)' }}>{event.status.toUpperCase()}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Totals & Shipping Destination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Invoice Summary */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Financial Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>₹{order.subtotal}</span>
              </div>

              {parseFloat(order.discount_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <span>Discounts & Savings</span>
                  <span style={{ fontWeight: '700' }}>-₹{order.discount_amount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping Fee</span>
                <span style={{ color: parseFloat(order.shipping_fee) === 0 ? 'var(--accent-emerald)' : 'var(--text-primary)', fontWeight: '600' }}>
                  {parseFloat(order.shipping_fee) === 0 ? 'FREE' : `₹${order.shipping_fee}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>Grand Total</span>
                <span style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--accent-orange)' }} className="gradient-text">
                  ₹{order.grand_total}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Gateway Transaction Card */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                <CreditCard size={18} color="var(--accent-orange)" />
                <span>Payment & Invoicing</span>
              </div>
              <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : order.payment_status === 'failed' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.75rem' }}>
                {order.payment_status_display}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Payment Method:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{order.payment_method_display}</strong>
              </div>

              {payments.length > 0 && payments[0].gateway_payment_id && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Gateway Ref:</span>
                  <code style={{ fontSize: '0.78rem', color: 'var(--accent-orange)' }}>{payments[0].gateway_payment_id}</code>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Security:</span>
                <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                  <ShieldCheck size={13} /> 256-bit Encrypted
                </span>
              </div>
            </div>

            {/* Pay Now Button if Unpaid & Active */}
            {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  onClick={() => handleOpenPaymentModal('razorpay')}
                  disabled={isInitiatingPayment}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: '700' }}
                >
                  <Zap size={15} /> {isInitiatingPayment ? 'Connecting Gateway...' : `Complete Payment • ₹${order.grand_total}`}
                </button>
              </div>
            )}
          </div>

          {/* Shipping Address Snapshot Card */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              <MapPin size={18} color="var(--accent-orange)" />
              <span>Delivery Destination</span>
            </div>

            {order.shipping_address ? (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                  {order.shipping_address.full_name}
                </div>
                <div>{order.shipping_address.street_address}{order.shipping_address.apartment_suite ? `, ${order.shipping_address.apartment_suite}` : ''}</div>
                <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</div>
                <div>{order.shipping_address.country || 'India'}</div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Phone: {order.shipping_address.phone_number}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No delivery address recorded.</p>
            )}

            {order.notes && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '1rem', fontSize: '0.82rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Instructions:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {cancelModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={42} color="var(--accent-rose)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem' }}>Cancel Order #{order.order_number}?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
              Are you sure you wish to cancel this order? All reserved inventory units will be automatically refunded back to product stock.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCancelModal(false)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.65rem' }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.65rem', backgroundColor: 'var(--accent-rose)' }}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Retry Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentIntent={currentPaymentIntent}
        orderNumber={order?.order_number}
        amount={order?.grand_total}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default OrderDetails;
