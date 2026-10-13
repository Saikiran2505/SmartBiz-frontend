import React, { useState, useEffect, useCallback } from 'react';
import { getInventory, adjustStock, getInventoryHistory } from '../services/api';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    quantityChange: '',
    reason: 'Stock-count correction'
  });
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch Inventory Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [invData, histData] = await Promise.all([
        getInventory(),
        getInventoryHistory()
      ]);
      setInventory(invData || []);
      setHistory(histData || []);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError(err.response?.data?.message || "Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Modal for specific product or blank
  const handleOpenAdjustModal = (productId = '') => {
    setModalError('');
    setAdjustForm({
      productId: productId ? String(productId) : (inventory.length > 0 ? String(inventory[0].productId) : ''),
      quantityChange: '',
      reason: 'Stock-count correction'
    });
    setShowAdjustModal(true);
  };

  const handleCloseModal = () => {
    setShowAdjustModal(false);
    setModalError('');
  };

  // Find selected product info for dynamic preview
  const selectedProduct = inventory.find(
    item => String(item.productId) === String(adjustForm.productId)
  );

  const currentQty = selectedProduct ? selectedProduct.quantity : 0;
  const changeVal = parseInt(adjustForm.quantityChange, 10) || 0;
  const newQty = currentQty + changeVal;

  // Submit Stock Adjustment
  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setError('');
    setSuccess('');

    if (!adjustForm.productId) {
      setModalError("Please select a product.");
      return;
    }

    if (!adjustForm.quantityChange || changeVal === 0) {
      setModalError("Quantity change must be a non-zero integer.");
      return;
    }

    if (newQty < 0) {
      setModalError(`Stock cannot become negative. Current stock is ${currentQty}, change requested is ${changeVal}.`);
      return;
    }

    if (!adjustForm.reason.trim()) {
      setModalError("Reason is required.");
      return;
    }

    setAdjustSubmitting(true);

    try {
      await adjustStock({
        productId: Number(adjustForm.productId),
        quantityChange: changeVal,
        reason: adjustForm.reason.trim()
      });

      setSuccess(`Stock adjusted successfully for '${selectedProduct?.productName}'. New stock: ${newQty} ${selectedProduct?.unit || ''}.`);
      setShowAdjustModal(false);
      fetchData();
    } catch (err) {
      console.error("Adjustment error:", err);
      setModalError(err.response?.data?.message || "Failed to adjust stock.");
    } finally {
      setAdjustSubmitting(false);
    }
  };

  // Filtered inventory list
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'IN_STOCK') return matchesSearch && item.status === 'In Stock';
    if (statusFilter === 'LOW_STOCK') return matchesSearch && item.status === 'Low Stock';
    if (statusFilter === 'OUT_OF_STOCK') return matchesSearch && item.status === 'Out of Stock';
    
    return matchesSearch;
  });

  // Calculate summary counts
  const totalProducts = inventory.length;
  const inStockCount = inventory.filter(i => i.status === 'In Stock').length;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'Out of Stock').length;

  // Render status badge helper
  const renderStatusBadge = (status) => {
    if (status === 'In Stock') {
      return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#15803d' }}>In Stock</span>;
    }
    if (status === 'Low Stock') {
      return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#ffedd5', color: '#c2410c' }}>Low Stock</span>;
    }
    return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#b91c1c' }}>Out of Stock</span>;
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Inventory Management</h1>
          <p className="page-description" style={{ color: '#64748b', marginTop: '0.25rem' }}>Track real-time stock levels, monitor low-stock alerts, and perform manual adjustments.</p>
        </div>
        <button
          onClick={() => handleOpenAdjustModal()}
          disabled={inventory.length === 0}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.6rem 1.2rem',
            fontWeight: 600,
            cursor: inventory.length === 0 ? 'not-allowed' : 'pointer',
            opacity: inventory.length === 0 ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>+</span> Adjust Stock
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e', color: '#166534', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Products</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{totalProducts}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>In Stock</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a', marginTop: '0.5rem' }}>{inStockCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Low Stock</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ea580c', marginTop: '0.5rem' }}>{lowStockCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Out of Stock</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#dc2626', marginTop: '0.5rem' }}>{outOfStockCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search product or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            width: '280px'
          }}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: statusFilter === st ? 600 : 400,
                border: statusFilter === st ? '1px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: statusFilter === st ? '#eff6ff' : '#ffffff',
                color: statusFilter === st ? '#2563eb' : '#475569',
                cursor: 'pointer'
              }}
            >
              {st === 'ALL' ? 'All' : st === 'IN_STOCK' ? 'In Stock' : st === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading inventory...</div>
        ) : filteredInventory.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            {inventory.length === 0 ? "No products found. Please add products in the Products tab first." : "No products match your filter criteria."}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Current Stock</th>
                <th style={{ padding: '0.75rem 1rem' }}>Unit</th>
                <th style={{ padding: '0.75rem 1rem' }}>Min Stock</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{item.productName}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{item.categoryName}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: item.quantity === 0 ? '#dc2626' : '#0f172a' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{item.unit}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{item.minStockLevel}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{renderStatusBadge(item.status)}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenAdjustModal(item.productId)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stock Adjustment History Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Stock Adjustment Audit Log</h3>
        {history.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No manual stock adjustments recorded yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>Working Date</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Product</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Change</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Reason</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.6rem 0.8rem', fontWeight: 500 }}>{log.workingDate}</td>
                  <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#0f172a' }}>{log.productName}</td>
                  <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: log.quantityChange > 0 ? '#16a34a' : '#dc2626' }}>
                    {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                  </td>
                  <td style={{ padding: '0.6rem 0.8rem', color: '#475569' }}>{log.reason}</td>
                  <td style={{ padding: '0.6rem 0.8rem', color: '#94a3b8' }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual Stock Adjustment Modal */}
      {showAdjustModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '480px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', pb: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Manual Stock Adjustment</h3>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '0.6rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit}>
              {/* Product Select */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Select Product</label>
                <select
                  value={adjustForm.productId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="">-- Choose Product --</option>
                  {inventory.map((item) => (
                    <option key={item.productId} value={item.productId}>
                      {item.productName} (Current: {item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Stock Summary */}
              {selectedProduct && (
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current Quantity: <strong>{currentQty} {selectedProduct.unit}</strong></span>
                  <span>Min Stock: <strong>{selectedProduct.minStockLevel} {selectedProduct.unit}</strong></span>
                </div>
              )}

              {/* Quantity Change Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Quantity Change (+ / -)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10 or -5"
                  value={adjustForm.quantityChange}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Use positive numbers to add stock (e.g. 10) and negative numbers to reduce stock (e.g. -5).
                </span>
              </div>

              {/* Preset Adjustment Quick Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {[1, 5, 10, -1, -5, -10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, quantityChange: String(val) })}
                    style={{
                      flex: 1,
                      padding: '0.3rem',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9',
                      color: val > 0 ? '#15803d' : '#b91c1c',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>

              {/* Reason Select */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Reason</label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="Stock-count correction">Stock-count correction</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Calculated New Stock Live Preview */}
              {selectedProduct && adjustForm.quantityChange !== '' && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  backgroundColor: newQty < 0 ? '#fef2f2' : '#f0fdf4',
                  border: newQty < 0 ? '1px solid #fca5a5' : '1px solid #86efac',
                  color: newQty < 0 ? '#991b1b' : '#166534',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  Calculated New Stock: {newQty} {selectedProduct.unit}
                  {newQty < 0 && (
                    <div style={{ fontWeight: 400, marginTop: '0.25rem', color: '#dc2626' }}>
                      Error: Stock can NEVER become negative.
                    </div>
                  )}
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting || newQty < 0 || !adjustForm.quantityChange}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: (adjustSubmitting || newQty < 0 || !adjustForm.quantityChange) ? 'not-allowed' : 'pointer',
                    opacity: (adjustSubmitting || newQty < 0 || !adjustForm.quantityChange) ? 0.6 : 1
                  }}
                >
                  {adjustSubmitting ? "Saving..." : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
