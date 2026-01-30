const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// Coupon routes
router.get('/', couponController.getAllCoupons);
router.post('/validate', couponController.validateCoupon);
router.post('/', couponController.createCoupon);

module.exports = router;
