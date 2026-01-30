import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cart API
export const cartApi = {
  getCart: (userId, sessionId) => 
    api.get('/cart', { params: { userId, sessionId } }),
  
  addToCart: (data) => 
    api.post('/cart/add', data),
  
  updateCartItem: (data) => 
    api.put('/cart/update', data),
  
  removeFromCart: (data) => 
    api.delete('/cart/remove', { data }),
  
  clearCart: (data) => 
    api.post('/cart/clear', data),
  
  applyCoupon: (data) => 
    api.post('/cart/apply-coupon', data),
  
  removeCoupon: (data) => 
    api.post('/cart/remove-coupon', data),
};

// Order API
export const orderApi = {
  createOrder: (data) => 
    api.post('/orders', data),
  
  getOrder: (orderId) => 
    api.get(`/orders/${orderId}`),
  
  getUserOrders: (userId, params = {}) => 
    api.get(`/orders/user/${userId}`, { params }),
  
  updateOrderStatus: (orderId, data) => 
    api.put(`/orders/${orderId}/status`, data),
  
  cancelOrder: (orderId, data) => 
    api.post(`/orders/${orderId}/cancel`, data),
  
  reorder: (orderId, data) => 
    api.post(`/orders/${orderId}/reorder`, data),
};

// Coupon API
export const couponApi = {
  getAllCoupons: () => 
    api.get('/coupons'),
  
  validateCoupon: (data) => 
    api.post('/coupons/validate', data),
};

export default api;
