const razorpayService = require('../services/razorpayService');
const stripeService = require('../services/stripeService');
const paymentService = require('../services/paymentService');
const Transaction = require('../models/Transaction');
const logger = require('../config/logger');

class WebhookController {
  async razorpayWebhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const payload = req.body;

      const isValid = razorpayService.verifyWebhookSignature(payload, signature);

      if (!isValid) {
        logger.error('Razorpay webhook signature verification failed');
        return res.status(400).json({
          success: false,
          message: 'Invalid signature',
        });
      }

      const event = payload.event;
      const paymentData = payload.payload.payment.entity;

      logger.info(`Razorpay webhook received: ${event}`);

      const transaction = await Transaction.findOne({
        gatewayOrderId: paymentData.order_id,
      });

      if (!transaction) {
        logger.error(`Transaction not found for order: ${paymentData.order_id}`);
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      switch (event) {
        case 'payment.authorized':
        case 'payment.captured':
          await paymentService.confirmPayment(
            transaction._id,
            paymentData.id,
            paymentData
          );
          break;

        case 'payment.failed':
          await paymentService.failPayment(
            transaction._id,
            paymentData.error_description || 'Payment failed'
          );
          break;

        default:
          logger.info(`Unhandled Razorpay webhook event: ${event}`);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(`Razorpay webhook error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async stripeWebhook(req, res) {
    try {
      const signature = req.headers['stripe-signature'];
      const payload = req.body;

      const event = stripeService.verifyWebhookSignature(payload, signature);

      if (!event) {
        logger.error('Stripe webhook signature verification failed');
        return res.status(400).json({
          success: false,
          message: 'Invalid signature',
        });
      }

      logger.info(`Stripe webhook received: ${event.type}`);

      const paymentIntent = event.data.object;

      const transaction = await Transaction.findOne({
        gatewayOrderId: paymentIntent.id,
      });

      if (!transaction) {
        logger.error(`Transaction not found for payment intent: ${paymentIntent.id}`);
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      switch (event.type) {
        case 'payment_intent.succeeded':
          await paymentService.confirmPayment(
            transaction._id,
            paymentIntent.id,
            paymentIntent
          );
          break;

        case 'payment_intent.payment_failed':
          await paymentService.failPayment(
            transaction._id,
            paymentIntent.last_payment_error?.message || 'Payment failed'
          );
          break;

        case 'charge.refunded':
          logger.info(`Refund webhook received for ${paymentIntent.id}`);
          break;

        default:
          logger.info(`Unhandled Stripe webhook event: ${event.type}`);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(`Stripe webhook error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new WebhookController();
