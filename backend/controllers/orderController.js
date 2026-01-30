const Order = require('../models/Order');
const Cart = require('../models/Cart');
const DarkStore = require('../models/DarkStore');
const Coupon = require('../models/Coupon');
const { v4: uuidv4 } = require('uuid');
const { generateInvoice } = require('../utils/invoiceGenerator');
const { findNearestDarkStore } = require('../utils/darkStoreUtils');

// Pricing configuration
const PRICING_CONFIG = {
  deliveryFee: 50,
  surgeFeePercentage: 0, // Can be dynamically set based on demand
  taxPercentage: 5, // 5% tax
};

// Calculate pricing
const calculatePricing = (subtotal, appliedDiscount = 0) => {
  const discount = appliedDiscount;
  const amountAfterDiscount = subtotal - discount;
  const deliveryFee = PRICING_CONFIG.deliveryFee;
  const surgeFee = (amountAfterDiscount * PRICING_CONFIG.surgeFeePercentage) / 100;
  const tax = (amountAfterDiscount * PRICING_CONFIG.taxPercentage) / 100;
  const totalAmount = amountAfterDiscount + deliveryFee + surgeFee + tax;
  
  return {
    subtotal,
    deliveryFee,
    surgeFee,
    tax,
    discount,
    totalAmount
  };
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      deliveryAddress,
      scheduledDelivery,
      paymentMethod,
      couponCode
    } = req.body;
    
    if (!userId || !items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Apply coupon if provided
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validation = coupon.isValid(subtotal, userId);
        if (validation.valid) {
          discount = coupon.calculateDiscount(subtotal);
          appliedCoupon = {
            code: coupon.code,
            discount: discount
          };
          // Increment usage count
          coupon.usageCount += 1;
          await coupon.save();
        }
      }
    }
    
    // Calculate pricing
    const pricing = calculatePricing(subtotal, discount);
    
    // Find nearest dark store with inventory
    const darkStore = await findNearestDarkStore(
      deliveryAddress.coordinates.latitude,
      deliveryAddress.coordinates.longitude,
      items
    );
    
    if (!darkStore) {
      return res.status(400).json({ 
        message: 'No dark store available with required inventory' 
      });
    }
    
    // Create order
    const order = new Order({
      orderId: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
      userId,
      items,
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      surgeFee: pricing.surgeFee,
      tax: pricing.tax,
      discount: pricing.discount,
      totalAmount: pricing.totalAmount,
      appliedCoupon,
      deliveryAddress,
      scheduledDelivery,
      darkStoreId: darkStore._id,
      paymentMethod,
      status: 'pending'
    });
    
    await order.save();
    
    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [], appliedCoupon: undefined, totalAmount: 0 } }
    );
    
    // Generate invoice
    try {
      const invoiceUrl = await generateInvoice(order);
      order.invoiceUrl = invoiceUrl;
      await order.save();
    } catch (invoiceError) {
      console.error('Invoice generation failed:', invoiceError);
      // Continue without invoice - can be generated later
    }
    
    // Emit socket event for order created (if socket is available)
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userId}`).emit('orderCreated', order);
    }
    
    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId })
      .populate('userId', 'name email phone')
      .populate('darkStoreId', 'name address');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { userId };
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('darkStoreId', 'name address');
    
    const count = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update status
    order.status = status;
    if (note) {
      order.statusHistory[order.statusHistory.length - 1].note = note;
    }
    
    await order.save();
    
    // Emit socket event for status update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${order.userId}`).emit('orderStatusUpdated', {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory
      });
    }
    
    res.json({
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only allow cancellation for pending and confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }
    
    order.status = 'cancelled';
    order.cancellationReason = reason;
    
    // Process refund if payment was made
    if (order.paymentStatus === 'paid') {
      order.refundAmount = order.totalAmount;
      order.refundStatus = 'pending';
      order.paymentStatus = 'refunded';
      // In production, integrate with payment gateway for actual refund
    }
    
    await order.save();
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${order.userId}`).emit('orderCancelled', {
        orderId: order.orderId,
        status: order.status,
        refundStatus: order.refundStatus
      });
    }
    
    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reorder - Create new order from existing order
exports.reorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryAddress, scheduledDelivery, paymentMethod } = req.body;
    
    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Create new order with items from existing order
    const newOrderData = {
      userId: existingOrder.userId,
      items: existingOrder.items,
      deliveryAddress: deliveryAddress || existingOrder.deliveryAddress,
      scheduledDelivery: scheduledDelivery || existingOrder.scheduledDelivery,
      paymentMethod: paymentMethod || existingOrder.paymentMethod
    };
    
    // Use createOrder logic
    req.body = newOrderData;
    return exports.createOrder(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
