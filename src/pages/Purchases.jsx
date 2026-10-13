import React, { useState, useEffect, useCallback } from 'react';
import { getPurchases, recordPurchase, getProducts } from '../services/api';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    quantityPurchased: '1',
    costPrice: '',
    updateProductCostPrice: true
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load Purchases and Products data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [purchasesData, productsData] = await Promise.all([
        getPurchases(),
        getProducts()
      ]);
      setPurchases(purchasesData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error("Error loading purchase data:", err);
      setError(err.response?.data?.message || "Failed to load purchases and products data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Selected product details for dynamic preview
  const selectedProduct = products.find(p => String(p.id) === String(purchaseForm.productId));
  const currentStock = selectedProduct ? (selectedProduct.quantity || 0) : 0;
  const qtyPurchasedNum = parseInt(purchaseForm.quantityPurchased, 10) || 0;
  const costPriceNum = parseFloat(purchaseForm.costPrice) || 0;
  const computedTotal = (qtyPurchasedNum > 0 && costPriceNum > 0) ? (qtyPurchasedNum * costPriceNum).toFixed(2) : '0.00';
  const newStockPreview = currentStock + (qtyPurchasedNum > 0 ? qtyPurchasedNum : 0);

  // Handle Product Selection Change in Form
  const handleProductChange = (e) => {
    const pId = e.target.value;
    const prod = products.find(p => String(p.id) === String(pId));
    setPurchaseForm({
      productId: pId,
      quantityPurchased: '1',
      costPrice: prod ? String(prod.costPrice) : '',
      updateProductCostPrice: true
    });
    setModalError('');
  };

  // Open Modal
  const handleOpenPurchaseModal = () => {
    setModalError('');
    if (products.length > 0) {
      const firstProd = products[0];
      setPurchaseForm({
        productId: String(firstProd.id),
        quantityPurchased: '1',
        costPrice: String(firstProd.costPrice),
        updateProductCostPrice: true
      });
    } else {
      setPurchaseForm({ productId: '', quantityPurchased: '1', costPrice: '', updateProductCostPrice: true });
    }
    setShowPurchaseModal(true);
  };

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setModalError('');
  };

  // Submit Purchase
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setError('');
    setSuccess('');

    if (!purchaseForm.productId) {
      setModalError("Please select a product.");
      return;
    }

    if (qtyPurchasedNum <= 0) {
      setModalError("Quantity purchased must be greater than zero.");
      return;
    }

    if (costPriceNum <= 0) {
      setModalError("Cost price must be greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      const createdPurchase = await recordPurchase({
        productId: Number(purchaseForm.productId),
        quantityPurchased: qtyPurchasedNum,
        costPrice: costPriceNum,
        updateProductCostPrice: purchaseForm.updateProductCostPrice
      });

      setSuccess(`Purchase recorded for '${createdPurchase.productName}'! Total Spend: ₹${createdPurchase.totalAmount}. Inventory increased by +${qtyPurchasedNum}.`);
      setShowPurchaseModal(false);
      fetchData();
    } catch (err) {
      console.error("Error recording purchase:", err);
      setModalError(err.response?.data?.message || "Failed to record purchase.");
    } finally {
      setSubmitting(false);
    }
  };

  // KPI Calculations
  const totalPurchasesCount = purchases.length;
  const totalSpend = purchases.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0).toFixed(2);
  const totalUnitsPurchased = purchases.reduce((acc, curr) => acc + (parseInt(curr.quantityPurchased, 10) || 0), 0);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Purchase Management</h1>
          <p className="page-description" style={{ color: '#64748b', marginTop: '0.25rem' }}>Record inventory purchases and restock products.</p>
        </div>
        <button
          onClick={handleOpenPurchaseModal}
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
          <span>+</span> Record Purchase
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
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Restock Orders</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{totalPurchasesCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Purchase Spend</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0284c7', marginTop: '0.5rem' }}>₹{totalSpend}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Restocked Units</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a', marginTop: '0.5rem' }}>+{totalUnitsPurchased}</div>
        </div>
      </div>

      {/* Purchase Log Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600, color: '#334155' }}>
          Purchase Order History
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading purchases...</div>
        ) : purchases.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No restock purchases recorded yet. Click <strong>"+ Record Purchase"</strong> to add stock.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Working Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem' }}>Quantity Restocked</th>
                <th style={{ padding: '0.75rem 1rem' }}>Cost Price / Unit</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Purchase Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((pur) => (
                <tr key={pur.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#334155' }}>{pur.workingDate}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{pur.productName}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#16a34a' }}>+{pur.quantityPurchased}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>₹{parseFloat(pur.costPrice).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0284c7' }}>₹{parseFloat(pur.totalAmount).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(pur.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Purchase Modal */}
      {showPurchaseModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Record Restock Purchase</h3>
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

            <form onSubmit={handlePurchaseSubmit}>
              {/* Product Select */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Select Product</label>
                <select
                  value={purchaseForm.productId}
                  onChange={handleProductChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.quantity} {p.unit} | Cost Price: ₹{p.costPrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Preview Box */}
              {selectedProduct && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#334155',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Current Stock: <strong>{currentStock} {selectedProduct.unit}</strong></span>
                  <span>New Stock Preview: <strong style={{ color: '#16a34a' }}>{newStockPreview} {selectedProduct.unit}</strong></span>
                </div>
              )}

              {/* Quantity Purchased Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Quantity Purchased</label>
                <input
                  type="number"
                  min="1"
                  value={purchaseForm.quantityPurchased}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, quantityPurchased: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* Cost Price Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Cost Price Per Unit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={purchaseForm.costPrice}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, costPrice: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* Option to Update Product's Cost Price */}
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="updateCostPriceCb"
                  checked={purchaseForm.updateProductCostPrice}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, updateProductCostPrice: e.target.checked })}
                />
                <label htmlFor="updateCostPriceCb" style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Update product's default cost price to this new purchase price
                </label>
              </div>

              {/* Live Calculated Total Purchase Amount */}
              {selectedProduct && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: '#0369a1',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  Total Purchase Amount: ₹{computedTotal}
                </div>
              )}

              {/* Modal Action Buttons */}
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
                  disabled={submitting || qtyPurchasedNum <= 0 || costPriceNum <= 0}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: (submitting || qtyPurchasedNum <= 0 || costPriceNum <= 0) ? 'not-allowed' : 'pointer',
                    opacity: (submitting || qtyPurchasedNum <= 0 || costPriceNum <= 0) ? 0.6 : 1
                  }}
                >
                  {submitting ? "Saving..." : "Record Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
