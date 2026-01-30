const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../config/logger');

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(orderId, amount, currency = 'INR', metadata = {}) {
    try {
      const options = {
        amount: amount * 100, // Amount in paise
        currency,
        receipt: orderId,
        notes: metadata,
      };

      const order = await this.razorpay.orders.create(options);
      logger.info(`Razorpay order created: ${order.id}`);
      
      return order;
    } catch (error) {
      logger.error(`Razorpay order creation failed: ${error.message}`);
      throw error;
    }
  }

  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return generated_signature === signature;
    } catch (error) {
      logger.error(`Razorpay signature verification failed: ${error.message}`);
      return false;
    }
  }

  verifyWebhookSignature(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      logger.error(`Razorpay webhook signature verification failed: ${error.message}`);
      return false;
    }
  }

  async createRefund(paymentId, amount = null) {
    try {
      const options = amount ? { amount: amount * 100 } : {};
      const refund = await this.razorpay.payments.refund(paymentId, options);
      logger.info(`Razorpay refund created: ${refund.id}`);
      
      return refund;
    } catch (error) {
      logger.error(`Razorpay refund failed: ${error.message}`);
      throw error;
    }
  }

  async fetchPayment(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      logger.error(`Razorpay payment fetch failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new RazorpayService();
