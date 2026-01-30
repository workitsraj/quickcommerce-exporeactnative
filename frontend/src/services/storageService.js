import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_ID: '@quickcommerce:userId',
  SESSION_ID: '@quickcommerce:sessionId',
  CART: '@quickcommerce:cart',
};

export const storageService = {
  // User ID
  async getUserId() {
    try {
      return await AsyncStorage.getItem(KEYS.USER_ID);
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },

  async setUserId(userId) {
    try {
      await AsyncStorage.setItem(KEYS.USER_ID, userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  },

  async removeUserId() {
    try {
      await AsyncStorage.removeItem(KEYS.USER_ID);
    } catch (error) {
      console.error('Error removing user ID:', error);
    }
  },

  // Session ID (for guest users)
  async getSessionId() {
    try {
      let sessionId = await AsyncStorage.getItem(KEYS.SESSION_ID);
      if (!sessionId) {
        sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(KEYS.SESSION_ID, sessionId);
      }
      return sessionId;
    } catch (error) {
      console.error('Error getting session ID:', error);
      return null;
    }
  },

  // Cart (for offline access)
  async getCart() {
    try {
      const cart = await AsyncStorage.getItem(KEYS.CART);
      return cart ? JSON.parse(cart) : null;
    } catch (error) {
      console.error('Error getting cart:', error);
      return null;
    }
  },

  async setCart(cart) {
    try {
      await AsyncStorage.setItem(KEYS.CART, JSON.stringify(cart));
    } catch (error) {
      console.error('Error setting cart:', error);
    }
  },

  async clearCart() {
    try {
      await AsyncStorage.removeItem(KEYS.CART);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },
};
