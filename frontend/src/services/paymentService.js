import apiClient from './api';

class PaymentService {
  async initiatePayment(orderId, amount, paymentMethod, paymentGateway, metadata = {}) {
    try {
      const response = await apiClient.post('/payments/initiate', {
        orderId,
        amount,
        paymentMethod,
        paymentGateway,
        metadata,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }

  async confirmPayment(transactionId, gatewayTransactionId, gatewayData = {}) {
    try {
      const response = await apiClient.post('/payments/confirm', {
        transactionId,
        gatewayTransactionId,
        gatewayData,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }

  async retryPayment(transactionId) {
    try {
      const response = await apiClient.post(`/payments/${transactionId}/retry`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }

  async processRefund(transactionId, amount = null) {
    try {
      const response = await apiClient.post(`/payments/${transactionId}/refund`, {
        amount,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }

  async getTransactionHistory(limit = 50, skip = 0, status = null) {
    try {
      const params = { limit, skip };
      if (status) params.status = status;
      
      const response = await apiClient.get('/payments/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }

  async verifyCOD(transactionId, verificationStatus) {
    try {
      const response = await apiClient.post(`/payments/${transactionId}/verify-cod`, {
        verificationStatus,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }
}

export default new PaymentService();
