const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// Create or update inventory
exports.upsertInventory = async (req, res) => {
  try {
    const {
      product,
      variantSku,
      darkStore,
      quantity,
      lowStockThreshold,
      reorderPoint,
      reorderQuantity,
      expiryDate,
      location,
    } = req.body;
    
    // Verify product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    // Verify variant exists
    const variant = productDoc.variants.find(v => v.sku === variantSku);
    if (!variant) {
      return res.status(404).json({
        success: false,
        error: 'Variant not found',
      });
    }
    
    // Find existing inventory or create new
    let inventory = await Inventory.findOne({
      product,
      variantSku,
      darkStore,
    });
    
    if (inventory) {
      // Update existing
      inventory.quantity = quantity;
      if (lowStockThreshold !== undefined) inventory.lowStockThreshold = lowStockThreshold;
      if (reorderPoint !== undefined) inventory.reorderPoint = reorderPoint;
      if (reorderQuantity !== undefined) inventory.reorderQuantity = reorderQuantity;
      if (expiryDate) inventory.expiryDate = expiryDate;
      if (location) inventory.location = location;
    } else {
      // Create new
      inventory = new Inventory({
        product,
        variantSku,
        darkStore,
        quantity,
        lowStockThreshold: lowStockThreshold || 10,
        reorderPoint: reorderPoint || 5,
        reorderQuantity: reorderQuantity || 100,
        expiryDate,
        location,
      });
    }
    
    await inventory.save();
    await inventory.populate('product');
    
    res.status(inventory.isNew ? 201 : 200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get inventory for a product
exports.getProductInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { darkStore } = req.query;
    
    const filter = { product: productId };
    if (darkStore) {
      filter.darkStore = darkStore;
    }
    
    const inventory = await Inventory.find(filter)
      .populate('product', 'name slug');
    
    res.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get inventory for a dark store
exports.getDarkStoreInventory = async (req, res) => {
  try {
    const { darkStore } = req.params;
    const { lowStockOnly, outOfStockOnly, page = 1, limit = 50 } = req.query;
    
    const filter = { darkStore };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let inventory = await Inventory.find(filter)
      .populate('product', 'name slug brand images')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Apply filters after population
    if (lowStockOnly === 'true') {
      inventory = inventory.filter(item => item.available <= item.lowStockThreshold);
    }
    
    if (outOfStockOnly === 'true') {
      inventory = inventory.filter(item => item.available === 0);
    }
    
    const total = await Inventory.countDocuments(filter);
    
    res.json({
      success: true,
      darkStore,
      count: inventory.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Reserve inventory (for order placement)
exports.reserveInventory = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ product, variantSku, darkStore, quantity }]
    
    const reservations = [];
    const errors = [];
    
    for (const item of items) {
      try {
        const inventory = await Inventory.findOne({
          product: item.product,
          variantSku: item.variantSku,
          darkStore: item.darkStore,
        });
        
        if (!inventory) {
          errors.push({
            item,
            error: 'Inventory not found',
          });
          continue;
        }
        
        if (inventory.available < item.quantity) {
          errors.push({
            item,
            error: `Insufficient inventory. Available: ${inventory.available}`,
          });
          continue;
        }
        
        await inventory.reserve(item.quantity);
        reservations.push({
          item,
          inventory: inventory._id,
        });
      } catch (error) {
        errors.push({
          item,
          error: error.message,
        });
      }
    }
    
    res.json({
      success: errors.length === 0,
      reservations,
      errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Release reservation (for order cancellation)
exports.releaseReservation = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ product, variantSku, darkStore, quantity }]
    
    const releases = [];
    const errors = [];
    
    for (const item of items) {
      try {
        const inventory = await Inventory.findOne({
          product: item.product,
          variantSku: item.variantSku,
          darkStore: item.darkStore,
        });
        
        if (!inventory) {
          errors.push({
            item,
            error: 'Inventory not found',
          });
          continue;
        }
        
        await inventory.releaseReservation(item.quantity);
        releases.push({
          item,
          inventory: inventory._id,
        });
      } catch (error) {
        errors.push({
          item,
          error: error.message,
        });
      }
    }
    
    res.json({
      success: errors.length === 0,
      releases,
      errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Fulfill order (deduct from inventory)
exports.fulfillOrder = async (req, res) => {
  try {
    const { items } = req.body; // items: [{ product, variantSku, darkStore, quantity }]
    
    const fulfillments = [];
    const errors = [];
    
    for (const item of items) {
      try {
        const inventory = await Inventory.findOne({
          product: item.product,
          variantSku: item.variantSku,
          darkStore: item.darkStore,
        });
        
        if (!inventory) {
          errors.push({
            item,
            error: 'Inventory not found',
          });
          continue;
        }
        
        await inventory.fulfill(item.quantity);
        fulfillments.push({
          item,
          inventory: inventory._id,
        });
      } catch (error) {
        errors.push({
          item,
          error: error.message,
        });
      }
    }
    
    res.json({
      success: errors.length === 0,
      fulfillments,
      errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Restock inventory
exports.restockInventory = async (req, res) => {
  try {
    const { product, variantSku, darkStore, quantity } = req.body;
    
    const inventory = await Inventory.findOne({
      product,
      variantSku,
      darkStore,
    });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found',
      });
    }
    
    await inventory.restock(quantity);
    await inventory.populate('product');
    
    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  try {
    const { darkStore } = req.query;
    
    const items = await Inventory.getLowStockItems(darkStore);
    
    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get reorder suggestions
exports.getReorderSuggestions = async (req, res) => {
  try {
    const { darkStore } = req.query;
    
    const suggestions = await Inventory.getReorderSuggestions(darkStore);
    
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Check availability
exports.checkAvailability = async (req, res) => {
  try {
    const { product, variantSku, darkStore, quantity } = req.query;
    
    const inventory = await Inventory.findOne({
      product,
      variantSku,
      darkStore,
    });
    
    if (!inventory) {
      return res.json({
        success: true,
        available: false,
        reason: 'Not stocked at this location',
      });
    }
    
    const available = inventory.available >= parseInt(quantity || 1);
    
    res.json({
      success: true,
      available,
      quantity: inventory.available,
      isLowStock: inventory.isLowStock,
      isOutOfStock: inventory.isOutOfStock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
