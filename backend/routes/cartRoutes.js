const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Cart routes
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove', cartController.removeFromCart);
router.post('/clear', cartController.clearCart);
router.post('/apply-coupon', cartController.applyCoupon);
router.post('/remove-coupon', cartController.removeCoupon);

module.exports = router;
