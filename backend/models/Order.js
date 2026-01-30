const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: String
});

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  
  // Pricing breakdown
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  surgeFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Coupon information
  appliedCoupon: {
    code: String,
    discount: Number
  },
  
  // Delivery information
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Delivery slot
  scheduledDelivery: {
    date: Date,
    slot: String // e.g., "9AM-12PM", "12PM-3PM"
  },
  
  // Dark store assignment
  darkStoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DarkStore',
    required: true
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Status history for tracking
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'upi'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Cancellation and refund
  cancellationReason: String,
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processed'],
    default: 'none'
  },
  
  // Invoice
  invoiceUrl: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add status to history when status changes
OrderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
