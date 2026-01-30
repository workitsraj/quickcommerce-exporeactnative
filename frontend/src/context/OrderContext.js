import React, { createContext, useState, useEffect, useContext } from 'react';
import { orderApi } from '../services/api';
import socketService from '../services/socketService';
import { storageService } from '../services/storageService';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const uid = await storageService.getUserId();
      setUserId(uid);
      
      // Connect to socket for real-time updates
      if (uid) {
        socketService.connect(uid);
        
        // Listen for order updates
        socketService.on('orderCreated', (order) => {
          setOrders(prev => [order, ...prev]);
        });
        
        socketService.on('orderStatusUpdated', (data) => {
          setOrders(prev => prev.map(order => 
            order.orderId === data.orderId 
              ? { ...order, status: data.status, statusHistory: data.statusHistory }
              : order
          ));
        });
        
        socketService.on('orderCancelled', (data) => {
          setOrders(prev => prev.map(order => 
            order.orderId === data.orderId 
              ? { ...order, status: data.status, refundStatus: data.refundStatus }
              : order
          ));
        });
      }
    };
    init();

    return () => {
      socketService.off('orderCreated');
      socketService.off('orderStatusUpdated');
      socketService.off('orderCancelled');
    };
  }, []);

  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      const response = await orderApi.createOrder({
        ...orderData,
        userId,
      });
      setOrders(prev => [response.data.order, ...prev]);
      return { success: true, order: response.data.order };
    } catch (error) {
      console.error('Error creating order:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId) => {
    setLoading(true);
    try {
      const response = await orderApi.getOrder(orderId);
      return { success: true, order: response.data };
    } catch (error) {
      console.error('Error getting order:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getUserOrders = async (params = {}) => {
    if (!userId) return { success: false, error: 'User not logged in' };
    
    setLoading(true);
    try {
      const response = await orderApi.getUserOrders(userId, params);
      setOrders(response.data.orders);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting user orders:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId, reason) => {
    setLoading(true);
    try {
      const response = await orderApi.cancelOrder(orderId, { reason });
      setOrders(prev => prev.map(order => 
        order.orderId === orderId ? response.data.order : order
      ));
      return { success: true, order: response.data.order };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const reorder = async (orderId, orderData = {}) => {
    setLoading(true);
    try {
      const response = await orderApi.reorder(orderId, orderData);
      setOrders(prev => [response.data.order, ...prev]);
      return { success: true, order: response.data.order };
    } catch (error) {
      console.error('Error reordering:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    orders,
    loading,
    createOrder,
    getOrder,
    getUserOrders,
    cancelOrder,
    reorder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
