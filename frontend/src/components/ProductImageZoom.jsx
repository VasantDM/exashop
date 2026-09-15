import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Heart, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const ProductImageZoom = ({
  images = [],
  selectedImage = '',
  onSelectImage,
  productName = 'Product',
  inWish = false,
  onToggleWishlist,
  discountPercentage = 0,
  hasDiscount = false,
  zoomLevel = 2.5
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, visible: false, width: 120, height: 120 });
  const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const flyoutRef = useRef(null);

  const currentImage = selectedImage || images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
  const currentIndex = images.findIndex((img) => img === currentImage);
  const activeIndex = currentIndex !== -1 ? currentIndex : 0;

  // Calculate lens and zoom coordinates on mouse move
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !imgRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    // Mouse position relative to image container
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (
      clientX < containerRect.left ||
      clientX > containerRect.right ||
      clientY < containerRect.top ||
      clientY > containerRect.bottom
    ) {
      setIsHovering(false);
      return;
    }

    const mouseX = clientX - containerRect.left;
    const mouseY = clientY - containerRect.top;

    // Lens dimensions proportional to container and zoom level
    const lensWidth = Math.max(80, Math.min(containerRect.width * 0.4, containerRect.width / zoomLevel));
    const lensHeight = Math.max(80, Math.min(containerRect.height * 0.4, containerRect.height / zoomLevel));

    // Clamp lens within container bounds
    const minX = 0;
    const maxX = containerRect.width - lensWidth;
    const minY = 0;
    const maxY = containerRect.height - lensHeight;

    let lensLeft = mouseX - lensWidth / 2;
    let lensTop = mouseY - lensHeight / 2;

    lensLeft = Math.max(minX, Math.min(lensLeft, maxX));
    lensTop = Math.max(minY, Math.min(lensTop, maxY));

    // Calculate background position percentages (0% to 100%)
    const pctX = maxX > 0 ? (lensLeft / maxX) * 100 : 50;
    const pctY = maxY > 0 ? (lensTop / maxY) * 100 : 50;

    setLensPos({
      x: lensLeft,
      y: lensTop,
      width: lensWidth,
      height: lensHeight,
      visible: true
    });

    setZoomOffset({
      x: pctX,
      y: pctY
    });
  }, [zoomLevel]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setLensPos((prev) => ({ ...prev, visible: false }));
  };

  // Lightbox handlers
  const openLightbox = (e) => {
    e.stopPropagation();
    setIsLightboxOpen(true);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    const prevIdx = (activeIndex - 1 + images.length) % images.length;
    if (onSelectImage) onSelectImage(images[prevIdx]);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    const nextIdx = (activeIndex + 1) % images.length;
    if (onSelectImage) onSelectImage(images[nextIdx]);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === '+' || e.key === '=') setLightboxZoom((z) => Math.min(4, z + 0.5));
      if (e.key === '-' || e.key === '_') setLightboxZoom((z) => Math.max(1, z - 0.5));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeIndex, images]);

  // Lightbox Pan & Drag
  const handleMouseDown = (e) => {
    if (lightboxZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - lightboxPan.x, y: e.clientY - lightboxPan.y });
    }
  };

  const handleLightboxMouseMove = (e) => {
    if (isDragging && lightboxZoom > 1) {
      setLightboxPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="product-zoom-wrapper">
      {/* Main Showcase Container */}
      <div 
        className="zoom-main-card"
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
      >
        {/* Discount Badge */}
        {hasDiscount && discountPercentage > 0 && (
          <div className="zoom-discount-badge">
            <Sparkles size={12} />
            <span>-{discountPercentage}%</span>
          </div>
        )}

        {/* Wishlist Floating Button */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className="zoom-wishlist-btn"
            title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist Toggle"
          >
            <Heart 
              size={20} 
              color={inWish ? '#ea580c' : '#0f172a'} 
              fill={inWish ? '#ea580c' : 'none'} 
            />
          </button>
        )}

        {/* Expand / Fullscreen Button */}
        <button
          type="button"
          onClick={openLightbox}
          className="zoom-expand-btn"
          title="Click to view full screen"
          aria-label="View Fullscreen"
        >
          <Maximize2 size={17} />
        </button>

        {/* Main Display Image */}
        <img
          ref={imgRef}
          src={currentImage}
          alt={productName}
          className="zoom-main-img"
          loading="eager"
        />

        {/* Hover Prompt Hint */}
        <div className={`zoom-hover-hint ${isHovering ? 'hint-hidden' : ''}`}>
          <ZoomIn size={14} />
          <span>Roll over image to zoom</span>
        </div>

        {/* Magnifier Lens on top of main image */}
        {isHovering && lensPos.visible && (
          <div
            className="zoom-magnifier-lens"
            style={{
              left: `${lensPos.x}px`,
              top: `${lensPos.y}px`,
              width: `${lensPos.width}px`,
              height: `${lensPos.height}px`
            }}
          />
        )}

        {/* Right Side Zoom Flyout Window (E-Commerce Standard) */}
        {isHovering && lensPos.visible && (
          <div 
            ref={flyoutRef}
            className="zoom-flyout-window"
          >
            <div className="zoom-flyout-header">
              <span className="zoom-flyout-badge">
                <ZoomIn size={13} /> {zoomLevel}x Magnified View
              </span>
            </div>

            <div
              className="zoom-flyout-view"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundPosition: `${zoomOffset.x}% ${zoomOffset.y}%`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${zoomLevel * 100}%`
              }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div className="zoom-thumbnails-row">
          {images.map((imgUrl, idx) => {
            const isSelected = imgUrl === currentImage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onSelectImage) onSelectImage(imgUrl);
                }}
                onMouseEnter={() => {
                  if (onSelectImage) onSelectImage(imgUrl);
                }}
                className={`zoom-thumb-btn ${isSelected ? 'active' : ''}`}
                aria-label={`Thumbnail ${idx + 1}`}
              >
                <img src={imgUrl} alt={`${productName} view ${idx + 1}`} className="zoom-thumb-img" />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            {/* Lightbox Toolbar */}
            <div className="lightbox-header">
              <div className="lightbox-title-wrap">
                <h3 className="lightbox-title">{productName}</h3>
                <span className="lightbox-counter">
                  {activeIndex + 1} / {images.length || 1}
                </span>
              </div>

              {/* Controls */}
              <div className="lightbox-tools">
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.min(4, Number((z + 0.5).toFixed(1))))}
                  className="lightbox-tool-btn"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))));
                    if (lightboxZoom <= 1.5) setLightboxPan({ x: 0, y: 0 });
                  }}
                  className="lightbox-tool-btn"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxZoom(1);
                    setLightboxPan({ x: 0, y: 0 });
                  }}
                  className="lightbox-tool-btn"
                  title="Reset Zoom"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="lightbox-tool-btn lightbox-close-btn"
                  title="Close (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lightbox Main Stage */}
            <div 
              className={`lightbox-stage ${lightboxZoom > 1 ? 'is-zoomed' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleLightboxMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Previous Image Arrow */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="lightbox-nav-btn prev-btn"
                  aria-label="Previous Image"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              {/* Active Zoomable Image */}
              <div 
                className="lightbox-image-container"
                style={{
                  transform: `scale(${lightboxZoom}) translate(${lightboxPan.x / lightboxZoom}px, ${lightboxPan.y / lightboxZoom}px)`,
                  cursor: lightboxZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
              >
                <img
                  src={currentImage}
                  alt={productName}
                  className="lightbox-img"
                  draggable={false}
                />
              </div>

              {/* Next Image Arrow */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="lightbox-nav-btn next-btn"
                  aria-label="Next Image"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>

            {/* Lightbox Bottom Thumbnails */}
            {images.length > 1 && (
              <div className="lightbox-thumbnails-footer">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onSelectImage) onSelectImage(imgUrl);
                      setLightboxZoom(1);
                      setLightboxPan({ x: 0, y: 0 });
                    }}
                    className={`lightbox-thumb ${imgUrl === currentImage ? 'active' : ''}`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Component Styles */}
      <style>{`
        .product-zoom-wrapper {
          position: relative;
          width: 100%;
        }

        .zoom-main-card {
          background: #ffffff;
          border: 1px solid var(--border-color, #e7e5e4);
          border-radius: var(--radius-lg, 18px);
          padding: 1.5rem;
          margin-bottom: 1.25rem;
          text-align: center;
          position: relative;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
          cursor: crosshair;
          overflow: visible;
          user-select: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .zoom-main-card:hover {
          border-color: rgba(234, 88, 12, 0.35);
          box-shadow: 0 8px 30px -4px rgba(234, 88, 12, 0.12);
        }

        .zoom-main-img {
          width: 100%;
          max-height: 440px;
          min-height: 320px;
          object-fit: contain;
          border-radius: var(--radius-md, 12px);
          display: block;
          margin: 0 auto;
          pointer-events: none;
        }

        /* Magnifier Lens */
        .zoom-magnifier-lens {
          position: absolute;
          border: 2px solid #ea580c;
          background-color: rgba(245, 158, 11, 0.15);
          backdrop-filter: blur(1px);
          border-radius: 8px;
          pointer-events: none;
          z-index: 20;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8), 0 4px 14px rgba(234, 88, 12, 0.25);
          animation: lensFadeIn 0.15s ease-out;
        }

        @keyframes lensFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Floating Controls on Main Card */
        .zoom-discount-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.3rem 0.65rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35);
        }

        .zoom-wishlist-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #ffffff;
          border: 1px solid var(--border-color, #e7e5e4);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 15;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
        }

        .zoom-wishlist-btn:hover {
          transform: scale(1.1);
          border-color: #ea580c;
        }

        .zoom-expand-btn {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-color, #e7e5e4);
          color: var(--text-primary, #0f172a);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 15;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }

        .zoom-expand-btn:hover {
          background: #ea580c;
          color: #ffffff;
          border-color: #ea580c;
          transform: scale(1.08);
        }

        .zoom-hover-hint {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          pointer-events: none;
          z-index: 10;
          opacity: 0.88;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .zoom-hover-hint.hint-hidden {
          opacity: 0;
          transform: translate(-50%, 6px);
        }

        /* E-Commerce Right Side Zoom Flyout Window */
        .zoom-flyout-window {
          position: absolute;
          left: calc(100% + 24px);
          top: 0;
          width: 520px;
          height: 100%;
          min-height: 460px;
          background: #ffffff;
          border: 2px solid #e7e5e4;
          border-radius: var(--radius-lg, 18px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.03);
          z-index: 999;
          overflow: hidden;
          pointer-events: none;
          animation: flyoutSlideIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        @keyframes flyoutSlideIn {
          from {
            opacity: 0;
            transform: translateX(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .zoom-flyout-header {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          pointer-events: none;
        }

        .zoom-flyout-badge {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .zoom-flyout-view {
          width: 100%;
          height: 100%;
          min-height: 460px;
          background-color: #ffffff;
        }

        /* Thumbnails */
        .zoom-thumbnails-row {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          -webkit-overflow-scrolling: touch;
        }

        .zoom-thumb-btn {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-md, 12px);
          background-color: #ffffff;
          border: 1.5px solid var(--border-color, #e7e5e4);
          padding: 4px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .zoom-thumb-btn:hover {
          border-color: #ea580c;
          transform: translateY(-2px);
        }

        .zoom-thumb-btn.active {
          border: 2px solid #ea580c;
          box-shadow: 0 0 10px rgba(234, 88, 12, 0.35);
        }

        .zoom-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: calc(var(--radius-md, 12px) - 4px);
        }

        /* Lightbox Fullscreen Modal */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(10, 15, 26, 0.88);
          backdrop-filter: blur(12px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: modalOverlayFade 0.2s ease-out;
        }

        @keyframes modalOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .lightbox-modal {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 1100px;
          height: 88vh;
          max-height: 820px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .lightbox-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color, #e7e5e4);
          background: #fafaf9;
        }

        .lightbox-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .lightbox-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 500px;
        }

        .lightbox-counter {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ea580c;
          background: rgba(234, 88, 12, 0.12);
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
        }

        .lightbox-tools {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .lightbox-tool-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid var(--border-color, #e7e5e4);
          color: var(--text-primary, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .lightbox-tool-btn:hover {
          background: rgba(245, 158, 11, 0.12);
          border-color: #ea580c;
          color: #ea580c;
        }

        .lightbox-close-btn {
          background: #fee2e2;
          border-color: #fecaca;
          color: #ef4444;
          margin-left: 0.5rem;
        }

        .lightbox-close-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }

        .lightbox-stage {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #f8fafc;
          user-select: none;
        }

        .lightbox-image-container {
          transition: transform 0.15s ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 90%;
          max-height: 90%;
        }

        .lightbox-img {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
          pointer-events: none;
        }

        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid var(--border-color, #e7e5e4);
          color: var(--text-primary, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          transition: all 0.2s ease;
        }

        .lightbox-nav-btn:hover {
          background: #ea580c;
          color: #ffffff;
          border-color: #ea580c;
          transform: translateY(-50%) scale(1.08);
        }

        .lightbox-nav-btn.prev-btn {
          left: 20px;
        }

        .lightbox-nav-btn.next-btn {
          right: 20px;
        }

        .lightbox-thumbnails-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.85rem 1.5rem;
          background: #fafaf9;
          border-top: 1px solid var(--border-color, #e7e5e4);
          overflow-x: auto;
        }

        .lightbox-thumb {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          border: 2px solid var(--border-color, #e7e5e4);
          background: #ffffff;
          padding: 3px;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .lightbox-thumb:hover {
          border-color: #ea580c;
        }

        .lightbox-thumb.active {
          border-color: #ea580c;
          box-shadow: 0 0 8px rgba(234, 88, 12, 0.35);
        }

        .lightbox-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
          .zoom-flyout-window {
            width: 440px;
          }
        }

        @media (max-width: 992px) {
          /* On tablets and mobile, disable right flyout and use Lightbox for best touch UX */
          .zoom-flyout-window {
            display: none !important;
          }

          .zoom-magnifier-lens {
            display: none !important;
          }

          .zoom-main-card {
            cursor: pointer;
          }

          .zoom-hover-hint span {
            font-size: 0.72rem;
          }
        }

        @media (max-width: 768px) {
          .zoom-main-img {
            max-height: 320px;
            min-height: 240px;
          }

          .lightbox-modal {
            height: 94vh;
            max-height: none;
            border-radius: 12px;
          }

          .lightbox-title {
            max-width: 180px;
            font-size: 0.95rem;
          }

          .lightbox-nav-btn {
            width: 38px;
            height: 38px;
          }
          
          .lightbox-nav-btn.prev-btn { left: 10px; }
          .lightbox-nav-btn.next-btn { right: 10px; }
        }
      `}</style>
    </div>
  );
};

export default ProductImageZoom;
