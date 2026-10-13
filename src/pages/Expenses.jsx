import React, { useState, useEffect, useCallback } from 'react';
import {
  getExpenses, createExpense, updateExpense, deleteExpense,
  getExpenseCategories, createExpenseCategory, deleteExpenseCategory
} from '../services/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Expense Modal State (Add / Edit)
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    categoryId: '',
    amount: '',
    description: ''
  });
  const [expenseModalError, setExpenseModalError] = useState('');
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catModalError, setCatModalError] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(),
        getExpenseCategories()
      ]);
      setExpenses(expensesData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Error loading expenses data:", err);
      setError(err.response?.data?.message || "Failed to load expenses and categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Expense Modal for Create
  const handleOpenCreateModal = () => {
    setEditingExpense(null);
    setExpenseModalError('');
    setExpenseForm({
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      amount: '',
      description: ''
    });
    setShowExpenseModal(true);
  };

  // Open Expense Modal for Edit
  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setExpenseModalError('');
    setExpenseForm({
      categoryId: String(expense.categoryId),
      amount: String(expense.amount),
      description: expense.description || ''
    });
    setShowExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setEditingExpense(null);
    setExpenseModalError('');
  };

  // Submit Expense (Create or Edit)
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseModalError('');
    setError('');
    setSuccess('');

    if (!expenseForm.categoryId) {
      setExpenseModalError("Please select an expense category.");
      return;
    }

    const amt = parseFloat(expenseForm.amount);
    if (!amt || amt <= 0) {
      setExpenseModalError("Expense amount must be greater than zero.");
      return;
    }

    setExpenseSubmitting(true);

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          categoryId: Number(expenseForm.categoryId),
          amount: amt,
          description: expenseForm.description
        });
        setSuccess("Expense updated successfully.");
      } else {
        await createExpense({
          categoryId: Number(expenseForm.categoryId),
          amount: amt,
          description: expenseForm.description
        });
        setSuccess("Expense recorded successfully.");
      }

      setShowExpenseModal(false);
      fetchData();
    } catch (err) {
      console.error("Expense submit error:", err);
      setExpenseModalError(err.response?.data?.message || "Failed to save expense.");
    } finally {
      setExpenseSubmitting(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    setError('');
    setSuccess('');
    try {
      await deleteExpense(id);
      setSuccess("Expense deleted successfully.");
      fetchData();
    } catch (err) {
      console.error("Delete expense error:", err);
      setError(err.response?.data?.message || "Failed to delete expense.");
    }
  };

  // Submit Expense Category
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setCatModalError('');
    if (!catName.trim()) {
      setCatModalError("Category name is required.");
      return;
    }

    setCatSubmitting(true);
    try {
      await createExpenseCategory({
        name: catName.trim(),
        description: catDesc.trim()
      });
      setSuccess(`Expense category '${catName}' created.`);
      setCatName('');
      setCatDesc('');
      fetchData();
    } catch (err) {
      console.error("Category create error:", err);
      setCatModalError(err.response?.data?.message || "Failed to create category.");
    } finally {
      setCatSubmitting(false);
    }
  };

  // Delete Expense Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete expense category '${name}'?`)) return;
    setCatModalError('');
    try {
      await deleteExpenseCategory(id);
      setSuccess(`Expense category '${name}' deleted.`);
      fetchData();
    } catch (err) {
      setCatModalError(err.response?.data?.message || "Failed to delete expense category.");
    }
  };

  // KPI Calculations
  const totalExpensesCount = expenses.length;
  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toFixed(2);
  const totalCategoriesCount = categories.length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Expense Management</h1>
          <p className="page-description" style={{ color: '#64748b', marginTop: '0.25rem' }}>Track operating expenses, rent, salaries, utilities, and maintain category records.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowCatModal(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Manage Categories
          </button>
          <button
            onClick={handleOpenCreateModal}
            disabled={categories.length === 0}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1.2rem',
              fontWeight: 600,
              cursor: categories.length === 0 ? 'not-allowed' : 'pointer',
              opacity: categories.length === 0 ? 0.6 : 1
            }}
          >
            + Add Expense
          </button>
        </div>
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
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Expenses Recorded</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{totalExpensesCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Expense Spend</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#dc2626', marginTop: '0.5rem' }}>₹{totalExpenseAmount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Expense Categories</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '0.5rem' }}>{totalCategoriesCount}</div>
        </div>
      </div>

      {/* Expenses List Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600, color: '#334155' }}>
          Expense Records History
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No expenses recorded yet. Click <strong>"+ Add Expense"</strong> to create a new expense record.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Working Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem' }}>Recorded At</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#334155' }}>{expense.workingDate}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{expense.categoryName}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#dc2626' }}>₹{parseFloat(expense.amount).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{expense.description || '-'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(expense.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEditModal(expense)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.8rem',
                        marginRight: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      style={{
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        borderRadius: '4px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {showExpenseModal && (
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {editingExpense ? 'Edit Expense Record' : 'Add New Expense'}
              </h3>
              <button
                onClick={handleCloseExpenseModal}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            {expenseModalError && (
              <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '0.6rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {expenseModalError}
              </div>
            )}

            <form onSubmit={handleExpenseSubmit}>
              {/* Category Select */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Expense Category</label>
                <select
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Expense Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 1500.00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* Description Input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Office electricity bill for October"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleCloseExpenseModal}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: expenseSubmitting ? 'not-allowed' : 'pointer',
                    opacity: expenseSubmitting ? 0.6 : 1
                  }}
                >
                  {expenseSubmitting ? "Saving..." : (editingExpense ? "Update Expense" : "Save Expense")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {showCatModal && (
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
            maxWidth: '520px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', pb: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Manage Expense Categories</h3>
              <button
                onClick={() => setShowCatModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            {catModalError && (
              <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '0.6rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {catModalError}
              </div>
            )}

            {/* Add Category Form */}
            <form onSubmit={handleCatSubmit} style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#334155' }}>+ Create New Expense Category</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Category Name (e.g. Internet)"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  style={{ flex: 1, padding: '0.45rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  disabled={catSubmitting}
                  style={{ padding: '0.45rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  {catSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
              <input
                type="text"
                placeholder="Description (Optional)"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </form>

            {/* Categories List */}
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>Existing Categories</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              {categories.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No expense categories defined.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {categories.map((c) => (
                    <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                      <div>
                        <strong style={{ color: '#0f172a' }}>{c.name}</strong>
                        {c.description && <span style={{ color: '#64748b', marginLeft: '0.5rem', fontSize: '0.8rem' }}>({c.description})</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        style={{ backgroundColor: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 500, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
