const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'COD', 'RAZORPAY', 'STRIPE'],
    required: true,
  },
  paymentGateway: {
    type: String,
    enum: ['RAZORPAY', 'STRIPE', 'WALLET', 'COD'],
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'PENDING',
  },
  gatewayTransactionId: {
    type: String,
    index: true,
  },
  gatewayOrderId: {
    type: String,
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundedAt: {
    type: Date,
  },
  cashbackAmount: {
    type: Number,
    default: 0,
  },
  cashbackApplied: {
    type: Boolean,
    default: false,
  },
  codVerificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'NOT_APPLICABLE'],
    default: 'NOT_APPLICABLE',
  },
  receipt: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  auditLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: mongoose.Schema.Types.Mixed,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

transactionSchema.methods.addAuditLog = function(action, details) {
  this.auditLog.push({
    action,
    details,
    timestamp: new Date(),
  });
};

module.exports = mongoose.model('Transaction', transactionSchema);
