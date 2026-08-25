import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  ArrowRight,
  Sparkles,
  X,
  Clock,
  RefreshCw
} from 'lucide-react';
import { verifyPayment } from '../services/paymentService';

const PaymentModal = ({
  isOpen,
  onClose,
  paymentIntent,
  orderNumber,
  amount,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  
  const [cardData, setCardData] = useState({
    number: '4242 •••• •••• 4242',
    name: paymentIntent?.customer?.name || 'Alex Taylor',
    expiry: '12/28',
    cvv: '888'
  });

  const [paymentState, setPaymentState] = useState('idle'); // 'idle' | 'processing' | 'verifying' | 'success' | 'failed'
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleProcessPayment = async (method = activeTab) => {
    setPaymentState('processing');
    setStatusMessage('Connecting to Secure Gateway Network...');

    try {
      // 1. Simulate gateway processing latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setPaymentState('verifying');
      setStatusMessage('Verifying Cryptographic Transaction Token...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockPaymentId = `pay_${method}_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
      const mockSignature = 'test_valid_signature';

      // 2. Call backend verification endpoint
      const result = await verifyPayment({
        orderNumber: orderNumber || paymentIntent?.order_number,
        gateway: method === 'card' ? 'card_instant' : 'razorpay',
        gatewayOrderId: paymentIntent?.gateway_order_id || `order_rzp_${Date.now()}`,
        gatewayPaymentId: mockPaymentId,
        gatewaySignature: mockSignature,
      });

      setPaymentState('success');
      setStatusMessage(`Payment of ₹${amount} Confirmed & Captured!`);

      // 3. Delay slightly to show celebration, then trigger callback
      setTimeout(() => {
        if (onSuccess) onSuccess(result);
      }, 1400);

    } catch (err) {
      console.error('Payment failed:', err);
      setPaymentState('failed');
      setStatusMessage(err.data?.detail || err.message || 'Payment authentication failed. Please retry.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
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
        border: '1px solid rgba(255, 255, 255, 0.15)',
        backgroundColor: '#0f172a',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), var(--shadow-glow)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShieldCheck size={14} /> AuraStore Secure Gateway
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginTop: '0.15rem' }}>
              Payable Amount: <span className="gradient-text">₹{amount}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={paymentState === 'processing' || paymentState === 'verifying' || paymentState === 'success'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
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

        {/* Processing / Success / Failed States Overlay */}
        {paymentState !== 'idle' ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            {paymentState === 'processing' || paymentState === 'verifying' ? (
              <div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '3px solid rgba(99, 102, 241, 0.2)',
                  borderTopColor: 'var(--accent-primary)',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 1.5rem'
                }}></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                  Processing Transaction...
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {statusMessage}
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Lock size={12} /> 256-bit End-to-End Encryption
                </div>
              </div>
            ) : paymentState === 'success' ? (
              <div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                  Payment Verified!
                </h3>
                <p style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '600' }}>
                  {statusMessage}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Redirecting to your order invoice & tracking...
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(244, 63, 94, 0.2)',
                  color: 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <AlertCircle size={36} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-rose)', marginBottom: '0.5rem' }}>
                  Payment Failed
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
                  {statusMessage}
                </p>
                <button
                  onClick={() => setPaymentState('idle')}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Payment Method Selector Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                style={{
                  padding: '0.85rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'upi' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: activeTab === 'upi' ? '#ffffff' : 'var(--text-muted)',
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
                  padding: '0.85rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'card' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: activeTab === 'card' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: activeTab === 'card' ? '700' : '500',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <CreditCard size={16} /> Cards
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                style={{
                  padding: '0.85rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'netbanking' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: activeTab === 'netbanking' ? '#ffffff' : 'var(--text-muted)',
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
            <div style={{ padding: '1.5rem' }}>
              {/* UPI Tab */}
              {activeTab === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Quick App Selectors */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {[
                      { id: 'gpay', label: 'Google Pay', color: '#4285F4' },
                      { id: 'phonepe', label: 'PhonePe', color: '#5f259f' },
                      { id: 'paytm', label: 'Paytm UPI', color: '#00BAF2' },
                    ].map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id)}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: selectedUpiApp === app.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                          border: selectedUpiApp === app.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          color: selectedUpiApp === app.id ? '#ffffff' : 'var(--text-secondary)'
                        }}
                      >
                        {app.label}
                      </div>
                    ))}
                  </div>

                  {/* UPI ID Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okaxis"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Dynamic QR Code Simulation */}
                  <div style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px dashed var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000'
                    }}>
                      <QrCode size={48} />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div>Scan with any UPI App (GPay, PhonePe, Paytm, CRED) to complete payment.</div>
                      <div style={{ color: 'var(--accent-emerald)', marginTop: '0.2rem', fontWeight: '600' }}>
                        ✓ Instant Auto-Capture
                      </div>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={() => handleProcessPayment('upi')}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '800' }}
                  >
                    <Sparkles size={16} /> Authorize & Pay ₹{amount}
                  </button>
                </div>
              )}

              {/* Cards Tab */}
              {activeTab === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        placeholder="12/28"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          color: '#fff',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
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
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          color: '#fff',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={() => handleProcessPayment('card')}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '800', marginTop: '0.5rem' }}
                  >
                    <Lock size={16} /> Pay ₹{amount} Securely
                  </button>
                </div>
              )}

              {/* Netbanking Tab */}
              {activeTab === 'netbanking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                      <div
                        key={b}
                        onClick={() => setSelectedBank(b)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: selectedBank === b ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                          border: selectedBank === b ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          color: selectedBank === b ? '#ffffff' : 'var(--text-secondary)'
                        }}
                      >
                        {b}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleProcessPayment('netbanking')}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: '800', marginTop: '0.5rem' }}
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
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>PCI-DSS Level 1 Compliant</span>
          </div>
          <div>Powered by Razorpay & Stripe</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
