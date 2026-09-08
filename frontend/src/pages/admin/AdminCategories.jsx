import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { 
  getAdminCategories, 
  createAdminCategory, 
  updateAdminCategory, 
  deleteAdminCategory 
} from '../../services/adminService';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [toast, setToast] = useState(null);

  const initialForm = {
    name: '',
    slug: '',
    description: '',
    icon: 'Sparkles',
    parent: '',
    is_active: true
  };
  const [formData, setFormData] = useState(initialForm);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminCategories();
      setCategories(data.results || data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'Sparkles',
      parent: cat.parent || '',
      is_active: cat.is_active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        parent: formData.parent ? formData.parent : null,
        is_active: formData.is_active
      };

      if (editingCat) {
        await updateAdminCategory(editingCat.id, payload);
        showToast(`Category '${formData.name}' updated!`);
      } else {
        await createAdminCategory(payload);
        showToast(`Category '${formData.name}' created!`);
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
      showToast('Error saving category', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdminCategory(id);
      showToast('Category deleted successfully');
      setDeleteConfirmation(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      showToast('Could not delete category', 'error');
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          zIndex: 99999,
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
            Category <span className="gradient-text">Hierarchies</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Structure store taxonomy, parent groupings, and subcategories.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
          <Plus size={16} /> Add New Category
        </button>
      </div>

      {/* Categories Grid / Cards */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>No categories configured yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-orange)'
                      }}>
                        <Layers size={16} />
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                        {cat.name}
                      </h3>
                    </div>

                    <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                      {cat.products_count || 0} Products
                    </span>
                  </div>

                  {cat.parent_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Parent: <strong style={{ color: 'var(--text-secondary)' }}>{cat.parent_name}</strong>
                    </div>
                  )}

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: cat.is_active ? '#059669' : '#dc2626', fontWeight: '600' }}>
                    ● {cat.is_active ? 'Active' : 'Inactive'}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => openEditModal(cat)}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Edit Category"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmation(cat)}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#dc2626' }}
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
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
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%)'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                {editingCat ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Category Name *
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
                  Parent Category (Optional)
                </label>
                <select
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.filter(c => !editingCat || c.id !== editingCat.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span>Active in Store Navigation</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCat ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Delete Category</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>'{deleteConfirmation.name}'</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmation(null)} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation.id)}
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
