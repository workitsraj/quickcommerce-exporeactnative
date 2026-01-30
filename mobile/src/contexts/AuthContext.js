import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (userId, otp, deviceInfo) => {
    try {
      const response = await authService.verifyOTP(userId, otp, deviceInfo);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials, deviceInfo) => {
    try {
      const response = await authService.login(credentials, deviceInfo);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const socialLogin = async (socialData, deviceInfo) => {
    try {
      const response = await authService.socialLogin(socialData, deviceInfo);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    verifyOTP,
    login,
    socialLogin,
    logout,
    updateUserProfile,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
