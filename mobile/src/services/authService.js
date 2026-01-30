import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Register new user
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Verify OTP
 */
export const verifyOTP = async (userId, otp, deviceInfo) => {
  const response = await api.post('/auth/verify-otp', {
    userId,
    otp,
    deviceInfo,
  });
  
  if (response.data.success) {
    const { accessToken, refreshToken, user } = response.data.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
  }
  
  return response.data;
};

/**
 * Resend OTP
 */
export const resendOTP = async (userId) => {
  const response = await api.post('/auth/resend-otp', { userId });
  return response.data;
};

/**
 * Login user
 */
export const login = async (credentials, deviceInfo) => {
  const response = await api.post('/auth/login', {
    ...credentials,
    deviceInfo,
  });
  
  if (response.data.success) {
    const { accessToken, refreshToken, user } = response.data.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
  }
  
  return response.data;
};

/**
 * Social login
 */
export const socialLogin = async (socialData, deviceInfo) => {
  const response = await api.post('/auth/social-login', {
    ...socialData,
    deviceInfo,
  });
  
  if (response.data.success) {
    const { accessToken, refreshToken, user } = response.data.data;
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ]);
  }
  
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }
};

/**
 * Forgot password
 */
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password
 */
export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};

/**
 * Get active sessions
 */
export const getActiveSessions = async () => {
  const response = await api.get('/auth/sessions');
  return response.data;
};

/**
 * Revoke session
 */
export const revokeSession = async (sessionId) => {
  const response = await api.delete(`/auth/sessions/${sessionId}`);
  return response.data;
};

/**
 * Get user profile
 */
export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

/**
 * Update profile
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  
  if (response.data.success) {
    await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data;
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  });
  
  const response = await api.post('/profile/upload-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Update password
 */
export const updatePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/profile/password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/**
 * Get addresses
 */
export const getAddresses = async () => {
  const response = await api.get('/addresses');
  return response.data;
};

/**
 * Add address
 */
export const addAddress = async (addressData) => {
  const response = await api.post('/addresses', addressData);
  return response.data;
};

/**
 * Update address
 */
export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(`/addresses/${addressId}`, addressData);
  return response.data;
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/addresses/${addressId}`);
  return response.data;
};

/**
 * Set default address
 */
export const setDefaultAddress = async (addressId) => {
  const response = await api.put(`/addresses/${addressId}/default`);
  return response.data;
};
