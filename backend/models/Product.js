const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  barcode: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz', 'l', 'ml'],
    },
  },
  attributes: {
    type: Map,
    of: String,
  },
});

const nutritionSchema = new mongoose.Schema({
  servingSize: String,
  calories: Number,
  protein: String,
  carbohydrates: String,
  fat: String,
  fiber: String,
  sugar: String,
  sodium: String,
  ingredients: [String],
  allergens: [String],
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
  },
  brand: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  variants: [variantSchema],
  nutrition: nutritionSchema,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  popularity: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ 'variants.barcode': 1 });
productSchema.index({ slug: 1 });
productSchema.index({ popularity: -1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });

// Method to get price range
productSchema.methods.getPriceRange = function() {
  if (this.variants.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const prices = this.variants.map(v => v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

// Method to get primary image
productSchema.methods.getPrimaryImage = function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || null);
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
