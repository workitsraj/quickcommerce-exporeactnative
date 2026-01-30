const Transaction = require('../models/Transaction');
const razorpayService = require('./razorpayService');
const stripeService = require('./stripeService');
const walletService = require('./walletService');
const logger = require('../config/logger');

class PaymentService {
  async initiatePayment(userId, orderId, amount, paymentMethod, paymentGateway, metadata = {}) {
    try {
      const transaction = await Transaction.create({
        userId,
        orderId,
        amount,
        paymentMethod,
        paymentGateway,
        status: 'PENDING',
        metadata,
      });

      transaction.addAuditLog('PAYMENT_INITIATED', {
        paymentMethod,
        paymentGateway,
        amount,
      });
      await transaction.save();

      let gatewayResponse = null;

      if (paymentGateway === 'RAZORPAY') {
        gatewayResponse = await razorpayService.createOrder(orderId, amount, 'INR', metadata);
        transaction.gatewayOrderId = gatewayResponse.id;
      } else if (paymentGateway === 'STRIPE') {
        gatewayResponse = await stripeService.createPaymentIntent(orderId, amount, 'inr', metadata);
        transaction.gatewayOrderId = gatewayResponse.id;
      } else if (paymentGateway === 'WALLET') {
        const wallet = await walletService.getWallet(userId);
        if (wallet.balance < amount) {
          transaction.status = 'FAILED';
          transaction.addAuditLog('PAYMENT_FAILED', { reason: 'Insufficient wallet balance' });
          await transaction.save();
          throw new Error('Insufficient wallet balance');
        }
      } else if (paymentGateway === 'COD') {
        transaction.codVerificationStatus = 'PENDING';
      }

      transaction.gatewayResponse = gatewayResponse;
      transaction.status = 'PROCESSING';
      transaction.addAuditLog('PAYMENT_PROCESSING', { gatewayResponse });
      await transaction.save();

      logger.info(`Payment initiated for order ${orderId}`);
      return transaction;
    } catch (error) {
      logger.error(`Payment initiation failed: ${error.message}`);
      throw error;
    }
  }

  async confirmPayment(transactionId, gatewayTransactionId, gatewayData = {}) {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      transaction.gatewayTransactionId = gatewayTransactionId;
      transaction.status = 'SUCCESS';
      transaction.addAuditLog('PAYMENT_CONFIRMED', {
        gatewayTransactionId,
        gatewayData,
      });

      if (transaction.paymentGateway === 'WALLET') {
        await walletService.deductMoney(
          transaction.userId,
          transaction.amount,
          `Payment for order ${transaction.orderId}`,
          transaction.orderId
        );
      }

      if (transaction.cashbackAmount > 0) {
        await walletService.applyCashback(
          transaction.userId,
          transaction.cashbackAmount,
          `Cashback for order ${transaction.orderId}`,
          transaction.orderId
        );
        transaction.cashbackApplied = true;
      }

      await transaction.save();
      logger.info(`Payment confirmed for transaction ${transactionId}`);
      
      return transaction;
    } catch (error) {
      logger.error(`Payment confirmation failed: ${error.message}`);
      throw error;
    }
  }

  async failPayment(transactionId, reason) {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      transaction.status = 'FAILED';
      transaction.addAuditLog('PAYMENT_FAILED', { reason });
      await transaction.save();

      logger.info(`Payment failed for transaction ${transactionId}: ${reason}`);
      return transaction;
    } catch (error) {
      logger.error(`Payment failure update failed: ${error.message}`);
      throw error;
    }
  }

  async retryPayment(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status === 'SUCCESS') {
        throw new Error('Cannot retry successful payment');
      }

      transaction.retryCount += 1;
      transaction.status = 'PENDING';
      transaction.addAuditLog('PAYMENT_RETRY', { retryCount: transaction.retryCount });
      await transaction.save();

      const newTransaction = await this.initiatePayment(
        transaction.userId,
        transaction.orderId,
        transaction.amount,
        transaction.paymentMethod,
        transaction.paymentGateway,
        transaction.metadata
      );

      logger.info(`Payment retry initiated for transaction ${transactionId}`);
      return newTransaction;
    } catch (error) {
      logger.error(`Payment retry failed: ${error.message}`);
      throw error;
    }
  }

  async processRefund(transactionId, amount = null) {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'SUCCESS') {
        throw new Error('Cannot refund non-successful transaction');
      }

      const refundAmount = amount || transaction.amount;

      if (refundAmount > transaction.amount - transaction.refundAmount) {
        throw new Error('Refund amount exceeds available amount');
      }

      let refundResponse = null;

      if (transaction.paymentGateway === 'RAZORPAY') {
        refundResponse = await razorpayService.createRefund(
          transaction.gatewayTransactionId,
          refundAmount
        );
      } else if (transaction.paymentGateway === 'STRIPE') {
        refundResponse = await stripeService.createRefund(
          transaction.gatewayOrderId,
          refundAmount
        );
      }

      await walletService.processRefundToWallet(
        transaction.userId,
        refundAmount,
        `Refund for order ${transaction.orderId}`,
        transaction.orderId
      );

      transaction.refundAmount += refundAmount;
      transaction.status = transaction.refundAmount === transaction.amount 
        ? 'REFUNDED' 
        : 'PARTIALLY_REFUNDED';
      transaction.refundedAt = new Date();
      transaction.addAuditLog('REFUND_PROCESSED', {
        refundAmount,
        refundResponse,
        totalRefunded: transaction.refundAmount,
      });
      await transaction.save();

      logger.info(`Refund processed for transaction ${transactionId}: ${refundAmount}`);
      return transaction;
    } catch (error) {
      logger.error(`Refund processing failed: ${error.message}`);
      throw error;
    }
  }

  async getTransactionHistory(userId, limit = 50, skip = 0, status = null) {
    try {
      const query = { userId };
      if (status) {
        query.status = status;
      }

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Transaction.countDocuments(query);

      return {
        transactions,
        total,
        hasMore: skip + transactions.length < total,
      };
    } catch (error) {
      logger.error(`Transaction history retrieval failed: ${error.message}`);
      throw error;
    }
  }

  async verifyCOD(transactionId, verificationStatus) {
    try {
      const transaction = await Transaction.findById(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.paymentGateway !== 'COD') {
        throw new Error('Transaction is not COD');
      }

      transaction.codVerificationStatus = verificationStatus;
      transaction.addAuditLog('COD_VERIFICATION', { verificationStatus });
      
      if (verificationStatus === 'VERIFIED') {
        transaction.status = 'SUCCESS';
      }

      await transaction.save();
      logger.info(`COD verification updated for transaction ${transactionId}: ${verificationStatus}`);
      
      return transaction;
    } catch (error) {
      logger.error(`COD verification failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PaymentService();
