import axios from 'axios';

// Update this with your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getTree: () => api.get('/categories/tree'),
  getById: (id) => api.get(`/categories/${id}`),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  search: (query) => api.get('/products/search', { params: { q: query } }),
  getById: (id) => api.get(`/products/${id}`),
  getRecommendations: (id, limit = 5) => 
    api.get(`/products/${id}/recommendations`, { params: { limit } }),
  getFrequentlyBoughtTogether: (id, limit = 3) => 
    api.get(`/products/${id}/frequently-bought-together`, { params: { limit } }),
};

// Inventory API
export const inventoryAPI = {
  checkAvailability: (params) => 
    api.get('/inventory/check-availability', { params }),
  getProductInventory: (productId, darkStore) => 
    api.get(`/inventory/product/${productId}`, { params: { darkStore } }),
};

export default api;
