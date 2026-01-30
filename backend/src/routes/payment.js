const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

// Apply authentication and rate limiting to all payment routes
router.use(authMiddleware);
router.use(paymentLimiter);

// Payment routes
router.post('/initiate', paymentController.initiatePayment);
router.post('/confirm', paymentController.confirmPayment);
router.post('/:transactionId/retry', paymentController.retryPayment);
router.post('/:transactionId/refund', paymentController.processRefund);
router.post('/:transactionId/verify-cod', paymentController.verifyCOD);
router.get('/history', paymentController.getTransactionHistory);

module.exports = router;
