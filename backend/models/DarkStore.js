const mongoose = require('mongoose');

const DarkStoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  inventory: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    open: String,
    close: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
DarkStoreSchema.index({ location: '2dsphere' });

// Method to check if product is available
DarkStoreSchema.methods.hasInventory = function(productId, quantity) {
  const item = this.inventory.find(i => i.productId.toString() === productId.toString());
  return item && item.quantity >= quantity;
};

// Method to check if all products in order are available
DarkStoreSchema.methods.canFulfillOrder = function(orderItems) {
  for (let item of orderItems) {
    if (!this.hasInventory(item.productId, item.quantity)) {
      return false;
    }
  }
  return true;
};

module.exports = mongoose.model('DarkStore', DarkStoreSchema);
