const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart for user or session
exports.getCart = async (req, res) => {
  try {
    const { userId, sessionId } = req.query;
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId }).populate('items.productId');
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).populate('items.productId');
    }
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, sessionId, productId, quantity } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = new Cart({ sessionId, items: [] });
      }
    } else {
      return res.status(400).json({ message: 'UserId or sessionId required' });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      });
    }
    
    // Calculate total
    cart.calculateTotal();
    await cart.save();
    
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, sessionId, productId, quantity } = req.body;
    
    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find and update item
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Calculate total
    cart.calculateTotal();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, sessionId, productId } = req.body;
    
    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Remove item
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );
    
    // Calculate total
    cart.calculateTotal();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.appliedCoupon = undefined;
    cart.totalAmount = 0;
    await cart.save();
    
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Apply coupon to cart
exports.applyCoupon = async (req, res) => {
  try {
    const { userId, sessionId, couponCode } = req.body;
    const Coupon = require('../models/Coupon');
    
    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find coupon
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    
    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Validate coupon
    const validation = coupon.isValid(subtotal, userId);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    
    // Calculate discount
    const discount = coupon.calculateDiscount(subtotal);
    
    // Apply coupon
    cart.appliedCoupon = {
      code: coupon.code,
      discount: discount,
      discountType: coupon.discountType
    };
    
    cart.calculateTotal();
    await cart.save();
    
    res.json({ message: 'Coupon applied successfully', cart, discount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove coupon from cart
exports.removeCoupon = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    
    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.appliedCoupon = undefined;
    cart.calculateTotal();
    await cart.save();
    
    res.json({ message: 'Coupon removed', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
