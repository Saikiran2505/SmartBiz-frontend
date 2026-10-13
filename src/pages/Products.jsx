import React, { useState, useEffect, useCallback } from 'react';
import {
  getCategories, createCategory, deleteCategory,
  getCategoryFields, addCategoryField, deleteCategoryField,
  getProducts, createProduct, updateProduct, deleteProduct
} from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Manage Custom Fields Modal State
  const [selectedCatForFields, setSelectedCatForFields] = useState(null);
  const [catFields, setCatFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('TEXT');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [fieldSubmitting, setFieldSubmitting] = useState(false);

  // Product Modal State
  const [showProdModal, setShowProdModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    categoryId: '',
    sellingPrice: '',
    costPrice: '',
    quantity: '0',
    unit: 'pcs',
    minStockLevel: '5',
    description: ''
  });
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [prodFormFields, setProdFormFields] = useState([]);
  const [prodSubmitting, setProdSubmitting] = useState(false);
  const [prodModalError, setProdModalError] = useState('');

  // Load Categories & Products
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catsData, prodsData] = await Promise.all([getCategories(), getProducts()]);
      setCategories(catsData || []);
      setProducts(prodsData || []);
    } catch (err) {
      console.error("Error loading categories or products:", err);
      setError(err.response?.data?.message || "Failed to load products and categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load fields for a specific category when selected in Product Form
  const loadFieldsForCategory = useCallback(async (catId, currentProduct = null) => {
    if (!catId) {
      setProdFormFields([]);
      setCustomFieldValues({});
      return;
    }
    try {
      const fields = await getCategoryFields(catId);
      setProdFormFields(fields || []);

      const initialValues = {};
      if (currentProduct && currentProduct.customFields) {
        currentProduct.customFields.forEach(cf => {
          initialValues[cf.fieldId] = cf.value || '';
        });
      }
      setCustomFieldValues(initialValues);
    } catch (err) {
      console.error("Error loading category fields:", err);
    }
  }, []);

  // Handle Category Creation
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setError("Category name is required.");
      return;
    }
    setCatSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await createCategory({ name: catName.trim(), description: catDesc.trim() });
      setSuccess(`Category '${catName}' created successfully.`);
      setCatName('');
      setCatDesc('');
      setShowCatModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category.");
    } finally {
      setCatSubmitting(false);
    }
  };

  // Handle Category Deletion
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category '${name}'?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteCategory(id);
      setSuccess(`Category '${name}' deleted successfully.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category.");
    }
  };

  // Open Manage Custom Fields Modal
  const openFieldsModal = async (cat) => {
    setSelectedCatForFields(cat);
    try {
      const fields = await getCategoryFields(cat.id);
      setCatFields(fields || []);
    } catch (err) {
      console.error("Error fetching category fields:", err);
    }
  };

  // Add Custom Field to Category
  const handleAddCustomField = async (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    setFieldSubmitting(true);
    setError('');
    try {
      await addCategoryField(selectedCatForFields.id, {
        fieldName: newFieldName.trim(),
        fieldType: newFieldType,
        options: newFieldType === 'DROPDOWN' ? newFieldOptions.trim() : ''
      });
      const updatedFields = await getCategoryFields(selectedCatForFields.id);
      setCatFields(updatedFields || []);
      setNewFieldName('');
      setNewFieldOptions('');
      setSuccess(`Custom field '${newFieldName}' added to category '${selectedCatForFields.name}'.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add custom field.");
    } finally {
      setFieldSubmitting(false);
    }
  };

  // Delete Custom Field from Category
  const handleDeleteCustomField = async (fieldId, fieldName) => {
    if (!window.confirm(`Delete field '${fieldName}'?`)) return;
    try {
      await deleteCategoryField(selectedCatForFields.id, fieldId);
      const updatedFields = await getCategoryFields(selectedCatForFields.id);
      setCatFields(updatedFields || []);
      setSuccess(`Custom field '${fieldName}' removed.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete field.");
    }
  };

  // Open Product Modal
  const openProductModal = (product = null) => {
    setError('');
    setSuccess('');
    setProdModalError('');
    if (product) {
      setEditingProduct(product);
      const catId = product.categoryId || '';
      setProdForm({
        name: product.name,
        categoryId: catId,
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice,
        quantity: product.quantity,
        unit: product.unit || 'pcs',
        minStockLevel: product.minStockLevel || 5,
        description: product.description || ''
      });
      loadFieldsForCategory(catId, product);
    } else {
      setEditingProduct(null);
      const defaultCatId = categories.length > 0 ? categories[0].id : '';
      setProdForm({
        name: '',
        categoryId: defaultCatId,
        sellingPrice: '',
        costPrice: '',
        quantity: '0',
        unit: 'pcs',
        minStockLevel: '5',
        description: ''
      });
      loadFieldsForCategory(defaultCatId, null);
    }
    setShowProdModal(true);
  };

  const handleCategoryChangeInProdForm = (e) => {
    const selectedId = e.target.value;
    setProdForm({ ...prodForm, categoryId: selectedId });
    loadFieldsForCategory(selectedId, null);
  };

  // Handle Product Save
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProdModalError('');
    setError('');
    setSuccess('');

    if (!prodForm.name || !prodForm.name.trim()) {
      setProdModalError("Product name is required.");
      return;
    }
    if (!prodForm.categoryId) {
      setProdModalError("Category selection is required.");
      return;
    }

    const sellPrice = parseFloat(prodForm.sellingPrice);
    if (isNaN(sellPrice) || sellPrice <= 0) {
      setProdModalError("Selling price must be a valid positive amount.");
      return;
    }

    const costPrice = parseFloat(prodForm.costPrice);
    if (isNaN(costPrice) || costPrice <= 0) {
      setProdModalError("Cost price must be a valid positive amount.");
      return;
    }

    const qty = parseInt(prodForm.quantity || 0, 10);
    if (isNaN(qty) || qty < 0) {
      setProdModalError("Quantity cannot be negative.");
      return;
    }

    const minStock = parseInt(prodForm.minStockLevel || 0, 10);
    if (isNaN(minStock) || minStock < 0) {
      setProdModalError("Minimum stock level cannot be negative.");
      return;
    }

    setProdSubmitting(true);

    const customFieldsPayload = prodFormFields.map(f => ({
      fieldId: f.id,
      value: customFieldValues[f.id] || ''
    }));

    const payload = {
      name: prodForm.name.trim(),
      categoryId: Number(prodForm.categoryId),
      sellingPrice: sellPrice,
      costPrice: costPrice,
      quantity: qty,
      unit: prodForm.unit ? prodForm.unit.trim() : 'pcs',
      minStockLevel: minStock,
      description: prodForm.description ? prodForm.description.trim() : '',
      customFields: customFieldsPayload
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setSuccess(`Product '${payload.name}' updated successfully.`);
      } else {
        await createProduct(payload);
        setSuccess(`Product '${payload.name}' created successfully.`);
      }
      setShowProdModal(false);
      fetchData();
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message || "Failed to save product.";
      setProdModalError(apiMessage);
    } finally {
      setProdSubmitting(false);
    }
  };

  // Handle Product Deletion
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product '${name}'?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteProduct(id);
      setSuccess(`Product '${name}' deleted successfully.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title">Products & Categories</h1>
          <p className="page-description">Manage catalog, category-specific custom fields, and stock.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowCatModal(true)} className="btn btn-secondary-outline">
            + Add Category
          </button>
          <button onClick={() => openProductModal(null)} className="btn btn-primary">
            + Add Product
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Category Bar with Custom Fields Trigger */}
      <div className="category-bar">
        <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Categories & Fields ({categories.length}):</span>
        {categories.length === 0 ? (
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No categories created yet. Click "+ Add Category" to start.</span>
        ) : (
          categories.map(cat => (
            <span key={cat.id} className="category-chip">
              <span>{cat.name}</span>
              <button
                onClick={() => openFieldsModal(cat)}
                className="chip-action-btn"
                title="Manage Custom Fields"
              >
                ⚙ Fields
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="chip-delete-btn"
                title="Delete Category"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* Products Table */}
      <div className="page-card" style={{ padding: '0', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
            <h4>No Products Available</h4>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Create a category and add your first product to get started.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Cost Price</th>
                <th>Stock Qty</th>
                <th>Category Custom Fields</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <strong>{prod.name}</strong>
                    {prod.description && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.description}</div>}
                  </td>
                  <td><span className="table-badge">{prod.categoryName || 'Unassigned'}</span></td>
                  <td><strong>₹{parseFloat(prod.sellingPrice).toFixed(2)}</strong></td>
                  <td>₹{parseFloat(prod.costPrice).toFixed(2)}</td>
                  <td>
                    <span className={prod.quantity <= prod.minStockLevel ? 'stock-low' : 'stock-ok'}>
                      {prod.quantity} {prod.unit}
                    </span>
                  </td>
                  <td>
                    {prod.customFields && prod.customFields.length > 0 ? (
                      <div className="custom-fields-cell">
                        {prod.customFields.map(cf => (
                          <span key={cf.fieldId} className="custom-field-badge">
                            <strong>{cf.fieldName}:</strong> {cf.value || <em style={{ color: '#94a3b8' }}>N/A</em>}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openProductModal(prod)} className="btn-action-edit">Edit</button>
                      <button onClick={() => handleDeleteProduct(prod.id, prod.name)} className="btn-action-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category Creation Modal */}
      {showCatModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="modal-title">Add New Category</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Shirts, Mobile Accessories"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Optional category description"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCatModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={catSubmitting}>
                  {catSubmitting ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Category Custom Fields Modal */}
      {selectedCatForFields && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 className="modal-title">Custom Fields: {selectedCatForFields.name}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Define attributes specific to category '{selectedCatForFields.name}'.
            </p>

            {/* List Existing Fields */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Existing Fields</h4>
              {catFields.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No custom fields defined yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {catFields.map(f => (
                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <strong>{f.fieldName}</strong> <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({f.fieldType})</span>
                        {f.options && <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>Options: {f.options}</div>}
                      </div>
                      <button onClick={() => handleDeleteCustomField(f.id, f.fieldName)} className="btn-action-delete" style={{ padding: '0.2rem 0.4rem' }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Field Form */}
            <form onSubmit={handleAddCustomField} style={{ marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Add Custom Field</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Field Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Size, Color, Brand"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Field Type *</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="form-select"
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="DATE">Date</option>
                    <option value="DROPDOWN">Dropdown</option>
                  </select>
                </div>
              </div>

              {newFieldType === 'DROPDOWN' && (
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>Dropdown Options (comma-separated) *</label>
                  <input
                    type="text"
                    placeholder="e.g. S,M,L,XL or Red,Blue,Black"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedCatForFields(null)} className="btn btn-secondary">Close</button>
                <button type="submit" className="btn btn-primary" disabled={fieldSubmitting}>
                  {fieldSubmitting ? 'Adding...' : 'Add Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProdModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            {prodModalError && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{prodModalError}</div>}
            <form onSubmit={handleSaveProduct}>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Cotton T-Shirt"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Category *</label>
                <select
                  value={prodForm.categoryId}
                  onChange={handleCategoryChangeInProdForm}
                  required
                  className="form-select"
                >
                  <option value="" disabled>Select a Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1500.00"
                    value={prodForm.sellingPrice}
                    onChange={(e) => setProdForm({ ...prodForm, sellingPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1000.00"
                    value={prodForm.costPrice}
                    onChange={(e) => setProdForm({ ...prodForm, costPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={prodForm.quantity}
                    onChange={(e) => setProdForm({ ...prodForm, quantity: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    placeholder="pcs, kg, box"
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Min Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={prodForm.minStockLevel}
                    onChange={(e) => setProdForm({ ...prodForm, minStockLevel: e.target.value })}
                  />
                </div>
              </div>

              {/* Dynamic Category Custom Fields Input Section */}
              {prodFormFields.length > 0 && (
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.5rem' }}>
                    Category Specific Fields ({prodFormFields.length})
                  </h4>
                  <div className="form-row">
                    {prodFormFields.map(f => (
                      <div key={f.id} className="form-group">
                        <label>{f.fieldName} ({f.fieldType.toLowerCase()})</label>
                        {f.fieldType === 'DROPDOWN' ? (
                          <select
                            value={customFieldValues[f.id] || ''}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [f.id]: e.target.value })}
                            className="form-select"
                          >
                            <option value="">-- Select {f.fieldName} --</option>
                            {f.options && f.options.split(',').map(opt => (
                              <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={f.fieldType === 'NUMBER' ? 'number' : f.fieldType === 'DATE' ? 'date' : 'text'}
                            placeholder={`Enter ${f.fieldName}`}
                            value={customFieldValues[f.id] || ''}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [f.id]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowProdModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={prodSubmitting || categories.length === 0}>
                  {prodSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
