const Stripe = require('stripe');
const logger = require('../config/logger');

class StripeService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent(orderId, amount, currency = 'inr', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Amount in smallest currency unit
        currency,
        metadata: {
          orderId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Stripe payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error(`Stripe payment intent creation failed: ${error.message}`);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      logger.info(`Stripe payment confirmed: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error(`Stripe payment confirmation failed: ${error.message}`);
      throw error;
    }
  }

  async createRefund(paymentIntentId, amount = null) {
    try {
      const options = {
        payment_intent: paymentIntentId,
      };
      
      if (amount) {
        options.amount = amount * 100;
      }

      const refund = await this.stripe.refunds.create(options);
      logger.info(`Stripe refund created: ${refund.id}`);
      
      return refund;
    } catch (error) {
      logger.error(`Stripe refund failed: ${error.message}`);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error(`Stripe payment intent retrieval failed: ${error.message}`);
      throw error;
    }
  }

  verifyWebhookSignature(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      logger.error(`Stripe webhook signature verification failed: ${error.message}`);
      return null;
    }
  }
}

module.exports = new StripeService();
