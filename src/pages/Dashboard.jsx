import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { getDashboardSummary } from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const summary = await getDashboardSummary();
      setData(summary);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Loading business metrics and dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      </div>
    );
  }

  const {
    todaySales = '0.00',
    monthSales = '0.00',
    lowStockCount = 0,
    netProfitMonth = '0.00',
    salesTrend = [],
    topProducts = [],
    lowStockAlerts = [],
    recentActivities = []
  } = data || {};

  const netProfitNum = parseFloat(netProfitMonth) || 0;

  // Render activity badge helper
  const getActivityBadge = (type) => {
    switch (type) {
      case 'SALE':
        return <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#15803d' }}>Sale</span>;
      case 'PURCHASE':
        return <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e0f2fe', color: '#0369a1' }}>Purchase</span>;
      case 'EXPENSE':
        return <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#b91c1c' }}>Expense</span>;
      case 'STOCK_ADJUSTMENT':
        return <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#fef3c7', color: '#b45309' }}>Adjustment</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#475569' }}>{type}</span>;
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Business Dashboard</h1>
          <p className="page-description" style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Welcome back, <strong>{user?.name || user?.username}</strong> ({user?.businessName})
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          style={{
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* 4 Primary Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Today's Sales</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '0.5rem' }}>₹{parseFloat(todaySales).toFixed(2)}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>This Month's Sales</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0284c7', marginTop: '0.5rem' }}>₹{parseFloat(monthSales).toFixed(2)}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Low Stock Products</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: lowStockCount > 0 ? '#dc2626' : '#16a34a', marginTop: '0.5rem' }}>{lowStockCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Net Profit This Month</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: netProfitNum >= 0 ? '#16a34a' : '#dc2626', marginTop: '0.5rem' }}>
            {netProfitNum >= 0 ? `₹${netProfitNum.toFixed(2)}` : `-₹${Math.abs(netProfitNum).toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* Grid Layout for Analytics Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Sales Trend Section */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Sales Trend (Recent Dates)</h3>
          {salesTrend.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No recent sales recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {salesTrend.map((st) => (
                <div key={st.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: '#334155', fontWeight: 500 }}>{st.date}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '60%' }}>
                    <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: '#2563eb',
                        width: `${Math.min(100, (parseFloat(st.amount) / Math.max(...salesTrend.map(x => parseFloat(x.amount)))) * 100)}%`
                      }} />
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a', minWidth: '70px', textAlign: 'right' }}>₹{parseFloat(st.amount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top-Selling Products Section */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Top-Selling Products</h3>
          {topProducts.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No sales data available yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '0.5rem 0' }}>Product</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Units Sold</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((tp) => (
                  <tr key={tp.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: 600, color: '#0f172a' }}>{tp.productName}</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'center', fontWeight: 600, color: '#2563eb' }}>{tp.totalQuantitySold}</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>₹{parseFloat(tp.totalRevenue).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Grid Layout for Low Stock & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Low-Stock Alerts Section */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span> Low-Stock Alerts
          </h3>
          {lowStockAlerts.length === 0 ? (
            <p style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 500 }}>✓ All product stock levels are healthy.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '0.5rem 0' }}>Product</th>
                  <th style={{ padding: '0.5rem 0' }}>Current Stock</th>
                  <th style={{ padding: '0.5rem 0' }}>Min Stock</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.map((item) => (
                  <tr key={item.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: 600, color: '#0f172a' }}>{item.productName}</td>
                    <td style={{ padding: '0.6rem 0', fontWeight: 700, color: item.quantity === 0 ? '#dc2626' : '#ea580c' }}>
                      {item.quantity} {item.unit}
                    </td>
                    <td style={{ padding: '0.6rem 0', color: '#64748b' }}>{item.minStockLevel} {item.unit}</td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: item.quantity === 0 ? '#fee2e2' : '#ffedd5',
                        color: item.quantity === 0 ? '#b91c1c' : '#c2410c'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Activity Section */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Recent Activity Feed</h3>
          {recentActivities.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No recent business activities recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivities.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {getActivityBadge(act.type)}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{act.description}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{act.workingDate}</div>
                    </div>
                  </div>
                  {act.amount !== null && act.amount !== undefined && (
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: act.type === 'SALE' ? '#16a34a' : act.type === 'EXPENSE' ? '#dc2626' : '#0284c7'
                    }}>
                      {act.type === 'SALE' ? '+' : act.type === 'EXPENSE' ? '-' : ''}₹{parseFloat(act.amount).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
