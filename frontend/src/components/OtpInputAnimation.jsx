import React, { useState, useEffect, useRef } from 'react';

const OtpInputAnimation = ({
  length = 6,
  value = '',
  onChange,
  isVerified = false,
  isValidating = false,
  disabled = false,
}) => {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [animStage, setAnimStage] = useState('idle'); // 'idle' | 'forming' | 'orbiting' | 'collapsing' | 'verified'
  const inputRefs = useRef([]);

  // Sync external value with digit array
  useEffect(() => {
    const valChars = (value || '').split('').slice(0, length);
    const newDigits = Array(length).fill('');
    valChars.forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setDigits(newDigits);
  }, [value, length]);

  // Handle cinematic morphing animation states matching the mp4 video
  useEffect(() => {
    if (isVerified) {
      // 1. Form circle
      setAnimStage('forming');
      
      // 2. Full 360-degree round orbit rotation
      const timer1 = setTimeout(() => {
        setAnimStage('orbiting');
      }, 700);

      // 3. Collapse inward
      const timer2 = setTimeout(() => {
        setAnimStage('collapsing');
      }, 2400);

      // 4. Pop into glowing checkmark badge + concentric ripples
      const timer3 = setTimeout(() => {
        setAnimStage('verified');
      }, 3100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setAnimStage('idle');
    }
  }, [isVerified]);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    const digit = rawVal.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    const fullVal = newDigits.join('');
    if (onChange) onChange(fullVal);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    const newDigits = Array(length).fill('');
    pasteData.split('').forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setDigits(newDigits);

    if (onChange) onChange(newDigits.join(''));

    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    setFocusedIndex(nextIndex);
  };

  // Calculate circular orbit geometry
  const getOrbitalTransform = (index) => {
    if (animStage === 'idle') return 'none';
    const angle = (index / length) * 2 * Math.PI - Math.PI / 2;
    const radius = (animStage === 'forming' || animStage === 'orbiting') ? 56 : 14;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const rotationDeg = (index / length) * 360;

    if (animStage === 'forming') {
      return `translate(${x}px, ${y}px) rotate(${rotationDeg}deg) scale(0.92)`;
    }
    if (animStage === 'orbiting') {
      return `translate(${x}px, ${y}px) rotate(${rotationDeg}deg) scale(0.92)`;
    }
    if (animStage === 'collapsing') {
      return `translate(${x * 0.2}px, ${y * 0.2}px) rotate(${rotationDeg + 180}deg) scale(0.35)`;
    }
    return 'none';
  };

  return (
    <div style={{ position: 'relative', width: '100%', margin: '1.5rem 0', minHeight: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* 1. DIGIT BOXES & ORBITING MERGE STAGES */}
      {animStage !== 'verified' && (
        <div 
          style={{
            position: 'relative',
            width: '100%',
            height: '110px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: animStage === 'orbiting' ? 'orbitSpinRound 1.7s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards' : animStage === 'collapsing' ? 'orbitCollapse 0.7s cubic-bezier(0.55, 0, 1, 0.45) forwards' : 'none'
          }}
        >
          <div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: animStage === 'idle' ? '0.55rem' : '0px',
              position: 'relative',
              width: '100%',
              transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {digits.map((digit, index) => {
              const isFocused = focusedIndex === index && !disabled;
              const orbitalStyle = getOrbitalTransform(index);

              return (
                <div
                  key={index}
                  style={{
                    position: animStage === 'idle' ? 'relative' : 'absolute',
                    transform: orbitalStyle,
                    transition: animStage === 'collapsing' 
                      ? 'all 0.7s cubic-bezier(0.55, 0, 1, 0.45)' 
                      : 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: animStage === 'collapsing' ? 0.2 : 1,
                    zIndex: 10 + index
                  }}
                >
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    disabled={disabled || isVerified}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    onFocus={() => setFocusedIndex(index)}
                    style={{
                      width: length === 6 ? '48px' : '58px',
                      height: '58px',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: isVerified ? '#34d399' : '#ffffff',
                      backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                      borderRadius: '14px',
                      border: isFocused 
                        ? '2px solid #6366f1' 
                        : isVerified
                          ? '2px solid #10b981'
                          : digit 
                            ? '1.5px solid rgba(255, 255, 255, 0.25)' 
                            : '1.5px solid var(--border-color)',
                      boxShadow: isFocused 
                        ? '0 0 16px rgba(99, 102, 241, 0.4), inset 0 0 8px rgba(99, 102, 241, 0.2)' 
                        : isVerified
                          ? '0 0 16px rgba(16, 185, 129, 0.35)'
                          : '0 4px 12px rgba(0, 0, 0, 0.2)',
                      outline: 'none',
                      cursor: disabled ? 'not-allowed' : 'text',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. VERIFIED SUCCESS ANIMATION (Concentric ripple rings + glowing central badge + animated checkmark) */}
      {animStage === 'verified' && (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '1rem 0' }}>
          
          {/* Concentric Ripple Waves */}
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.15rem'
          }}>
            {/* Outer Ripple 1 */}
            <div 
              style={{
                position: 'absolute',
                inset: '-22px',
                borderRadius: '28px',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                animation: 'ripplePulse 2.4s infinite ease-out'
              }}
            />
            {/* Outer Ripple 2 */}
            <div 
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '22px',
                border: '1.5px solid rgba(16, 185, 129, 0.5)',
                animation: 'ripplePulse 2.4s infinite ease-out 0.45s'
              }}
            />

            {/* Glowing Center Badge */}
            <div 
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.4) 100%)',
                border: '2.5px solid #10b981',
                boxShadow: '0 0 32px rgba(16, 185, 129, 0.5), inset 0 0 16px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'badgePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {/* Animated SVG Checkmark */}
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#34d399"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: 0,
                    animation: 'drawCheck 0.7s ease-out forwards'
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Verified Label */}
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.3rem', letterSpacing: '-0.01em' }}>
              Verified successfully
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Your OTP code has been verified.
            </p>
          </div>
        </div>
      )}

      {/* Keyframe Styles */}
      <style>{`
        @keyframes orbitSpinRound {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes orbitCollapse {
          0% {
            transform: rotate(360deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(540deg) scale(0.2);
            opacity: 0;
          }
        }
        @keyframes ripplePulse {
          0% {
            transform: scale(0.88);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.35;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        @keyframes badgePop {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          65% {
            transform: scale(1.18);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes drawCheck {
          0% {
            stroke-dashoffset: 30;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OtpInputAnimation;
