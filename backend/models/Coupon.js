const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: Number, // Maximum discount for percentage type
  usageLimit: Number, // Total usage limit
  usageCount: {
    type: Number,
    default: 0
  },
  userUsageLimit: {
    type: Number,
    default: 1 // Per user limit
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to validate coupon
CouponSchema.methods.isValid = function(orderAmount, userId) {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }
  
  // Check date validity
  if (this.validFrom > now) {
    return { valid: false, message: 'Coupon is not yet valid' };
  }
  if (this.validUntil && this.validUntil < now) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  
  // Check minimum order amount
  if (orderAmount < this.minOrderAmount) {
    return { valid: false, message: `Minimum order amount is ${this.minOrderAmount}` };
  }
  
  return { valid: true };
};

// Calculate discount
CouponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else if (this.discountType === 'fixed') {
    discount = Math.min(this.discountValue, orderAmount);
  }
  
  return discount;
};

module.exports = mongoose.model('Coupon', CouponSchema);
