import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { sendPasswordResetOTP, validatePasswordResetOTP, verifyPasswordResetOTP } from '../services/authService';
import OtpInputAnimation from '../components/OtpInputAnimation';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Multi-step State (1 = Request OTP, 2 = Enter & Verify OTP + Set Password, 3 = Success)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isValidatingOtp, setIsValidatingOtp] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-validate OTP when exactly 6 digits are typed
  useEffect(() => {
    const checkOtp = async () => {
      if (otp.length === 6 && !isOtpVerified && !isValidatingOtp) {
        setIsValidatingOtp(true);
        setErrorMessage('');
        try {
          const res = await validatePasswordResetOTP({ email: email.trim(), otp: otp.trim() });
          setIsOtpVerified(true);
          setSuccessMessage(res.message || 'OTP code verified successfully!');
        } catch (err) {
          setIsOtpVerified(false);
          const errorMsg = err.data?.error || err.data?.detail || err.message || 'Invalid OTP code. Please check your email.';
          setErrorMessage(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } finally {
          setIsValidatingOtp(false);
        }
      } else if (otp.length < 6 && isOtpVerified) {
        setIsOtpVerified(false);
      }
    };

    checkOtp();
  }, [otp, email]);

  // Step 1: Send OTP to Email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsOtpVerified(false);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendPasswordResetOTP(email.trim());
      setSuccessMessage(res.message || 'OTP has been sent to your email!');
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      const errorMsg = err.data?.email || err.data?.error || err.data?.detail || err.message || 'Could not send OTP. Please verify your email.';
      setErrorMessage(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMessage('');
    setIsOtpVerified(false);
    setOtp('');
    setIsLoading(true);
    try {
      const res = await sendPasswordResetOTP(email.trim());
      setSuccessMessage(res.message || 'New OTP has been sent to your email!');
      setResendCooldown(60);
    } catch (err) {
      const errorMsg = err.data?.email || err.data?.error || err.data?.detail || err.message || 'Failed to resend OTP.';
      setErrorMessage(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Manual Verify OTP Button Click
  const handleManualVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    setIsValidatingOtp(true);
    setErrorMessage('');
    try {
      const res = await validatePasswordResetOTP({ email: email.trim(), otp: otp.trim() });
      setIsOtpVerified(true);
      setSuccessMessage('OTP code verified successfully! Now enter your new password.');
    } catch (err) {
      setIsOtpVerified(false);
      const errorMsg = err.data?.error || err.data?.detail || err.message || 'Invalid or expired OTP code.';
      setErrorMessage(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setIsValidatingOtp(false);
    }
  };

  // Step 2: Complete Password Reset
  const handleCompleteReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage('Please enter the valid 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyPasswordResetOTP({
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccessMessage(res.message || 'Password reset successfully!');
      setStep(3);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      let errorMsg = 'Failed to reset password.';
      if (err.data) {
        if (err.data.otp) errorMsg = Array.isArray(err.data.otp) ? err.data.otp[0] : err.data.otp;
        else if (err.data.confirm_password) errorMsg = Array.isArray(err.data.confirm_password) ? err.data.confirm_password[0] : err.data.confirm_password;
        else if (err.data.new_password) errorMsg = Array.isArray(err.data.new_password) ? err.data.new_password[0] : err.data.new_password;
        else if (err.data.detail) errorMsg = err.data.detail;
        else if (err.data.error) errorMsg = err.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '3rem auto',
      padding: '0 1rem'
    }}>
      <div 
        className="glass-card" 
        style={{
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Step 1: Request OTP */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: 'var(--shadow-glow)'
              }}>
                <KeyRound size={28} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Forgot Password?
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                Enter your registered email address and we'll send a 6-digit verification OTP code to your inbox.
              </p>
            </div>

            {errorMessage && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Registered Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.4rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ padding: '0.85rem', fontSize: '0.95rem', fontWeight: '800', marginTop: '0.5rem' }}
              >
                {isLoading ? 'Sending Verification Code...' : 'Send Verification OTP'}
              </button>
            </form>

            <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
              <Link 
                to="/login" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.85rem', 
                  fontWeight: '600' 
                }}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Verify OTP & Reset Password */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: isOtpVerified ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.15)',
                color: isOtpVerified ? 'var(--accent-emerald)' : 'var(--accent-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: isOtpVerified ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: isOtpVerified ? '0 0 25px rgba(16, 185, 129, 0.3)' : 'var(--shadow-glow)',
                transition: 'all 0.3s ease'
              }}>
                {isOtpVerified ? <CheckCircle2 size={28} /> : <ShieldCheck size={28} />}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
                Enter OTP Code
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--accent-orange)' }}>{email}</strong>
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success / OTP Verified Banner */}
            {isOtpVerified ? (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#059669',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: '700',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>✓ OTP Code Verified! Set your new password below:</span>
              </div>
            ) : successMessage && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--accent-orange)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Mail size={15} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleCompleteReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Animated Morphing OTP Digit Inputs */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Enter 6-Digit Code
                    {isOtpVerified && <span style={{ color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: '800' }}>(Verified ✓)</span>}
                  </label>
                  {!isOtpVerified && (
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleResendOTP}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-orange)',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: resendCooldown > 0 ? 'default' : 'pointer'
                      }}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  )}
                </div>
                
                <OtpInputAnimation
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  isVerified={isOtpVerified}
                  isValidating={isValidatingOtp}
                  disabled={isLoading}
                />

                {!isOtpVerified && otp.length === 6 && (
                  <button
                    type="button"
                    onClick={handleManualVerifyOtp}
                    disabled={isValidatingOtp}
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: '0.25rem', padding: '0.55rem', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    {isValidatingOtp ? 'Verifying Code...' : 'Verify OTP Code'}
                  </button>
                )}
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.4rem 0.75rem 2.4rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.4rem 0.75rem 2.4rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ padding: '0.85rem', fontSize: '0.95rem', fontWeight: '800', marginTop: '0.5rem' }}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password & Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setIsOtpVerified(false);
                  setOtp('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                ← Change Email
              </button>
              <Link to="/login" style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: '700' }}>
                Cancel & Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.18)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.35)'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Password Reset Complete!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Your password has been successfully updated. Redirecting you to the sign in page...
            </p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
              Sign In Now <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
