const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order routes
router.post('/', orderController.createOrder);
router.get('/:orderId', orderController.getOrder);
router.get('/user/:userId', orderController.getUserOrders);
router.put('/:orderId/status', orderController.updateOrderStatus);
router.post('/:orderId/cancel', orderController.cancelOrder);
router.post('/:orderId/reorder', orderController.reorder);

module.exports = router;
