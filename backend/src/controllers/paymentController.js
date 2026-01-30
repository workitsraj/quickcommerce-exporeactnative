const paymentService = require('../services/paymentService');
const logger = require('../config/logger');

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const { orderId, amount, paymentMethod, paymentGateway, metadata } = req.body;
      const userId = req.userId; // Assuming authentication middleware sets this

      if (!orderId || !amount || !paymentMethod || !paymentGateway) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const transaction = await paymentService.initiatePayment(
        userId,
        orderId,
        amount,
        paymentMethod,
        paymentGateway,
        metadata
      );

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error(`Payment initiation error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async confirmPayment(req, res) {
    try {
      const { transactionId, gatewayTransactionId, gatewayData } = req.body;

      if (!transactionId || !gatewayTransactionId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const transaction = await paymentService.confirmPayment(
        transactionId,
        gatewayTransactionId,
        gatewayData
      );

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error(`Payment confirmation error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async retryPayment(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID required',
        });
      }

      const transaction = await paymentService.retryPayment(transactionId);

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error(`Payment retry error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async processRefund(req, res) {
    try {
      const { transactionId } = req.params;
      const { amount } = req.body;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Transaction ID required',
        });
      }

      const transaction = await paymentService.processRefund(transactionId, amount);

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error(`Refund processing error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTransactionHistory(req, res) {
    try {
      const userId = req.userId;
      const { limit = 50, skip = 0, status } = req.query;

      const result = await paymentService.getTransactionHistory(
        userId,
        parseInt(limit),
        parseInt(skip),
        status
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Transaction history error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async verifyCOD(req, res) {
    try {
      const { transactionId } = req.params;
      const { verificationStatus } = req.body;

      if (!transactionId || !verificationStatus) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const transaction = await paymentService.verifyCOD(transactionId, verificationStatus);

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error(`COD verification error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new PaymentController();
