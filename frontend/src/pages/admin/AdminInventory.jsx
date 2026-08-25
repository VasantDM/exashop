import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  Check, 
  RotateCcw,
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';
import { getAdminInventory, quickUpdateAdminStock } from '../../services/adminService';

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminInventory({ search, low_stock: lowStockOnly });
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [lowStockOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadInventory();
  };

  const handleAdjustStock = async (item, delta) => {
    setUpdatingId(`${item.is_variant ? 'v' : 'p'}-${item.id}`);
    try {
      const res = await quickUpdateAdminStock({
        id: item.id,
        is_variant: item.is_variant,
        delta
      });
      // update local state
      setItems((prev) =>
        prev.map((it) => {
          if (it.id === item.id && it.is_variant === item.is_variant) {
            const newStock = res.stock;
            return {
              ...it,
              stock: newStock,
              is_low_stock: newStock <= 5,
              is_out_of_stock: newStock <= 0
            };
          }
          return it;
        })
      );
      showToast(`Stock updated to ${res.stock}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to adjust stock', 'error');
    } finally {
      setUpdatingId(null);
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
          backgroundColor: toast.type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
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
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0 }}>
            Inventory & <span className="gradient-text">Stock Radar</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Live SKU tracking across base catalog products and apparel color/size variants.
          </p>
        </div>

        <button onClick={loadInventory} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}>
          <RotateCcw size={14} /> Refresh Stock
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by product name, color, size, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem 0.6rem 2.4rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </form>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          padding: '0.5rem 0.9rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: lowStockOnly ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface)',
          border: lowStockOnly ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
          color: lowStockOnly ? 'var(--accent-amber)' : 'var(--text-secondary)'
        }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          <span style={{ fontWeight: '600' }}>⚠️ Low Stock Only (≤ 5 units)</span>
        </label>
      </div>

      {/* Inventory Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>Scanning inventory levels...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>No items found for this filter.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Item & Variant</th>
                  <th style={{ padding: '0.75rem' }}>SKU</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Price</th>
                  <th style={{ padding: '0.75rem' }}>Current Stock</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isBusy = updatingId === `${item.is_variant ? 'v' : 'p'}-${item.id}`;
                  return (
                    <tr key={`${item.is_variant ? 'v' : 'p'}-${item.id}`} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: '#ffffff' }}>{item.name}</div>
                          {item.is_variant && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color_code, display: 'inline-block' }} />
                              <span>Color: {item.color_name} • Size: {item.size}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {item.sku}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>
                        {item.category}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: '#ffffff' }}>
                        ₹{item.price}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '800', color: item.is_out_of_stock ? 'var(--accent-rose)' : item.is_low_stock ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                          {item.stock}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>units</span>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span className={`badge ${item.is_out_of_stock ? 'badge-danger' : item.is_low_stock ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.72rem' }}>
                          {item.is_out_of_stock ? 'Out of Stock' : item.is_low_stock ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleAdjustStock(item, -5)}
                            disabled={isBusy || item.stock < 5}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            title="Remove 5 units"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item, -1)}
                            disabled={isBusy || item.stock < 1}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            title="Remove 1 unit"
                          >
                            <Minus size={12} />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item, 1)}
                            disabled={isBusy}
                            className="btn btn-primary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            title="Add 1 unit"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item, 10)}
                            disabled={isBusy}
                            className="btn btn-primary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            title="Restock 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
