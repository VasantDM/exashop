import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpay';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  orderId, 
  amount, 
  customerData,
  paymentIntent,
  onPaymentSuccess, 
  onPaymentFailure 
}) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [paymentState, setPaymentState] = useState('idle'); // 'idle' | 'processing' | 'verifying' | 'success' | 'failed'
  const [statusMessage, setStatusMessage] = useState('');
  
  // Simulator form states
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  if (!isOpen) return null;

  // Real Razorpay SDK Integration Trigger
  const handleLaunchRazorpay = () => {
    if (!paymentIntent || !paymentIntent.razorpay_order_id) {
      alert('Razorpay Order details not loaded. Falling back to sandbox simulation.');
      return;
    }

    setPaymentState('processing');
    setStatusMessage('Connecting to Razorpay checkout...');

    openRazorpayCheckout({
      keyId: paymentIntent.key_id,
      orderId: paymentIntent.razorpay_order_id,
      amount: paymentIntent.amount_in_paise || (parseFloat(amount) * 100),
      currency: paymentIntent.currency || 'INR',
      customerName: customerData?.name || 'Valued Customer',
      customerEmail: customerData?.email || 'customer@example.com',
      customerPhone: customerData?.phone || '9876543210',
      onSuccess: async (response) => {
        setPaymentState('verifying');
        setStatusMessage('Verifying digital signature with backend...');
        try {
          if (onPaymentSuccess) {
            await onPaymentSuccess(response);
          }
          setPaymentState('success');
          setStatusMessage('Payment verified successfully! Redirecting...');
        } catch (err) {
          setPaymentState('failed');
          setStatusMessage(err.message || 'Payment signature verification failed.');
        }
      },
      onDismiss: () => {
        setPaymentState('idle');
      }
    });
  };

  // Sandbox simulation
  const handleProcessPayment = async (method) => {
    setPaymentState('processing');
    setStatusMessage('Authorizing sandbox payment...');

    setTimeout(async () => {
      setPaymentState('verifying');
      setStatusMessage('Updating order settlement records...');

      setTimeout(async () => {
        const mockResponse = {
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_order_id: paymentIntent?.razorpay_order_id || `order_sim_${Date.now()}`,
          razorpay_signature: `sig_mock_${Math.random().toString(36).substring(7)}`,
          method: method
        };

        try {
          if (onPaymentSuccess) {
            await onPaymentSuccess(mockResponse);
          }
          setPaymentState('success');
          setStatusMessage('Payment verified successfully! Redirecting to orders...');
        } catch (err) {
          setPaymentState('failed');
          setStatusMessage(err.message || 'Payment processing encountered an error.');
          if (onPaymentFailure) onPaymentFailure(err);
        }
      }, 1500);
    }, 1200);
  };

  return (
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
        maxWidth: '520px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-orange)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShieldCheck size={14} /> Razorpay Secure Gateway
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              Payable Amount: <span className="gradient-text">₹{amount}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={paymentState === 'processing' || paymentState === 'verifying' || paymentState === 'success'}
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
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

        {/* Processing / Success / Failed States Overlay */}
        {paymentState !== 'idle' ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            {paymentState === 'processing' || paymentState === 'verifying' ? (
              <div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '3px solid rgba(245, 158, 11, 0.2)',
                  borderTopColor: 'var(--accent-orange)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1.5rem'
                }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {paymentState === 'processing' ? 'Processing Transaction...' : 'Verifying Security Signature...'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {statusMessage}
                </p>
              </div>
            ) : paymentState === 'success' ? (
              <div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  border: '2px solid #10b981'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Payment Successful!
                </h3>
                <p style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '600' }}>
                  {statusMessage}
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <AlertCircle size={36} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#dc2626', marginBottom: '0.5rem' }}>
                  Payment Failed
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  {statusMessage}
                </p>
                <button
                  onClick={() => setPaymentState('idle')}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.35rem' }}
                >
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Primary Action: Official Razorpay Checkout Button */}
            <div style={{ padding: '1.25rem 1.5rem 0.5rem' }}>
              <button
                type="button"
                onClick={handleLaunchRazorpay}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  background: 'var(--accent-gradient)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-orange)',
                  cursor: 'pointer',
                  border: 'none',
                  color: '#fff'
                }}
              >
                <Sparkles size={18} />
                <span>Launch Razorpay Checkout</span>
                <ExternalLink size={15} />
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Supports UPI (GPay, PhonePe, Paytm), QR Code, Cards & Netbanking
              </div>
            </div>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '0.85rem 1.5rem 0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.72rem'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or Sandbox Simulator</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: '#fafaf9'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                style={{
                  padding: '0.75rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'upi' ? '2px solid var(--accent-orange)' : '2px solid transparent',
                  color: activeTab === 'upi' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'upi' ? '700' : '500',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Smartphone size={16} /> UPI / QR
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                style={{
                  padding: '0.75rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'card' ? '2px solid var(--accent-orange)' : '2px solid transparent',
                  color: activeTab === 'card' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'card' ? '700' : '500',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <CreditCard size={16} /> Instant Card
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                style={{
                  padding: '0.75rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'netbanking' ? '2px solid var(--accent-orange)' : '2px solid transparent',
                  color: activeTab === 'netbanking' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'netbanking' ? '700' : '500',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Building2 size={16} /> Net Banking
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* UPI Tab */}
              {activeTab === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Quick App Selectors */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                    {[
                      { id: 'gpay', label: 'Google Pay' },
                      { id: 'phonepe', label: 'PhonePe' },
                      { id: 'paytm', label: 'Paytm UPI' },
                    ].map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: selectedUpiApp === app.id ? 'rgba(245, 158, 11, 0.12)' : '#fafaf9',
                          border: selectedUpiApp === app.id ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          color: selectedUpiApp === app.id ? 'var(--accent-orange)' : 'var(--text-secondary)'
                        }}
                      >
                        {app.label}
                      </div>
                    ))}
                  </div>

                  {/* UPI ID Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okaxis"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* QR Option Box */}
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fafaf9',
                    border: '1px dashed var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        padding: '0.45rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-orange)'
                      }}>
                        <QrCode size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Instant QR Code</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scan with any UPI application</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>Active</span>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={() => handleProcessPayment('upi')}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: '800', marginTop: '0.2rem' }}
                  >
                    <Lock size={15} /> Simulate UPI Payment • ₹{amount}
                  </button>
                </div>
              )}

              {/* Card Tab */}
              {activeTab === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.25rem' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.25rem' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.25rem' }}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        placeholder="12/28"
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.25rem' }}>
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardData.cvv}
                        maxLength="4"
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        placeholder="888"
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleProcessPayment('card')}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: '800', marginTop: '0.35rem' }}
                  >
                    <Lock size={15} /> Simulate Card Payment • ₹{amount}
                  </button>
                </div>
              )}

              {/* Netbanking Tab */}
              {activeTab === 'netbanking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                      <div
                        key={b}
                        onClick={() => setSelectedBank(b)}
                        style={{
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: selectedBank === b ? 'rgba(245, 158, 11, 0.12)' : '#fafaf9',
                          border: selectedBank === b ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          color: selectedBank === b ? 'var(--accent-orange)' : 'var(--text-secondary)'
                        }}
                      >
                        {b}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleProcessPayment('netbanking')}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: '800', marginTop: '0.35rem' }}
                  >
                    Proceed with {selectedBank} • ₹{amount}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Security Badges */}
        <div style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#fafaf9',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>PCI-DSS Level 1 & Razorpay Verified</span>
          </div>
          <div>Key ID: {paymentIntent?.key_id || 'rzp_test_key'}</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
