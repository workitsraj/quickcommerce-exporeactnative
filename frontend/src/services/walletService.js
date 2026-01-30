import apiClient from './api';

class WalletService {
  async createWallet() {
    try {
      const response = await apiClient.post('/wallet/create');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }

  async getWallet() {
    try {
      const response = await apiClient.get('/wallet');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }

  async addMoney(amount, description = 'Money added to wallet', referenceId = null) {
    try {
      // Input validation
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new Error('Valid positive amount is required');
      }
      
      const response = await apiClient.post('/wallet/add-money', {
        amount,
        description,
        referenceId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }

  async getTransactionHistory(limit = 50, skip = 0) {
    try {
      const response = await apiClient.get('/wallet/transactions', {
        params: { limit, skip },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }
}

export default new WalletService();
