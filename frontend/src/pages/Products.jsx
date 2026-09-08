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
  X
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
    <div className="catalog-page">
      {/* Page Header */}
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">
            Product <span className="gradient-text">Catalog</span>
          </h1>
          <p className="catalog-subtitle">
            Discover high-end electronics, audio devices, apparel, and smart wearables.
          </p>
        </div>

        <div className="catalog-controls-bar">
          {/* Mobile Filters Trigger Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="mobile-filter-trigger btn btn-outline"
          >
            <Filter size={15} color="var(--accent-orange)" />
            <span>Filters {hasActiveFilters && '●'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="sort-dropdown-wrap">
            <select
              value={ordering}
              onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
              className="sort-select"
            >
              <option value="-created_at">✨ Newest Arrivals</option>
              <option value="price">💵 Price: Low to High</option>
              <option value="-price">💎 Price: High to Low</option>
              <option value="-average_rating">⭐ Highest Rated</option>
              <option value="name">🔤 Alphabetical (A-Z)</option>
            </select>
            <ArrowUpDown size={14} className="sort-icon" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn btn-outline reset-filters-btn"
              title="Reset all filters"
            >
              <RotateCcw size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Category Quick Pills */}
      <div className="glass-card search-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, SKU, brand, or specifications..."
              className="search-input"
            />
            <Search size={18} className="search-icon" />
          </div>
          <button type="submit" className="btn btn-primary search-btn">
            Search
          </button>
        </form>

        {/* Category Pills (Scrollable horizontally on mobile) */}
        <div className="category-pills-row">
          <button
            onClick={() => { setCategory(''); setPage(1); }}
            className={`cat-pill ${category === '' ? 'active' : ''}`}
          >
            All Products
          </button>
          {categoriesList.map((cat) => {
            const isSelected = category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`cat-pill ${isSelected ? 'active' : ''}`}
              >
                {cat.name}
                {cat.product_count !== undefined && (
                  <span className="cat-count">({cat.product_count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Products Grid */}
      <div className="catalog-layout">
        {/* Left Filter Sidebar */}
        <aside className={`filter-sidebar glass-card ${showMobileFilters ? 'mobile-open' : ''}`}>
          <div className="filter-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem' }}>
              <SlidersHorizontal size={18} color="var(--accent-orange)" />
              <span>Refine Search</span>
            </div>
            {showMobileFilters && (
              <button onClick={() => setShowMobileFilters(false)} className="close-filter-btn" aria-label="Close filters">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Brands Filter */}
          <div className="filter-section">
            <label className="filter-title">
              Brands
            </label>
            <div className="filter-options-list">
              {brandsList.map((b) => {
                const isChecked = brand === b.slug;
                return (
                  <label
                    key={b.id}
                    className="filter-checkbox-label"
                    style={{ color: isChecked ? 'var(--accent-orange)' : 'var(--text-secondary)' }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBrandSelect(b.slug)}
                      style={{ accentColor: 'var(--accent-orange)' }}
                    />
                    <span>{b.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <label className="filter-title">
              Price Range (₹)
            </label>
            <div className="price-inputs-row">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                placeholder="Min"
                min="0"
                className="price-input"
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                placeholder="Max"
                min="0"
                className="price-input"
              />
            </div>
          </div>

          {/* In-Stock Filter */}
          <div className="filter-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: inStock ? 'var(--accent-emerald)' : 'var(--text-secondary)',
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

          {showMobileFilters && (
            <button
              onClick={() => setShowMobileFilters(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              Apply Filters
            </button>
          )}
        </aside>

        {/* Right Products Listing Area */}
        <div className="products-listing-col">
          {/* Results Summary Bar */}
          <div className="results-summary-row">
            <span>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{products.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> products
            </span>
            {hasActiveFilters && (
              <span className="filters-applied-tag">Filters applied</span>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="products-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card product-card-skeleton"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card empty-products-card">
              <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No matching products found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                We couldn't find any products matching your current search or filter combination.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                <RotateCcw size={16} /> Reset All Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((prod) => (
                <div key={prod.id} className="glass-card product-card">
                  {/* Image Container with Badges */}
                  <div className="product-card-img-wrap">
                    <Link to={`/products/${prod.slug}`} style={{ display: 'block' }}>
                      <img
                        src={prod.primary_image}
                        alt={prod.name}
                        className="product-card-img"
                      />
                    </Link>

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(prod);
                      }}
                      className="card-wishlist-btn"
                      title={isInWishlist(prod.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart size={16} color={isInWishlist(prod.id) ? '#ea580c' : 'var(--text-muted)'} fill={isInWishlist(prod.id) ? '#ea580c' : 'none'} />
                    </button>

                    {/* Discount Badge */}
                    {prod.has_discount && (
                      <span className="card-discount-badge">
                        -{prod.discount_percentage}%
                      </span>
                    )}

                    {/* Featured Tag */}
                    {prod.is_featured && !prod.has_discount && (
                      <span className="card-featured-badge">
                        <Sparkles size={11} /> Featured
                      </span>
                    )}

                    {/* Stock Status Tag */}
                    <span className={`card-stock-badge ${prod.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                      {prod.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Product Metadata */}
                  <div className="product-card-body">
                    <div className="card-top-meta">
                      <span>{prod.brand_name || 'Generic'}</span>
                      <span className="card-rating">
                        <Star size={13} fill="currentColor" />
                        <strong>{prod.average_rating || '5.0'}</strong>
                      </span>
                    </div>

                    <Link to={`/products/${prod.slug}`}>
                      <h3 className="card-product-title">
                        {prod.name}
                      </h3>
                    </Link>

                    <p className="card-product-desc">
                      {prod.short_description || 'High performance quality catalog item.'}
                    </p>

                    {/* Apparel Color Swatches & Size Preview */}
                    {prod.has_variants && (
                      <div className="card-variant-preview">
                        {prod.available_colors && prod.available_colors.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title={`Colors: ${prod.available_colors.map(c => c.name).join(', ')}`}>
                            {prod.available_colors.slice(0, 4).map((c, i) => (
                              <span
                                key={i}
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: c.code || '#ea580c',
                                  border: '1px solid #ddd',
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
                            {prod.available_sizes.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="card-footer-row">
                    <div>
                      <div className="card-price-current">
                        ₹{prod.current_price}
                      </div>
                      {prod.has_discount && (
                        <div className="card-price-original">
                          ₹{prod.price}
                        </div>
                      )}
                    </div>

                    <div className="card-action-btns">
                      <button
                        onClick={(e) => handleProductCartClick(prod, e)}
                        disabled={!prod.in_stock}
                        className={`btn ${isInCart(prod.id) ? 'btn-outline' : 'btn-primary'} card-cart-btn`}
                        style={{
                          borderColor: isInCart(prod.id) ? 'var(--accent-emerald)' : undefined,
                          color: isInCart(prod.id) ? 'var(--accent-emerald)' : undefined,
                          backgroundColor: isInCart(prod.id) ? 'rgba(16, 185, 129, 0.12)' : undefined
                        }}
                        title={prod.has_variants ? 'Choose Size & Color' : isInCart(prod.id) ? 'In Cart' : 'Add to Cart'}
                      >
                        {isInCart(prod.id) ? (
                          <Check size={14} />
                        ) : (
                          <ShoppingCart size={14} />
                        )}
                      </button>

                      <Link
                        to={`/products/${prod.slug}`}
                        className="btn btn-outline card-details-btn"
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
            <div className="pagination-wrap">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn btn-outline page-nav-btn"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`page-num-btn ${page === pNum ? 'active' : ''}`}
                >
                  {pNum}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn btn-outline page-nav-btn"
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

      <style>{`
        .catalog-page {
          width: 100%;
        }

        .catalog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .catalog-title {
          font-size: 2.1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
          color: var(--text-primary);
        }

        .catalog-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .catalog-controls-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .mobile-filter-trigger {
          display: none;
          padding: 0.6rem 0.9rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .sort-dropdown-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sort-select {
          background-color: #ffffff;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.65rem 2.2rem 0.65rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          appearance: none;
        }

        .sort-icon {
          position: absolute;
          right: 0.85rem;
          pointer-events: none;
          color: var(--text-muted);
        }

        .reset-filters-btn {
          font-size: 0.82rem;
          padding: 0.6rem 0.9rem;
          color: var(--accent-rose);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .search-card {
          padding: 1.25rem 1.5rem;
          margin-bottom: 2rem;
        }

        .search-form {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .search-input-wrap {
          position: relative;
          flex: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.75rem;
          border-radius: var(--radius-md);
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 0.95rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-btn {
          padding: 0.75rem 1.5rem;
        }

        .category-pills-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.35rem;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .category-pills-row::-webkit-scrollbar {
          display: none;
        }

        .cat-pill {
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          background-color: #ffffff;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .cat-pill:hover {
          color: var(--accent-orange);
          border-color: var(--accent-primary);
        }

        .cat-pill.active {
          background-color: var(--accent-orange);
          color: #ffffff;
          border-color: var(--accent-orange);
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.25);
        }

        .cat-count {
          font-size: 0.72rem;
          opacity: 0.8;
          margin-left: 0.25rem;
        }

        .catalog-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .filter-sidebar {
          padding: 1.5rem;
          position: sticky;
          top: 90px;
        }

        .filter-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .close-filter-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
        }

        .filter-section {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1.25rem;
        }

        .filter-title {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .filter-options-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 180px;
          overflow-y: auto;
        }

        .filter-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .price-inputs-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .price-input {
          width: 100%;
          padding: 0.55rem 0.75rem;
          border-radius: var(--radius-sm);
          background-color: #ffffff;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }

        .results-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .filters-applied-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-orange);
          background: rgba(245, 158, 11, 0.12);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .product-card-skeleton {
          height: 360px;
          opacity: 0.5;
          animation: pulse 1.5s infinite ease-in-out;
        }

        .empty-products-card {
          padding: 4rem 2rem;
          text-align: center;
        }

        .product-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -4px rgba(245, 158, 11, 0.15), var(--shadow-md);
        }

        .product-card-img-wrap {
          position: relative;
          margin-bottom: 1rem;
          overflow: hidden;
          border-radius: var(--radius-md);
          background-color: #fafaf9;
        }

        .product-card-img {
          width: 100%;
          height: 210px;
          object-fit: cover;
          border-radius: var(--radius-md);
          transition: transform 0.4s ease;
        }

        .product-card-img:hover {
          transform: scale(1.05);
        }

        .card-wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(6px);
          border: 1px solid var(--border-color);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .card-discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: var(--accent-orange);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.4);
        }

        .card-featured-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: var(--accent-gradient);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .card-stock-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .card-stock-badge.in-stock {
          background-color: rgba(16, 185, 129, 0.9);
        }

        .card-stock-badge.out-of-stock {
          background-color: rgba(239, 68, 68, 0.9);
        }

        .card-top-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .card-rating {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          color: var(--accent-orange);
        }

        .card-product-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.7rem;
        }

        .card-product-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-variant-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0.25rem 0 0.5rem;
          gap: 0.5rem;
        }

        .card-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 0.85rem;
          margin-top: 0.5rem;
          gap: 0.5rem;
        }

        .card-price-current {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .card-price-original {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .card-action-btns {
          display: flex;
          gap: 0.4rem;
        }

        .card-cart-btn {
          padding: 0.45rem 0.75rem;
          font-size: 0.8rem;
        }

        .card-details-btn {
          padding: 0.45rem 0.8rem;
          font-size: 0.8rem;
        }

        .pagination-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 3rem;
        }

        .page-nav-btn {
          padding: 0.5rem 0.75rem;
        }

        .page-num-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background-color: #ffffff;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .page-num-btn.active {
          background-color: var(--accent-orange);
          color: #ffffff;
          border-color: var(--accent-orange);
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.3);
        }

        /* Responsive Mobile View Rules */
        @media (max-width: 768px) {
          .catalog-layout {
            grid-template-columns: 1fr;
          }

          .catalog-title {
            font-size: 1.6rem;
          }

          .mobile-filter-trigger {
            display: inline-flex;
          }

          .filter-sidebar {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            height: 100vh;
            z-index: 2000;
            overflow-y: auto;
            border-radius: 0;
            margin: 0;
            padding: 1.5rem;
          }

          .filter-sidebar.mobile-open {
            display: block;
          }

          .products-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .product-card-img {
            height: 180px;
          }

          .search-form {
            flex-direction: column;
          }

          .search-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Products;
