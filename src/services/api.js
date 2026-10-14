import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch network errors and 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = "Network Error: Unable to connect to the SmartBiz backend server. Please verify network connectivity.";
    } else if (error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API Methods
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Working Date & Business API Methods
export const getWorkingDate = async () => {
  const response = await api.get('/business/working-date');
  return response.data;
};

export const updateWorkingDate = async (workingDate) => {
  const response = await api.put('/business/working-date', { workingDate });
  return response.data;
};

// Category API Methods
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Category Custom Field API Methods
export const getCategoryFields = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}/fields`);
  return response.data;
};

export const addCategoryField = async (categoryId, data) => {
  const response = await api.post(`/categories/${categoryId}/fields`, data);
  return response.data;
};

export const deleteCategoryField = async (categoryId, fieldId) => {
  const response = await api.delete(`/categories/${categoryId}/fields/${fieldId}`);
  return response.data;
};

// Product API Methods
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Inventory API Methods
export const getInventory = async () => {
  const response = await api.get('/inventory');
  return response.data;
};

export const adjustStock = async (data) => {
  const response = await api.post('/inventory/adjust', data);
  return response.data;
};

export const getInventoryHistory = async () => {
  const response = await api.get('/inventory/history');
  return response.data;
};

// Sales API Methods
export const getSales = async () => {
  const response = await api.get('/sales');
  return response.data;
};

export const recordSale = async (data) => {
  const response = await api.post('/sales', data);
  return response.data;
};

// Purchase API Methods
export const getPurchases = async () => {
  const response = await api.get('/purchases');
  return response.data;
};

export const recordPurchase = async (data) => {
  const response = await api.post('/purchases', data);
  return response.data;
};

// Expense Category API Methods
export const getExpenseCategories = async () => {
  const response = await api.get('/expense-categories');
  return response.data;
};

export const createExpenseCategory = async (data) => {
  const response = await api.post('/expense-categories', data);
  return response.data;
};

export const deleteExpenseCategory = async (id) => {
  const response = await api.delete(`/expense-categories/${id}`);
  return response.data;
};

// Expense API Methods
export const getExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// Dashboard API Method
export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// Analysis API Method
export const getAnalysis = async (params = {}) => {
  const response = await api.get('/analysis', { params });
  return response.data;
};

// Reports API Method
export const getReport = async (params = {}) => {
  const response = await api.get('/reports', { params });
  return response.data;
};

export const downloadReportExcel = async (params = {}) => {
  const response = await api.get('/reports/download/excel', {
    params,
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const fileName = (params.reportType || 'report').toLowerCase() + '_report.csv';
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadReportPdf = async (params = {}) => {
  const response = await api.get('/reports/download/pdf', {
    params,
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  const fileName = (params.reportType || 'report').toLowerCase() + '_report.pdf';
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// User Account API Methods
export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put('/user/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/user/change-password', data);
  return response.data;
};

export default api;
