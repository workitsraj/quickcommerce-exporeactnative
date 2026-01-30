const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/auth');
const { walletLimiter } = require('../middleware/rateLimiter');

// Apply authentication and rate limiting to all wallet routes
router.use(authMiddleware);
router.use(walletLimiter);

// Wallet routes
router.post('/create', walletController.createWallet);
router.get('/', walletController.getWallet);
router.post('/add-money', walletController.addMoney);
router.get('/transactions', walletController.getTransactionHistory);

module.exports = router;
