import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw,
  Star,
  Layers,
  Palette
} from 'lucide-react';
import { 
  getAdminProducts, 
  createAdminProduct, 
  updateAdminProduct, 
  deleteAdminProduct,
  getAdminCategories 
} from '../../services/adminService';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    sku: '',
    short_description: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    stock: '10',
    is_available: true,
    is_featured: false,
    initial_image_url: '',
    images: [], // [{ id, image_url, color_name, alt_text, is_primary }]
    variants: []
  };
  const [formData, setFormData] = useState(initialForm);

  // Variant Builder temp state
  const [varColorName, setVarColorName] = useState('');
  const [varColorCode, setVarColorCode] = useState('#f59e0b');
  const [varSize, setVarSize] = useState('M');
  const [varStock, setVarStock] = useState('10');

  // Image Builder temp state
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgColorInput, setImgColorInput] = useState('');
  const [imgIsPrimary, setImgIsPrimary] = useState(false);

  // Dynamic list of unique colors extracted from variants & images
  const availableColorOptions = useMemo(() => {
    const colors = new Set();
    if (formData.variants && Array.isArray(formData.variants)) {
      formData.variants.forEach(v => {
        if (v.color_name && v.color_name.trim()) colors.add(v.color_name.trim());
      });
    }
    if (formData.images && Array.isArray(formData.images)) {
      formData.images.forEach(img => {
        if (img.color_name && img.color_name.trim()) colors.add(img.color_name.trim());
      });
    }
    return Array.from(colors);
  }, [formData.variants, formData.images]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getAdminProducts({ search, category_id: categoryFilter }),
        getAdminCategories()
      ]);
      setProducts(prodRes.results || prodRes);
      setCategories(catRes.results || catRes);
    } catch (err) {
      console.error(err);
      showToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setImgUrlInput('');
    setImgColorInput('');
    setImgIsPrimary(false);
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    const existingImages = (prod.images && prod.images.length > 0)
      ? prod.images.map((img, idx) => ({
          id: img.id,
          image_url: img.display_image || img.image_url,
          color_name: img.color_name || '',
          alt_text: img.alt_text || '',
          is_primary: img.is_primary !== undefined ? img.is_primary : (idx === 0)
        }))
      : (prod.primary_image ? [{ image_url: prod.primary_image, color_name: '', is_primary: true }] : []);

    setFormData({
      name: prod.name,
      sku: prod.sku,
      short_description: prod.short_description || '',
      description: prod.description || '',
      price: prod.price,
      discount_price: prod.discount_price || '',
      category: prod.category || '',
      stock: prod.stock,
      is_available: prod.is_available,
      is_featured: prod.is_featured,
      initial_image_url: prod.primary_image || '',
      images: existingImages,
      variants: prod.variants || []
    });
    setImgUrlInput('');
    setImgColorInput(existingImages[0]?.color_name || '');
    setImgIsPrimary(false);
    setIsModalOpen(true);
  };

  const handleAddImage = () => {
    if (!imgUrlInput || !imgUrlInput.trim()) {
      alert('Please enter a valid image URL.');
      return;
    }

    const trimmedUrl = imgUrlInput.trim();
    const trimmedColor = imgColorInput.trim();
    const isFirstImage = !formData.images || formData.images.length === 0;
    const shouldBePrimary = isFirstImage || imgIsPrimary;

    let updatedImages = (formData.images || []).map((img) => ({
      ...img,
      is_primary: shouldBePrimary ? false : img.is_primary
    }));

    const newImageObj = {
      image_url: trimmedUrl,
      color_name: trimmedColor,
      alt_text: `${formData.name || 'Product'} ${trimmedColor ? `(${trimmedColor})` : ''} Photo`.trim(),
      is_primary: shouldBePrimary
    };

    updatedImages.push(newImageObj);

    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
      initial_image_url: shouldBePrimary ? trimmedUrl : (prev.initial_image_url || trimmedUrl)
    }));

    setImgUrlInput('');
    setImgIsPrimary(false);
    // Keep imgColorInput intact so user can conveniently add another image for the same color!
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const removed = prev.images[index];
      const remaining = prev.images.filter((_, i) => i !== index);
      // If we removed the primary image, make the first remaining image primary
      if (removed?.is_primary && remaining.length > 0) {
        remaining[0].is_primary = true;
      }
      return {
        ...prev,
        images: remaining,
        initial_image_url: remaining.find(img => img.is_primary)?.image_url || remaining[0]?.image_url || ''
      };
    });
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => {
      const updated = prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index
      }));
      return {
        ...prev,
        images: updated,
        initial_image_url: updated[index]?.image_url || prev.initial_image_url
      };
    });
  };

  const handleAddVariant = () => {
    if (!varSize && !varColorName) {
      alert('Please enter at least a size or color name.');
      return;
    }
    const newVar = {
      color_name: varColorName.trim(),
      color_code: varColorCode,
      size: varSize.trim().toUpperCase(),
      stock: parseInt(varStock) || 0,
      sku: `${formData.sku || 'SKU'}-${varSize.toUpperCase()}-${(varColorName || 'C').slice(0, 3).toUpperCase()}`
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVar]
    }));

    // Auto-select this color in image uploader for immediate convenience
    if (varColorName.trim() && !imgColorInput) {
      setImgColorInput(varColorName.trim());
    }

    setVarColorName('');
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const primaryUrl = formData.images?.find(img => img.is_primary)?.image_url 
        || formData.images?.[0]?.image_url 
        || formData.initial_image_url 
        || '';

      const payload = {
        name: formData.name,
        sku: formData.sku,
        short_description: formData.short_description,
        description: formData.description,
        price: formData.price,
        discount_price: formData.discount_price ? formData.discount_price : null,
        category: formData.category || null,
        stock: parseInt(formData.stock) || 0,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        initial_image_url: primaryUrl,
        initial_images: formData.images || [],
        initial_variants: formData.variants || []
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        showToast(`Product '${formData.name}' updated!`);
      } else {
        await createAdminProduct(payload);
        showToast(`Product '${formData.name}' created successfully with ${formData.images.length} images!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.data?.detail || err.data?.sku?.[0] || 'Failed to save product.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteAdminProduct(id);
      showToast('Product removed successfully.');
      setDeleteConfirmation(null);
      loadData();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '0.8rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            Product <span className="gradient-text">Catalog</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Add, modify pricing, upload images, and configure clothing color/size variants.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by product name, SKU, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem 0.6rem 2.4rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>Loading catalog items...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>No products found matching filters.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', backgroundColor: '#fafaf9' }}>
                  <th style={{ padding: '0.75rem' }}>Item</th>
                  <th style={{ padding: '0.75rem' }}>SKU</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Price</th>
                  <th style={{ padding: '0.75rem' }}>Stock</th>
                  <th style={{ padding: '0.75rem' }}>Variants</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={prod.primary_image}
                          alt={prod.name}
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                        />
                        {prod.images && prod.images.length > 1 && (
                          <span style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            backgroundColor: 'rgba(15, 23, 42, 0.85)',
                            color: '#ffffff',
                            fontSize: '0.62rem',
                            fontWeight: '700',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            backdropFilter: 'blur(2px)'
                          }}>
                            +{prod.images.length}
                          </span>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{prod.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.15rem' }}>
                          <span>{prod.brand_name || 'Generic'}</span>
                          {prod.images && prod.images.length > 0 && (
                            <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#d97706', padding: '0.05rem 0.35rem', borderRadius: '3px', fontSize: '0.66rem', fontWeight: '600' }}>
                              📷 {prod.images.length} {prod.images.length === 1 ? 'photo' : 'photos'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {prod.sku}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                        {prod.category_name || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{prod.current_price}</div>
                      {prod.has_discount && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{prod.price}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${prod.total_stock === 0 ? 'badge-danger' : prod.total_stock <= 5 ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.72rem' }}>
                        {prod.total_stock}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {prod.variants_count > 0 ? `${prod.variants_count} options` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${prod.is_available ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                        {prod.is_available ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditModal(prod)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(prod)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#dc2626' }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
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
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '740px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            padding: 0
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Manage basic details, color/size variants, and multiple photos per color.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    SKU Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Retail Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Discount / Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    placeholder="Optional"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                    Base Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Category Assignment
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 1. Variant Configurator Strip */}
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fafaf9',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                  <Sparkles size={14} color="var(--accent-orange)" /> 1. Color & Size Variants (Optional)
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0 0 0.6rem 0' }}>
                  Define available colors and sizes. Once added, you can upload specific multiple images for each color below!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Color Name</span>
                    <input
                      type="text"
                      placeholder="e.g. Red, Blue, Black"
                      value={varColorName}
                      onChange={(e) => setVarColorName(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Hex</span>
                    <input
                      type="color"
                      value={varColorCode}
                      onChange={(e) => setVarColorCode(e.target.value)}
                      style={{ width: '36px', height: '32px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: '2px', backgroundColor: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Size</span>
                    <select
                      value={varSize}
                      onChange={(e) => setVarSize(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="30">30</option>
                      <option value="32">32</option>
                      <option value="34">34</option>
                    </select>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Stock</span>
                    <input
                      type="number"
                      value={varStock}
                      onChange={(e) => setVarStock(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', height: '32px' }}
                  >
                    + Add
                  </button>
                </div>

                {/* Variants List */}
                {formData.variants && formData.variants.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
                    {formData.variants.map((v, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-primary)',
                          fontWeight: '600'
                        }}
                      >
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: v.color_code, display: 'inline-block' }} />
                        <strong>{v.color_name}</strong> / {v.size} ({v.stock} pcs)
                        <X
                          size={12}
                          onClick={() => handleRemoveVariant(idx)}
                          style={{ cursor: 'pointer', marginLeft: '0.2rem', color: '#dc2626' }}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Multi-Image & Color-Specific Gallery Manager */}
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fffdfa',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                    <ImageIcon size={15} color="var(--accent-orange)" /> 2. Multiple Images & Color Gallery
                  </div>
                  {formData.images && formData.images.length > 0 && (
                    <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: '700', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {formData.images.length} {formData.images.length === 1 ? 'image' : 'images'} in gallery
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
                  Add multiple photos for the product. Tag each photo to a specific color (e.g. 3 photos for Red, 3 photos for Blue) or choose "General / All Colors".
                </p>

                {/* Quick Color Presets */}
                {availableColorOptions.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Quick Tag:</span>
                    <button
                      type="button"
                      onClick={() => setImgColorInput('')}
                      style={{
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        border: imgColorInput === '' ? '1px solid var(--accent-orange)' : '1px solid var(--border-color)',
                        backgroundColor: imgColorInput === '' ? 'rgba(245, 158, 11, 0.15)' : '#ffffff',
                        color: imgColorInput === '' ? 'var(--accent-orange)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ⚪ General
                    </button>
                    {availableColorOptions.map((cName) => {
                      const isSelected = imgColorInput.toLowerCase() === cName.toLowerCase();
                      const matchedVar = formData.variants?.find(v => v.color_name?.toLowerCase() === cName.toLowerCase());
                      return (
                        <button
                          key={cName}
                          type="button"
                          onClick={() => setImgColorInput(cName)}
                          style={{
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            border: isSelected ? '1px solid var(--accent-orange)' : '1px solid var(--border-color)',
                            backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.15)' : '#ffffff',
                            color: isSelected ? 'var(--accent-orange)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: '600'
                          }}
                        >
                          {matchedVar && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: matchedVar.color_code, display: 'inline-block' }} />}
                          <span>{cName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Add Image Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto auto', gap: '0.5rem', alignItems: 'center' }}>
                  <div>
                    <input
                      type="url"
                      placeholder="Paste Image URL (e.g. https://...)"
                      value={imgUrlInput}
                      onChange={(e) => setImgUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Color (e.g. Red, Blue)"
                      value={imgColorInput}
                      onChange={(e) => setImgColorInput(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    <input
                      type="checkbox"
                      checked={imgIsPrimary}
                      onChange={(e) => setImgIsPrimary(e.target.checked)}
                    />
                    <span>Primary</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', height: '32px', whiteSpace: 'nowrap' }}
                  >
                    + Add Image
                  </button>
                </div>

                {/* Images Preview Grid */}
                {formData.images && formData.images.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem', marginTop: '0.85rem' }}>
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          border: img.is_primary ? '2px solid var(--accent-orange)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Image Preview */}
                        <div style={{ position: 'relative', width: '100%', height: '85px', backgroundColor: '#f5f5f4' }}>
                          <img
                            src={img.image_url}
                            alt={img.alt_text || `Product image ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80';
                            }}
                          />
                          {/* Trash button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              backgroundColor: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title="Remove image"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Card Info & Actions */}
                        <div style={{ padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              color: img.color_name ? '#b45309' : 'var(--text-secondary)',
                              backgroundColor: img.color_name ? 'rgba(245, 158, 11, 0.12)' : '#f5f5f4',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '3px',
                              maxWidth: '85px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {img.color_name ? `🎨 ${img.color_name}` : '⚪ General'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            style={{
                              width: '100%',
                              padding: '0.2rem 0.3rem',
                              fontSize: '0.66rem',
                              fontWeight: '700',
                              border: img.is_primary ? '1px solid var(--accent-orange)' : '1px solid var(--border-color)',
                              borderRadius: '3px',
                              backgroundColor: img.is_primary ? 'var(--accent-orange)' : '#ffffff',
                              color: img.is_primary ? '#ffffff' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <Star size={10} fill={img.is_primary ? '#ffffff' : 'none'} />
                            <span>{img.is_primary ? 'Primary Cover' : 'Set Primary'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '1rem',
                    textAlign: 'center',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem'
                  }}>
                    No images added yet. Enter an image URL and click <strong>"+ Add Image"</strong> above.
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Short Summary
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Full Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Availability toggles */}
              <div style={{ display: 'flex', gap: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  />
                  <span>Publish / Active in Storefront</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span>Feature on Home Showcase</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
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
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <AlertTriangle size={36} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Confirm Deletion</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete <strong>'{deleteConfirmation.name}'</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmation(null)} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmation.id)}
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
