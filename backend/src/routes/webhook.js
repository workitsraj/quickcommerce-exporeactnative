const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { webhookLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to webhook routes
router.use(webhookLimiter);

// Webhook routes - no authentication as they come from payment gateways
router.post('/razorpay', express.raw({ type: 'application/json' }), webhookController.razorpayWebhook);
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.stripeWebhook);

module.exports = router;
