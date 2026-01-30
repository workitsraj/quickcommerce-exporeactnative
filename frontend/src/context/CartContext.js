import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartApi } from '../services/api';
import { storageService } from '../services/storageService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Initialize user/session IDs
  useEffect(() => {
    const init = async () => {
      const uid = await storageService.getUserId();
      const sid = await storageService.getSessionId();
      setUserId(uid);
      setSessionId(sid);
      
      // Load cart from storage initially
      const storedCart = await storageService.getCart();
      if (storedCart) {
        setCart(storedCart);
      }
    };
    init();
  }, []);

  // Sync cart with backend
  const syncCart = async () => {
    if (!userId && !sessionId) return;
    
    try {
      const response = await cartApi.getCart(userId, sessionId);
      setCart(response.data);
      await storageService.setCart(response.data);
    } catch (error) {
      console.log('Cart not found, will create on first add');
    }
  };

  useEffect(() => {
    if (userId || sessionId) {
      syncCart();
    }
  }, [userId, sessionId]);

  const addToCart = async (productId, name, price, quantity, image) => {
    setLoading(true);
    try {
      const response = await cartApi.addToCart({
        userId,
        sessionId,
        productId,
        quantity,
      });
      setCart(response.data);
      await storageService.setCart(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    setLoading(true);
    try {
      const response = await cartApi.updateCartItem({
        userId,
        sessionId,
        productId,
        quantity,
      });
      setCart(response.data);
      await storageService.setCart(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const response = await cartApi.removeFromCart({
        userId,
        sessionId,
        productId,
      });
      setCart(response.data);
      await storageService.setCart(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await cartApi.clearCart({ userId, sessionId });
      setCart(null);
      await storageService.clearCart();
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (couponCode) => {
    setLoading(true);
    try {
      const response = await cartApi.applyCoupon({
        userId,
        sessionId,
        couponCode,
      });
      setCart(response.data.cart);
      await storageService.setCart(response.data.cart);
      return { success: true, discount: response.data.discount };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    setLoading(true);
    try {
      const response = await cartApi.removeCoupon({
        userId,
        sessionId,
      });
      setCart(response.data.cart);
      await storageService.setCart(response.data.cart);
      return { success: true };
    } catch (error) {
      console.error('Error removing coupon:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart?.totalAmount || 0;
  };

  const value = {
    cart,
    loading,
    userId,
    sessionId,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartItemCount,
    getCartTotal,
    syncCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
