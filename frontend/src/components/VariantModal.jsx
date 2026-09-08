import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, ShoppingCart, Minus, Plus, ExternalLink, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const VariantModal = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Pre-select first available in-stock variant
      const firstInStock = product.variants.find(v => v.stock > 0) || product.variants[0];
      setSelectedColor(firstInStock?.color_name || null);
      setSelectedSize(firstInStock?.size_name || null);
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];

  // Extract unique available colors and sizes
  const colorsList = [];
  const colorNamesSeen = new Set();
  variants.forEach(v => {
    if (v.color_name && !colorNamesSeen.has(v.color_name)) {
      colorNamesSeen.add(v.color_name);
      colorsList.push({ name: v.color_name, code: v.color_code });
    }
  });

  const allSizesList = Array.from(new Set(variants.map(v => v.size_name).filter(Boolean)));

  // Find currently matched variant based on selections
  const currentVariant = variants.find(v => {
    const matchColor = !selectedColor || v.color_name === selectedColor;
    const matchSize = !selectedSize || v.size_name === selectedSize;
    return matchColor && matchSize;
  });

  // Calculate sizes available for the currently chosen color
  const sizesForColor = variants
    .filter(v => !selectedColor || v.color_name === selectedColor)
    .map(v => v.size_name)
    .filter(Boolean);

  const displayPrice = currentVariant ? currentVariant.price : product.price;
  const isVariantInStock = currentVariant ? currentVariant.stock > 0 : product.stock > 0;
  const variantStock = currentVariant ? currentVariant.stock : product.stock;

  const handleAddToCart = async () => {
    if (!currentVariant && product.has_variants) {
      alert('Please select valid options.');
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity, currentVariant?.id);
      onClose();
    } catch (err) {
      console.error('Variant add to cart error:', err);
    } finally {
      setIsAdding(false);
    }
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
      <div 
        className="glass-card" 
        style={{
          maxWidth: '500px',
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          position: 'relative',
          padding: '1.75rem'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f5f5f4',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Close"
        >
          <X size={16} />
        </button>

        {/* Product Header Row */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80'}
            alt={product.name}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-orange)', fontWeight: '700' }}>
              {product.brand_name || product.category_name || 'Select Options'}
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: '1.3' }}>
              {product.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                ₹{parseFloat(displayPrice || 0).toLocaleString('en-IN')}
              </span>
              {product.has_discount && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.price}
                </span>
              )}
              {product.has_discount && (
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  -{product.discount_percentage}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Color Options Selection */}
        {colorsList.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Select Color:</span>
              <span style={{ color: 'var(--accent-orange)', fontWeight: '700' }}>{selectedColor || 'Choose Color'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {colorsList.map((col, idx) => {
                const colorName = typeof col === 'string' ? col : col.name;
                const colorCode = typeof col === 'object' ? col.code : '#f59e0b';
                const isSelected = selectedColor === colorName;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(colorName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.38rem 0.8rem',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
                      color: isSelected ? 'var(--accent-orange)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? '700' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: colorCode || '#f59e0b',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      display: 'inline-block'
                    }} />
                    <span>{colorName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Options Selection */}
        {allSizesList.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Select Size:</span>
              <span style={{ color: 'var(--accent-orange)', fontWeight: '700' }}>{selectedSize || 'Choose Size'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {allSizesList.map((sizeName, idx) => {
                const isSelected = selectedSize === sizeName;
                const isAvailableForColor = sizesForColor.length === 0 || sizesForColor.includes(sizeName);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isAvailableForColor}
                    onClick={() => setSelectedSize(sizeName)}
                    style={{
                      minWidth: '42px',
                      height: '36px',
                      padding: '0 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--accent-primary)' : isAvailableForColor ? '#ffffff' : '#f5f5f4',
                      color: isSelected ? '#ffffff' : isAvailableForColor ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: isAvailableForColor ? 'pointer' : 'not-allowed',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      opacity: isAvailableForColor ? 1 : 0.5,
                      textDecoration: isAvailableForColor ? 'none' : 'line-through',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {sizeName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock & Quantity Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.65rem 0.9rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#fafaf9',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Availability</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: isVariantInStock ? '#059669' : '#dc2626' }}>
              {isVariantInStock ? `In Stock (${variantStock} available)` : 'Out of Stock'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Minus size={14} />
            </button>
            <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= variantStock}
              onClick={() => setQuantity(q => Math.min(variantStock, q + 1))}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: quantity >= variantStock ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', flexDirection: 'column' }}>
          <button
            type="button"
            disabled={!isVariantInStock || isAdding}
            onClick={handleAddToCart}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.92rem', fontWeight: '800' }}
          >
            {isAdding ? (
              'Adding to Cart...'
            ) : !isVariantInStock ? (
              'Selected Option Out of Stock'
            ) : (
              <>
                <ShoppingCart size={16} /> Add to Cart (₹{(parseFloat(displayPrice || 0) * quantity).toLocaleString('en-IN')})
              </>
            )}
          </button>

          <Link
            to={`/products/${product.slug}`}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '0.3rem'
            }}
          >
            <span>View Full Product Specifications</span>
            <ExternalLink size={13} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VariantModal;
