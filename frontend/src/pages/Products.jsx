import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart,
  Heart,
  Search, 
  Filter, 
  Star, 
  Sparkles, 
  SlidersHorizontal, 
  Check, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { getProducts, getCategories, getBrands } from '../services/catalogService';
import { useCart } from '../context/CartContext';
import VariantModal from '../components/VariantModal';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, toggleWishlist, isInWishlist, isInCart } = useCart();

  // Filter States initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data States
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState(null);

  const handleProductCartClick = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (product.has_variants && product.variants && product.variants.length > 0) {
      setVariantModalProduct(product);
    } else {
      addToCart(product.id, 1);
    }
  };

  // Load Categories and Brands on Mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, brs] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategoriesList(Array.isArray(cats) ? cats : []);
        setBrandsList(Array.isArray(brs) ? brs : []);
      } catch (err) {
        console.error('Failed to load catalog metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Products based on current filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        search: search.trim() || undefined,
        category: category || undefined,
        brand: brand || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        in_stock: inStock ? 'true' : undefined,
        ordering: ordering || undefined,
      };

      // Sync state to URL search params
      const cleanParams = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') cleanParams[k] = v;
      });
      setSearchParams(cleanParams, { replace: true });

      const data = await getProducts(params);

      if (data.results) {
        setProducts(data.results);
        setTotalCount(data.count || 0);
        // Backend page size is 10 or 12
        const pageSize = 10;
        setTotalPages(Math.ceil((data.count || 0) / pageSize) || 1);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, brand, minPrice, maxPrice, inStock, ordering, setSearchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategorySelect = (catSlug) => {
    setCategory(category === catSlug ? '' : catSlug);
    setPage(1);
  };

  const handleBrandSelect = (brandSlug) => {
    setBrand(brand === brandSlug ? '' : brandSlug);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setOrdering('-created_at');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || category || brand || minPrice || maxPrice || inStock || ordering !== '-created_at');

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Product <span className="gradient-text">Catalog</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Discover high-end electronics, audio devices, laptops, and smart wearables.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Sort Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={ordering}
              onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 2.2rem 0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none'
              }}
            >
              <option value="-created_at">✨ Newest Arrivals</option>
              <option value="price">💵 Price: Low to High</option>
              <option value="-price">💎 Price: High to Low</option>
              <option value="-average_rating">⭐ Highest Rated</option>
              <option value="name">🔤 Alphabetical (A-Z)</option>
            </select>
            <ArrowUpDown size={14} style={{ position: 'absolute', right: '0.85rem', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.6rem 0.9rem', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              title="Reset all filters"
            >
              <RotateCcw size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Category Quick Pills */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, SKU, brand, or specifications..."
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 2.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginRight: '0.25rem' }}>
            Categories:
          </span>
          <button
            onClick={() => { setCategory(''); setPage(1); }}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: '600',
              backgroundColor: category === '' ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: category === '' ? '#ffffff' : 'var(--text-secondary)',
              border: category === '' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              transition: 'all var(--transition-fast)'
            }}
          >
            All Products
          </button>
          {categoriesList.map((cat) => {
            const isSelected = category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {cat.name}
                {cat.product_count !== undefined && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>({cat.product_count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Filter Sidebar */}
        <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontWeight: '700', fontSize: '1rem' }}>
            <SlidersHorizontal size={18} color="var(--accent-primary)" />
            <span>Refine Search</span>
          </div>

          {/* Brands Filter */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Brands
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {brandsList.map((b) => {
                const isChecked = brand === b.slug;
                return (
                  <label
                    key={b.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.85rem',
                      color: isChecked ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBrandSelect(b.slug)}
                      style={{ accentColor: 'var(--accent-primary)' }}
                    />
                    <span>{b.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Price Range (₹)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                placeholder="Min"
                min="0"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                placeholder="Max"
                min="0"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* In-Stock Filter */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: inStock ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => { setInStock(e.target.checked); setPage(1); }}
                style={{ accentColor: 'var(--accent-emerald)' }}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Right Products Listing Area */}
        <div>
          {/* Results Summary Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>
              Showing <strong style={{ color: '#ffffff' }}>{products.length}</strong> of <strong style={{ color: '#ffffff' }}>{totalCount}</strong> products
            </span>
            {hasActiveFilters && (
              <span>Filters applied</span>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card" style={{ height: '360px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>No matching products found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                We couldn't find any products matching your current search or filter combination.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                <RotateCcw size={16} /> Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Image Container with Badges */}
                  <div style={{ position: 'relative', marginBottom: '1rem', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                    <Link to={`/products/${prod.slug}`} style={{ display: 'block' }}>
                      <img
                        src={prod.primary_image}
                        alt={prod.name}
                        style={{
                          width: '100%',
                          height: '210px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          transition: 'transform 0.4s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      />
                    </Link>

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(prod);
                      }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(17, 24, 39, 0.75)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isInWishlist(prod.id) ? '#ec4899' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      title={isInWishlist(prod.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart size={16} fill={isInWishlist(prod.id) ? '#ec4899' : 'none'} />
                    </button>

                    {/* Discount Badge */}
                    {prod.has_discount && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'var(--accent-rose)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 2px 8px rgba(244, 63, 94, 0.5)'
                      }}>
                        -{prod.discount_percentage}% OFF
                      </span>
                    )}

                    {/* Featured Tag */}
                    {prod.is_featured && !prod.has_discount && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Sparkles size={12} /> Featured
                      </span>
                    )}

                    {/* Stock Status Tag */}
                    <span style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: prod.in_stock ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {prod.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Product Metadata */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>{prod.brand_name || 'Generic'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-amber)' }}>
                        <Star size={13} fill="currentColor" />
                        <strong>{prod.average_rating || '5.0'}</strong>
                      </span>
                    </div>

                    <Link to={`/products/${prod.slug}`}>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        lineHeight: '1.35',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '2.7rem'
                      }}>
                        {prod.name}
                      </h3>
                    </Link>

                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.75rem',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {prod.short_description || 'High performance quality catalog item.'}
                    </p>

                    {/* Apparel Color Swatches & Size Preview */}
                    {prod.has_variants && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.25rem 0 0.5rem', gap: '0.5rem' }}>
                        {prod.available_colors && prod.available_colors.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title={`Colors: ${prod.available_colors.map(c => c.name).join(', ')}`}>
                            {prod.available_colors.slice(0, 4).map((c, i) => (
                              <span
                                key={i}
                                style={{
                                  width: '13px',
                                  height: '13px',
                                  borderRadius: '50%',
                                  backgroundColor: c.code || '#4f46e5',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  display: 'inline-block'
                                }}
                              />
                            ))}
                            {prod.available_colors.length > 4 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{prod.available_colors.length - 4}</span>
                            )}
                          </div>
                        )}

                        {prod.available_sizes && prod.available_sizes.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            Sizes: {prod.available_sizes.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.85rem',
                    marginTop: '0.5rem',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
                        ₹{prod.current_price}
                      </div>
                      {prod.has_discount && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{prod.price}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={(e) => handleProductCartClick(prod, e)}
                        disabled={!prod.in_stock}
                        className={`btn ${isInCart(prod.id) ? 'btn-outline' : 'btn-primary'}`}
                        style={{
                          padding: '0.45rem 0.75rem',
                          fontSize: '0.8rem',
                          opacity: !prod.in_stock ? 0.4 : 1,
                          cursor: !prod.in_stock ? 'not-allowed' : 'pointer',
                          borderColor: isInCart(prod.id) ? 'var(--accent-emerald)' : undefined,
                          color: isInCart(prod.id) ? 'var(--accent-emerald)' : undefined,
                          backgroundColor: isInCart(prod.id) ? 'rgba(16, 185, 129, 0.12)' : undefined
                        }}
                        title={prod.has_variants ? 'Choose Size & Color' : isInCart(prod.id) ? 'Already Added to Cart' : 'Add to Cart'}
                      >
                        {isInCart(prod.id) ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Check size={13} /> In Cart
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ShoppingCart size={14} />
                          </span>
                        )}
                      </button>

                      <Link
                        to={`/products/${prod.slug}`}
                        className="btn btn-outline"
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '3rem'
            }}>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.75rem', opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: page === pNum ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    color: page === pNum ? '#ffffff' : 'var(--text-secondary)',
                    border: page === pNum ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    fontWeight: '700',
                    fontSize: '0.85rem'
                  }}
                >
                  {pNum}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.75rem', opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Variant Selection Modal Popup */}
      <VariantModal
        isOpen={Boolean(variantModalProduct)}
        onClose={() => setVariantModalProduct(null)}
        product={variantModalProduct}
      />
    </div>
  );
};

export default Products;
