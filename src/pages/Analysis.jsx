import React, { useState, useEffect, useCallback } from 'react';
import { getAnalysis } from '../services/api';

const Analysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date Filter State
  const [filterType, setFilterType] = useState('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active Tab View State
  const [activeTab, setActiveTab] = useState('PROFIT'); // 'PROFIT', 'SALES', 'PRODUCTS', 'CATEGORIES', 'PURCHASES_EXPENSES', 'INVENTORY'

  const fetchAnalysisData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { filterType };
      if (filterType === 'CUSTOM') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      const summary = await getAnalysis(params);
      setData(summary);
    } catch (err) {
      console.error("Error loading analysis data:", err);
      setError(err.response?.data?.message || "Failed to load business analysis.");
    } finally {
      setLoading(false);
    }
  }, [filterType, startDate, endDate]);

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const handleCustomApply = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select both Start Date and End Date for custom date range.");
      return;
    }
    fetchAnalysisData();
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Calculating business performance analytics...
      </div>
    );
  }

  const {
    startDate: activeStart = '',
    endDate: activeEnd = '',
    salesRevenue = '0.00',
    totalProductCost = '0.00',
    grossProfit = '0.00',
    totalExpenses = '0.00',
    netProfit = '0.00',
    salesCount = 0,
    salesTrend = [],
    topProductsByRevenue = [],
    topProductsByProfit = [],
    revenueByCategory = [],
    totalPurchaseAmount = '0.00',
    purchaseCount = 0,
    purchaseTrend = [],
    totalExpenseAmount = '0.00',
    expenseCount = 0,
    expensesByCategory = [],
    totalCurrentStock = 0,
    inStockCount = 0,
    lowStockCount = 0,
    outOfStockCount = 0,
    outOfStockProducts = []
  } = data || {};

  const grossProfitNum = parseFloat(grossProfit) || 0;
  const netProfitNum = parseFloat(netProfit) || 0;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}
      {/* Page Title & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Business Analysis</h1>
          <p className="page-description" style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Comprehensive P&L analysis, sales revenue, product profits, category breakdown, and stock performance.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { label: "Today", value: "TODAY" },
            { label: "This Week", value: "THIS_WEEK" },
            { label: "This Month", value: "THIS_MONTH" },
            { label: "This Year", value: "THIS_YEAR" },
            { label: "Custom Range", value: "CUSTOM" }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: filterType === f.value ? 600 : 400,
                border: filterType === f.value ? '1px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: filterType === f.value ? '#eff6ff' : '#ffffff',
                color: filterType === f.value ? '#2563eb' : '#475569',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker inputs if CUSTOM is selected */}
      {filterType === 'CUSTOM' && (
        <form onSubmit={handleCustomApply} style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginRight: '0.5rem' }}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginRight: '0.5rem' }}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: '0.45rem 1rem', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Apply Filter
          </button>
        </form>
      )}

      {/* Active Filter Period Banner */}
      <div style={{ backgroundColor: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
        <span>Analysis Period: <strong>{activeStart}</strong> to <strong>{activeEnd}</strong></span>
        <span>Filter: <strong>{filterType}</strong></span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem', gap: '1rem' }}>
        {[
          { key: 'PROFIT', label: 'Profit & Loss' },
          { key: 'SALES', label: 'Sales Analysis' },
          { key: 'PRODUCTS', label: 'Product Profitability' },
          { key: 'CATEGORIES', label: 'Category Analysis' },
          { key: 'PURCHASES_EXPENSES', label: 'Purchases & Expenses' },
          { key: 'INVENTORY', label: 'Inventory Analysis' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 0.5rem',
              border: 'none',
              background: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? '#2563eb' : '#64748b',
              borderBottom: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFIT ANALYSIS */}
      {activeTab === 'PROFIT' && (
        <div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Profit & Loss Financial Summary</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Sales Revenue</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>₹{parseFloat(salesRevenue).toFixed(2)}</div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>Total Product Cost</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626', marginTop: '0.25rem' }}>-₹{parseFloat(totalProductCost).toFixed(2)}</div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>Gross Profit</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: grossProfitNum >= 0 ? '#1d4ed8' : '#dc2626', marginTop: '0.25rem' }}>
                  ₹{grossProfitNum.toFixed(2)}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                <span style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 600 }}>Operating Expenses</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c2410c', marginTop: '0.25rem' }}>-₹{parseFloat(totalExpenses).toFixed(2)}</div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: netProfitNum >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '6px', border: netProfitNum >= 0 ? '2px solid #22c55e' : '2px solid #ef4444' }}>
                <span style={{ fontSize: '0.8rem', color: netProfitNum >= 0 ? '#166534' : '#991b1b', fontWeight: 700 }}>Net Profit</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: netProfitNum >= 0 ? '#15803d' : '#dc2626', marginTop: '0.25rem' }}>
                  {netProfitNum >= 0 ? `₹${netProfitNum.toFixed(2)}` : `-₹${Math.abs(netProfitNum).toFixed(2)}`}
                </div>
              </div>
            </div>

            {/* Profit Calculation Formula Explanation */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569' }}>
              <strong style={{ color: '#0f172a' }}>Profit Calculation Formula Breakdown:</strong>
              <ul style={{ marginTop: '0.5rem', marginLeft: '1.2rem' }}>
                <li><strong>Product Cost:</strong> Sum of (Cost Price × Quantity Sold) for all sales in selected period.</li>
                <li><strong>Gross Profit:</strong> Sales Revenue - Total Product Cost.</li>
                <li><strong>Net Profit:</strong> Gross Profit - Operating Expenses.</li>
                <li><strong>Individual Product Profit:</strong> (Selling Price - Cost Price) × Quantity Sold.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALES ANALYSIS */}
      {activeTab === 'SALES' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Sales Revenue Trend & Summary</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Total Sales Recorded: <strong>{salesCount}</strong> | Total Revenue: <strong>₹{parseFloat(salesRevenue).toFixed(2)}</strong></p>

          <h4 style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '0.75rem' }}>Daily Sales Trend</h4>
          {salesTrend.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No sales recorded in the selected period.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.6rem 0.8rem' }}>Date</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesTrend.map((st) => (
                  <tr key={st.date} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 500 }}>{st.date}</td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{parseFloat(st.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: PRODUCT PROFITABILITY */}
      {activeTab === 'PRODUCTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          
          {/* Top Products by Profit */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Products Generating Most Profit</h3>
            {topProductsByProfit.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No product sales recorded in period.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.5rem 0' }}>Product</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Units</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsByProfit.map((p) => (
                    <tr key={p.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem 0', fontWeight: 600 }}>{p.productName}</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'center' }}>{p.quantitySold}</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>₹{parseFloat(p.profit).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Top Products by Revenue */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Top Products by Revenue</h3>
            {topProductsByRevenue.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No product sales recorded in period.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.5rem 0' }}>Product</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Units</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsByRevenue.map((p) => (
                    <tr key={p.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem 0', fontWeight: 600 }}>{p.productName}</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'center' }}>{p.quantitySold}</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>₹{parseFloat(p.revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY ANALYSIS */}
      {activeTab === 'CATEGORIES' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Revenue & Sales Volume by Category</h3>
          {revenueByCategory.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No category sales data for selected period.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.6rem 0.8rem' }}>Category</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Transactions Count</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueByCategory.map((c) => (
                  <tr key={c.categoryName} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600, color: '#0f172a' }}>{c.categoryName}</td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>{c.itemCount}</td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{parseFloat(c.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 5: PURCHASES & EXPENSES */}
      {activeTab === 'PURCHASES_EXPENSES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Purchase Analysis */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Purchases Restock Analysis</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Total Orders: <strong>{purchaseCount}</strong> | Total Spend: <strong style={{ color: '#0284c7' }}>₹{parseFloat(totalPurchaseAmount).toFixed(2)}</strong></p>
            {purchaseTrend.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No restock purchases in period.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.5rem 0' }}>Date</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Purchase Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseTrend.map((pt) => (
                    <tr key={pt.date} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>{pt.date}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>₹{parseFloat(pt.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Expense Analysis */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Operating Expenses Analysis</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Total Expense Records: <strong>{expenseCount}</strong> | Total Spend: <strong style={{ color: '#dc2626' }}>₹{parseFloat(totalExpenseAmount).toFixed(2)}</strong></p>
            {expensesByCategory.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No expenses recorded in period.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.5rem 0' }}>Expense Category</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesByCategory.map((ec) => (
                    <tr key={ec.categoryName} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>{ec.categoryName}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹{parseFloat(ec.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: INVENTORY ANALYSIS */}
      {activeTab === 'INVENTORY' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Current Stock Units</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{totalCurrentStock}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>In-Stock Products</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', marginTop: '0.25rem' }}>{inStockCount}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Low-Stock Products</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ea580c', marginTop: '0.25rem' }}>{lowStockCount}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Out-of-Stock Products</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626', marginTop: '0.25rem' }}>{outOfStockCount}</div>
            </div>
          </div>

          {/* Out of Stock Table */}
          {outOfStockProducts.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #fca5a5', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.75rem' }}>🚨 Out-of-Stock Products ({outOfStockCount})</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #fee2e2', color: '#991b1b' }}>
                    <th style={{ padding: '0.4rem 0' }}>Product Name</th>
                    <th style={{ padding: '0.4rem 0' }}>Category</th>
                    <th style={{ padding: '0.4rem 0' }}>Min Stock Level</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStockProducts.map((p) => (
                    <tr key={p.productId} style={{ borderBottom: '1px solid #fef2f2' }}>
                      <td style={{ padding: '0.5rem 0', fontWeight: 600, color: '#991b1b' }}>{p.productName}</td>
                      <td style={{ padding: '0.5rem 0' }}>{p.categoryName}</td>
                      <td style={{ padding: '0.5rem 0' }}>{p.minStockLevel} {p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;
