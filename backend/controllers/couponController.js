const Coupon = require('../models/Coupon');

// Get all active coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Validate coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    
    const validation = coupon.isValid(orderAmount, userId);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    
    const discount = coupon.calculateDiscount(orderAmount);
    
    res.json({
      valid: true,
      discount,
      finalAmount: orderAmount - discount,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create coupon (admin)
exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
