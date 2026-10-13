import React, { useState, useEffect, useCallback } from 'react';
import { getReport, downloadReportExcel, downloadReportPdf } from '../services/api';

const Reports = () => {
  const [reportType, setReportType] = useState('SALES');
  const [filterType, setFilterType] = useState('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { reportType, filterType };
      if (filterType === 'CUSTOM') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      const response = await getReport(params);
      setData(response);
    } catch (err) {
      console.error("Error loading report:", err);
      setError(err.response?.data?.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, [reportType, filterType, startDate, endDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleCustomApply = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select both Start Date and End Date.");
      return;
    }
    fetchReportData();
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const params = { reportType, filterType };
      if (filterType === 'CUSTOM') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      await downloadReportExcel(params);
    } catch (err) {
      console.error("Excel download error:", err);
      alert("Failed to download Excel report.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const params = { reportType, filterType };
      if (filterType === 'CUSTOM') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      await downloadReportPdf(params);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  const renderReportContent = () => {
    if (loading && !data) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Generating report...</div>;
    }

    if (!data) return null;

    const { salesReport, purchaseReport, expenseReport, profitReport, inventoryReport } = data;

    switch (reportType) {
      case 'SALES':
        return (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#334155' }}>
              Sales Report ({salesReport?.length || 0} Transactions)
            </div>
            {salesReport?.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No sales records found for selected period.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Quantity</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Selling Price</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{s.workingDate}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{s.productName}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#2563eb', fontWeight: 600 }}>{s.quantitySold}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>₹{parseFloat(s.sellingPrice).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{parseFloat(s.totalAmount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'PURCHASE':
        return (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#334155' }}>
              Purchase Restock Report ({purchaseReport?.length || 0} Orders)
            </div>
            {purchaseReport?.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No purchase records found for selected period.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Quantity</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Cost Price</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseReport.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{p.workingDate}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{p.productName}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 600 }}>+{p.quantityPurchased}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>₹{parseFloat(p.costPrice).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>₹{parseFloat(p.totalAmount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'EXPENSE':
        return (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#334155' }}>
              Expense Report ({expenseReport?.length || 0} Records)
            </div>
            {expenseReport?.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No expense records found for selected period.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseReport.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{e.workingDate}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{e.categoryName}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#dc2626' }}>₹{parseFloat(e.amount).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{e.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case 'PROFIT': {
        const pr = profitReport || {};
        const rev = parseFloat(pr.revenue || 0);
        const cost = parseFloat(pr.productCost || 0);
        const gross = parseFloat(pr.grossProfit || 0);
        const exp = parseFloat(pr.expenses || 0);
        const net = parseFloat(pr.netProfit || 0);

        return (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Profit Statement Report</h3>
            
            <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: '#166534' }}>Revenue (Sales)</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>₹{rev.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: '#991b1b' }}>Product Cost</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>- ₹{cost.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#eff6ff', borderRadius: '6px', borderLeft: '4px solid #2563eb' }}>
                <span style={{ fontWeight: 700, color: '#1d4ed8' }}>Gross Profit</span>
                <span style={{ fontWeight: 800, color: gross >= 0 ? '#1d4ed8' : '#dc2626' }}>₹{gross.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#fff7ed', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: '#9a3412' }}>Expenses</span>
                <span style={{ fontWeight: 700, color: '#c2410c' }}>- ₹{exp.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: net >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '6px', border: net >= 0 ? '2px solid #22c55e' : '2px solid #ef4444', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: net >= 0 ? '#166534' : '#991b1b' }}>Net Profit</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: net >= 0 ? '#15803d' : '#dc2626' }}>
                  {net >= 0 ? `₹${net.toFixed(2)}` : `-₹${Math.abs(net).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'INVENTORY':
        return (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#334155' }}>
              Inventory Status Report ({inventoryReport?.length || 0} Products)
            </div>
            {inventoryReport?.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No inventory products found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Current Stock</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Minimum Stock</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.map((inv) => (
                    <tr key={inv.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{inv.productName}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{inv.categoryName}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: inv.quantity === 0 ? '#dc2626' : '#0f172a' }}>
                        {inv.quantity} {inv.unit}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{inv.minStockLevel} {inv.unit}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: inv.status === 'In Stock' ? '#dcfce7' : inv.status === 'Low Stock' ? '#ffedd5' : '#fee2e2',
                          color: inv.status === 'In Stock' ? '#15803d' : inv.status === 'Low Stock' ? '#c2410c' : '#b91c1c'
                        }}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Business Reports</h1>
          <p className="page-description" style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Generate and download reports for Sales, Purchases, Expenses, Profit Statements, and Inventory Status.
          </p>
        </div>

        {/* Export Download Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: downloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>📊</span> Download Excel
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: downloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span>📄</span> Download PDF
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { key: 'SALES', label: 'Sales Report' },
          { key: 'PURCHASE', label: 'Purchase Report' },
          { key: 'EXPENSE', label: 'Expense Report' },
          { key: 'PROFIT', label: 'Profit Report' },
          { key: 'INVENTORY', label: 'Inventory Report' }
        ].map((r) => (
          <button
            key={r.key}
            onClick={() => setReportType(r.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: reportType === r.key ? 700 : 500,
              backgroundColor: reportType === r.key ? '#2563eb' : '#ffffff',
              color: reportType === r.key ? '#ffffff' : '#334155',
              border: reportType === r.key ? 'none' : '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Date Filter Bar */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
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
              onClick={() => setFilterType(f.value)}
              style={{
                padding: '0.4rem 0.8rem',
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

        {filterType === 'CUSTOM' && (
          <form onSubmit={handleCustomApply} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.35rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Date Banner */}
      {data && (
        <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>Report Period: <strong>{data.startDate}</strong> to <strong>{data.endDate}</strong></span>
          <span>Report: <strong>{reportType}</strong> ({filterType})</span>
        </div>
      )}

      {/* Alert Error */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Main Report Table / View */}
      {renderReportContent()}
    </div>
  );
};

export default Reports;
