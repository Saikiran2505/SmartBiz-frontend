import React, { useState, useEffect, useCallback } from 'react';
import { getSales, recordSale, getProducts } from '../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState({
    productId: '',
    quantitySold: '1',
    sellingPrice: ''
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Sales and Available Products
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [salesData, productsData] = await Promise.all([
        getSales(),
        getProducts()
      ]);
      setSales(salesData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error("Error loading sales data:", err);
      setError(err.response?.data?.message || "Failed to load sales and products data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Selected product details for dynamic preview
  const selectedProduct = products.find(p => String(p.id) === String(saleForm.productId));
  const availableStock = selectedProduct ? (selectedProduct.quantity || 0) : 0;
  const qtySoldNum = parseInt(saleForm.quantitySold, 10) || 0;
  const priceNum = parseFloat(saleForm.sellingPrice) || 0;
  const computedTotal = (qtySoldNum > 0 && priceNum > 0) ? (qtySoldNum * priceNum).toFixed(2) : '0.00';

  // Handle Product Selection Change in Form
  const handleProductChange = (e) => {
    const pId = e.target.value;
    const prod = products.find(p => String(p.id) === String(pId));
    setSaleForm({
      productId: pId,
      quantitySold: '1',
      sellingPrice: prod ? String(prod.sellingPrice) : ''
    });
    setModalError('');
  };

  // Open Modal
  const handleOpenSaleModal = () => {
    setModalError('');
    if (products.length > 0) {
      const firstProd = products[0];
      setSaleForm({
        productId: String(firstProd.id),
        quantitySold: '1',
        sellingPrice: String(firstProd.sellingPrice)
      });
    } else {
      setSaleForm({ productId: '', quantitySold: '1', sellingPrice: '' });
    }
    setShowSaleModal(true);
  };

  const handleCloseModal = () => {
    setShowSaleModal(false);
    setModalError('');
  };

  // Submit Sale
  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setError('');
    setSuccess('');

    if (!saleForm.productId) {
      setModalError("Please select a product.");
      return;
    }

    if (qtySoldNum <= 0) {
      setModalError("Quantity sold must be greater than zero.");
      return;
    }

    if (qtySoldNum > availableStock) {
      setModalError(`Quantity sold (${qtySoldNum}) exceeds available stock (${availableStock}).`);
      return;
    }

    if (priceNum <= 0) {
      setModalError("Selling price must be a valid positive amount.");
      return;
    }

    setSubmitting(true);

    try {
      const createdSale = await recordSale({
        productId: Number(saleForm.productId),
        quantitySold: qtySoldNum,
        sellingPrice: priceNum
      });

      setSuccess(`Sale recorded successfully for '${createdSale.productName}'! Total: ₹${createdSale.totalAmount}. Stock reduced.`);
      setShowSaleModal(false);
      fetchData();
    } catch (err) {
      console.error("Error recording sale:", err);
      setModalError(err.response?.data?.message || "Failed to record sale.");
    } finally {
      setSubmitting(false);
    }
  };

  // KPI Calculations
  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0).toFixed(2);
  const totalUnitsSold = sales.reduce((acc, curr) => acc + (parseInt(curr.quantitySold, 10) || 0), 0);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Sales Management</h1>
          <p className="page-description" style={{ color: '#64748b', marginTop: '0.25rem' }}>Record product sales transactions and monitor total revenue.</p>
        </div>
        <button
          onClick={handleOpenSaleModal}
          disabled={products.length === 0}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.6rem 1.2rem',
            fontWeight: 600,
            cursor: products.length === 0 ? 'not-allowed' : 'pointer',
            opacity: products.length === 0 ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>+</span> Record Sale
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
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Sales Recorded</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{totalSalesCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Revenue</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a', marginTop: '0.5rem' }}>₹{totalRevenue}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Units Sold</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '0.5rem' }}>{totalUnitsSold}</div>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600, color: '#334155' }}>
          Sales History Log
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading sales...</div>
        ) : sales.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No sales recorded yet. Click <strong>"+ Record Sale"</strong> to create your first sale transaction.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Working Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem' }}>Quantity Sold</th>
                <th style={{ padding: '0.75rem 1rem' }}>Selling Price</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#334155' }}>{sale.workingDate}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{sale.productName}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#2563eb' }}>{sale.quantitySold}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>₹{parseFloat(sale.sellingPrice).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#16a34a' }}>₹{parseFloat(sale.totalAmount).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(sale.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Sale Modal */}
      {showSaleModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Record New Sale</h3>
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

            <form onSubmit={handleSaleSubmit}>
              {/* Product Select */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Select Product</label>
                <select
                  value={saleForm.productId}
                  onChange={handleProductChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity} {p.unit} | ₹{p.sellingPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Info Box */}
              {selectedProduct && (
                <div style={{
                  backgroundColor: availableStock === 0 ? '#fef2f2' : '#f8fafc',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  border: availableStock === 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: availableStock === 0 ? '#991b1b' : '#334155',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Available Stock: <strong>{availableStock} {selectedProduct.unit}</strong></span>
                  <span>Unit Price: <strong>₹{selectedProduct.sellingPrice}</strong></span>
                </div>
              )}

              {/* Quantity Sold Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Quantity Sold</label>
                <input
                  type="number"
                  min="1"
                  max={availableStock}
                  value={saleForm.quantitySold}
                  onChange={(e) => setSaleForm({ ...saleForm, quantitySold: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* Selling Price Input (Historical Price Persistence) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Selling Price (Per Unit)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={saleForm.sellingPrice}
                  onChange={(e) => setSaleForm({ ...saleForm, sellingPrice: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* Live Calculated Total Amount */}
              {selectedProduct && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  backgroundColor: qtySoldNum > availableStock ? '#fef2f2' : '#f0fdf4',
                  border: qtySoldNum > availableStock ? '1px solid #fca5a5' : '1px solid #86efac',
                  color: qtySoldNum > availableStock ? '#991b1b' : '#166534',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  Total Amount: ₹{computedTotal}
                  {qtySoldNum > availableStock && (
                    <div style={{ fontWeight: 400, marginTop: '0.25rem', color: '#dc2626', fontSize: '0.8rem' }}>
                      Error: Cannot sell more than available stock ({availableStock}).
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
                  disabled={submitting || qtySoldNum > availableStock || qtySoldNum <= 0 || availableStock === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: (submitting || qtySoldNum > availableStock || qtySoldNum <= 0 || availableStock === 0) ? 'not-allowed' : 'pointer',
                    opacity: (submitting || qtySoldNum > availableStock || qtySoldNum <= 0 || availableStock === 0) ? 0.6 : 1
                  }}
                >
                  {submitting ? "Processing..." : "Confirm Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
