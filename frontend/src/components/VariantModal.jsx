import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  ShoppingCart, 
  Check, 
  Layers, 
  Star, 
  ExternalLink,
  Plus,
  Minus,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const VariantModal = ({
  isOpen,
  onClose,
  product
}) => {
  const { addToCart, isInCart } = useCart();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Initialize selected color and size when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      const variants = product.variants || [];
      const firstInStock = variants.find(v => v.stock > 0) || variants[0];

      if (firstInStock) {
        setSelectedColor(firstInStock.color_name || '');
        setSelectedSize(firstInStock.size || '');
      } else {
        if (product.available_colors && product.available_colors.length > 0) {
          setSelectedColor(product.available_colors[0].name || product.available_colors[0]);
        }
        if (product.available_sizes && product.available_sizes.length > 0) {
          setSelectedSize(product.available_sizes[0]);
        }
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];

  // Available colors list
  const colorsList = product.available_colors && product.available_colors.length > 0
    ? product.available_colors
    : Array.from(new Set(variants.map(v => v.color_name).filter(Boolean))).map(name => {
        const v = variants.find(item => item.color_name === name);
        return { name, code: v?.color_code || '#6366f1' };
      });

  // Available sizes for currently selected color
  const sizesForColor = variants
    .filter(v => !selectedColor || v.color_name === selectedColor)
    .map(v => v.size)
    .filter(Boolean);

  const allSizesList = product.available_sizes && product.available_sizes.length > 0
    ? product.available_sizes
    : Array.from(new Set(variants.map(v => v.size).filter(Boolean)));

  // Current active variant matching both selected color & size
  const currentVariant = variants.find(v => {
    const matchColor = !selectedColor || v.color_name === selectedColor;
    const matchSize = !selectedSize || v.size === selectedSize;
    return matchColor && matchSize;
  });

  const variantStock = currentVariant ? currentVariant.stock : (product.stock || 0);
  const isVariantInStock = currentVariant ? (currentVariant.stock > 0) : (product.in_stock && product.stock > 0);
  const displayPrice = currentVariant?.price_override || product.current_price || product.price;

  const handleAddToCart = async () => {
    if (!isVariantInStock) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity, { variantId: currentVariant?.id });
      onClose();
    } catch (err) {
      console.error('Failed to add variant to cart:', err);
    } finally {
      setIsAdding(false);
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
      <div 
        className="glass-card" 
        style={{
          maxWidth: '520px',
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backgroundColor: '#0f172a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), var(--shadow-glow)',
          overflow: 'hidden',
          position: 'relative',
          padding: '2rem'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
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
          title="Close"
        >
          <X size={16} />
        </button>

        {/* Product Header Row */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80'}
            alt={product.name}
            style={{
              width: '84px',
              height: '84px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)', fontWeight: '700' }}>
              {product.brand_name || product.category_name || 'Select Options'}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem', lineHeight: '1.3' }}>
              {product.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>
                ₹{displayPrice}
              </span>
              {product.has_discount && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.price}
                </span>
              )}
              {product.has_discount && (
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#fb7185', background: 'rgba(244, 63, 94, 0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  -{product.discount_percentage}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Color Options Selection */}
        {colorsList.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: '700', color: '#ffffff' }}>Select Color:</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{selectedColor || 'Choose Color'}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {colorsList.map((col, idx) => {
                const colorName = typeof col === 'string' ? col : col.name;
                const colorCode = typeof col === 'object' ? col.code : '#6366f1';
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
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
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
                      backgroundColor: colorCode || '#6366f1',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
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
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: '700', color: '#ffffff' }}>Select Size:</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{selectedSize || 'Choose Size'}</span>
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
                      minWidth: '46px',
                      height: '38px',
                      padding: '0 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--accent-primary)' : isAvailableForColor ? 'var(--bg-surface)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#ffffff' : isAvailableForColor ? '#ffffff' : 'var(--text-muted)',
                      cursor: isAvailableForColor ? 'pointer' : 'not-allowed',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      opacity: isAvailableForColor ? 1 : 0.4,
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
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Availability</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: isVariantInStock ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {isVariantInStock ? `In Stock (${variantStock} available)` : 'Out of Stock'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                color: '#ffffff',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Minus size={14} />
            </button>
            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '800', fontSize: '0.95rem' }}>
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= variantStock}
              onClick={() => setQuantity(q => Math.min(variantStock, q + 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                color: '#ffffff',
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
        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <button
            type="button"
            disabled={!isVariantInStock || isAdding}
            onClick={handleAddToCart}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: '800' }}
          >
            {isAdding ? (
              'Adding to Cart...'
            ) : !isVariantInStock ? (
              'Selected Option Out of Stock'
            ) : (
              <>
                <ShoppingCart size={16} /> Add to Cart (₹{(parseFloat(displayPrice || 0) * quantity).toFixed(2)})
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
              fontSize: '0.85rem',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '0.4rem'
            }}
          >
            <span>View Full Product Specifications & Details</span>
            <ExternalLink size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VariantModal;
