const walletService = require('../services/walletService');
const logger = require('../config/logger');

class WalletController {
  async createWallet(req, res) {
    try {
      const userId = req.userId;
      
      const wallet = await walletService.createWallet(userId);

      res.status(201).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      logger.error(`Wallet creation error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getWallet(req, res) {
    try {
      const userId = req.userId;
      
      const wallet = await walletService.getWallet(userId);

      res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      logger.error(`Wallet retrieval error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async addMoney(req, res) {
    try {
      const userId = req.userId;
      const { amount, description, referenceId } = req.body;

      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Amount is required',
        });
      }

      const wallet = await walletService.addMoney(
        userId,
        amount,
        description || 'Money added to wallet',
        referenceId
      );

      res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      logger.error(`Add money error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTransactionHistory(req, res) {
    try {
      const userId = req.userId;
      const { limit = 50, skip = 0 } = req.query;

      const result = await walletService.getTransactionHistory(
        userId,
        parseInt(limit),
        parseInt(skip)
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
}

module.exports = new WalletController();
