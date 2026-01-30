const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const logger = require('../config/logger');

class WalletService {
  async createWallet(userId) {
    try {
      const existingWallet = await Wallet.findOne({ userId });
      
      if (existingWallet) {
        return existingWallet;
      }

      const wallet = await Wallet.create({ userId });
      logger.info(`Wallet created for user: ${userId}`);
      
      return wallet;
    } catch (error) {
      logger.error(`Wallet creation failed: ${error.message}`);
      throw error;
    }
  }

  async getWallet(userId) {
    try {
      const wallet = await Wallet.findOne({ userId });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      return wallet;
    } catch (error) {
      logger.error(`Wallet retrieval failed: ${error.message}`);
      throw error;
    }
  }

  async addMoney(userId, amount, description, referenceId) {
    try {
      const wallet = await this.getWallet(userId);
      
      const minAmount = parseInt(process.env.MIN_WALLET_AMOUNT) || 10;
      const maxAmount = parseInt(process.env.MAX_WALLET_AMOUNT) || 50000;

      if (amount < minAmount || amount > maxAmount) {
        throw new Error(`Amount must be between ${minAmount} and ${maxAmount}`);
      }

      await wallet.addBalance(amount, description, referenceId);
      logger.info(`Money added to wallet for user ${userId}: ${amount}`);
      
      return wallet;
    } catch (error) {
      logger.error(`Add money to wallet failed: ${error.message}`);
      throw error;
    }
  }

  async deductMoney(userId, amount, description, referenceId) {
    try {
      const wallet = await this.getWallet(userId);
      await wallet.deductBalance(amount, description, referenceId);
      logger.info(`Money deducted from wallet for user ${userId}: ${amount}`);
      
      return wallet;
    } catch (error) {
      logger.error(`Deduct money from wallet failed: ${error.message}`);
      throw error;
    }
  }

  async getTransactionHistory(userId, limit = 50, skip = 0) {
    try {
      const transactions = await WalletTransaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await WalletTransaction.countDocuments({ userId });

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

  async applyCashback(userId, amount, description, referenceId) {
    try {
      const wallet = await this.getWallet(userId);
      await wallet.addBalance(amount, description || 'Cashback', referenceId);
      logger.info(`Cashback applied for user ${userId}: ${amount}`);
      
      return wallet;
    } catch (error) {
      logger.error(`Cashback application failed: ${error.message}`);
      throw error;
    }
  }

  async processRefundToWallet(userId, amount, description, referenceId) {
    try {
      const wallet = await this.getWallet(userId);
      await wallet.addBalance(amount, description || 'Refund', referenceId);
      logger.info(`Refund processed to wallet for user ${userId}: ${amount}`);
      
      return wallet;
    } catch (error) {
      logger.error(`Refund to wallet failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new WalletService();
