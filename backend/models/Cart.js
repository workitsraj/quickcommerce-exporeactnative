const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
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

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allow null for guest users
  },
  sessionId: {
    type: String,
    index: true // For guest cart identification
  },
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  appliedCoupon: {
    code: String,
    discount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
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
CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total amount
CartSchema.methods.calculateTotal = function() {
  let total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (this.appliedCoupon) {
    if (this.appliedCoupon.discountType === 'percentage') {
      total = total - (total * this.appliedCoupon.discount / 100);
    } else if (this.appliedCoupon.discountType === 'fixed') {
      total = Math.max(0, total - this.appliedCoupon.discount);
    }
  }
  
  this.totalAmount = total;
  return total;
};

module.exports = mongoose.model('Cart', CartSchema);
