const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantSku: {
    type: String,
    required: true,
  },
  darkStore: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  reserved: {
    type: Number,
    default: 0,
    min: 0,
  },
  available: {
    type: Number,
    default: 0,
    min: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
  reorderPoint: {
    type: Number,
    default: 5,
  },
  reorderQuantity: {
    type: Number,
    default: 100,
  },
  lastRestocked: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  location: {
    aisle: String,
    shelf: String,
    bin: String,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
inventorySchema.index({ product: 1, variantSku: 1, darkStore: 1 }, { unique: true });
inventorySchema.index({ darkStore: 1, quantity: 1 });
inventorySchema.index({ quantity: 1 });
inventorySchema.index({ variantSku: 1 });

// Virtual for low stock status
inventorySchema.virtual('isLowStock').get(function() {
  return this.available <= this.lowStockThreshold;
});

// Virtual for out of stock status
inventorySchema.virtual('isOutOfStock').get(function() {
  return this.available === 0;
});

// Virtual for needs reorder
inventorySchema.virtual('needsReorder').get(function() {
  return this.available <= this.reorderPoint;
});

// Pre-save middleware to calculate available quantity
inventorySchema.pre('save', function(next) {
  this.available = this.quantity - this.reserved;
  next();
});

// Method to reserve quantity
inventorySchema.methods.reserve = async function(qty) {
  if (this.available < qty) {
    throw new Error('Insufficient inventory');
  }
  
  this.reserved += qty;
  this.available = this.quantity - this.reserved;
  await this.save();
  
  return this;
};

// Method to release reservation
inventorySchema.methods.releaseReservation = async function(qty) {
  this.reserved = Math.max(0, this.reserved - qty);
  this.available = this.quantity - this.reserved;
  await this.save();
  
  return this;
};

// Method to fulfill order (deduct from quantity)
inventorySchema.methods.fulfill = async function(qty) {
  if (this.reserved < qty) {
    throw new Error('Quantity not reserved');
  }
  
  this.quantity -= qty;
  this.reserved -= qty;
  this.available = this.quantity - this.reserved;
  await this.save();
  
  return this;
};

// Method to restock
inventorySchema.methods.restock = async function(qty) {
  this.quantity += qty;
  this.available = this.quantity - this.reserved;
  this.lastRestocked = new Date();
  await this.save();
  
  return this;
};

// Static method to get low stock items across all stores
inventorySchema.statics.getLowStockItems = async function(darkStore = null) {
  const query = {};
  if (darkStore) {
    query.darkStore = darkStore;
  }
  
  const items = await this.find(query).populate('product');
  return items.filter(item => item.isLowStock);
};

// Static method to get items that need reordering
inventorySchema.statics.getReorderSuggestions = async function(darkStore = null) {
  const query = {};
  if (darkStore) {
    query.darkStore = darkStore;
  }
  
  const items = await this.find(query).populate('product');
  return items.filter(item => item.needsReorder).map(item => ({
    inventory: item,
    product: item.product,
    suggestedQuantity: item.reorderQuantity,
  }));
};

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
