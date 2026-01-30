const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { webhookLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to webhook routes
router.use(webhookLimiter);

// Webhook routes - no authentication as they come from payment gateways
// Note: Raw body parsing is handled in server.js for webhook routes
router.post('/razorpay', webhookController.razorpayWebhook);
router.post('/stripe', webhookController.stripeWebhook);

module.exports = router;
