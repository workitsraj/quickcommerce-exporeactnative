const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { getCDNUrl } = require('../config/s3');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      brand,
      category,
      variants,
      nutrition,
      tags,
      isFeatured,
    } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        images.push({
          url: getCDNUrl(file.key),
          alt: name,
          isPrimary: index === 0,
        });
      });
    }
    
    const product = new Product({
      name,
      slug,
      description,
      shortDescription,
      brand,
      category,
      images,
      variants: variants || [],
      nutrition,
      tags: tags || [],
      isFeatured: isFeatured || false,
    });
    
    await product.save();
    await product.populate('category', 'name slug');
    
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all products with filtering and sorting
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      brand,
      tags,
      isFeatured,
      isActive,
      sortBy,
      order,
      page = 1,
      limit = 20,
      search,
    } = req.query;
    
    const filter = {};
    
    // Category filter (include subcategories)
    if (category) {
      const Category = require('../models/Category');
      const cat = await Category.findById(category);
      if (cat) {
        const descendants = await Category.find({
          $or: [
            { _id: category },
            { parent: category },
          ]
        });
        filter.category = { $in: descendants.map(c => c._id) };
      }
    }
    
    // Price range filter (check variants)
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter['variants.price'] = priceFilter;
    }
    
    // Brand filter
    if (brand) {
      filter.brand = brand;
    }
    
    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }
    
    // Featured filter
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }
    
    // Active filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      filter.isActive = true; // Default to active products
    }
    
    // Text search
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Sorting
    let sort = {};
    if (sortBy) {
      const direction = order === 'desc' ? -1 : 1;
      
      switch (sortBy) {
        case 'price':
          sort['variants.price'] = direction;
          break;
        case 'popularity':
          sort.popularity = direction;
          break;
        case 'rating':
          sort['rating.average'] = direction;
          break;
        case 'name':
          sort.name = direction;
          break;
        case 'created':
          sort.createdAt = direction;
          break;
        default:
          sort.createdAt = -1;
      }
    } else if (search) {
      sort.score = { $meta: 'textScore' };
    } else {
      sort.createdAt = -1;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const startTime = Date.now();
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name slug')
      .lean();
    
    const total = await Product.countDocuments(filter);
    const queryTime = Date.now() - startTime;
    
    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      queryTime: `${queryTime}ms`,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Search products with advanced features
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }
    
    const startTime = Date.now();
    
    // Text search with scoring
    const products = await Product.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .populate('category', 'name slug')
      .lean();
    
    const queryTime = Date.now() - startTime;
    
    res.json({
      success: true,
      count: products.length,
      queryTime: `${queryTime}ms`,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    // Increment view count
    product.viewCount += 1;
    await product.save();
    
    // Get inventory for all variants
    const inventory = await Inventory.find({
      product: product._id,
    });
    
    res.json({
      success: true,
      data: {
        ...product.toObject(),
        inventory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    const {
      name,
      description,
      shortDescription,
      brand,
      category,
      variants,
      nutrition,
      tags,
      isActive,
      isFeatured,
    } = req.body;
    
    // Update fields
    if (name) {
      product.name = name;
      product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (brand !== undefined) product.brand = brand;
    if (category) product.category = category;
    if (variants) product.variants = variants;
    if (nutrition) product.nutrition = nutrition;
    if (tags) product.tags = tags;
    if (isActive !== undefined) product.isActive = isActive;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: getCDNUrl(file.key),
        alt: product.name,
        isPrimary: product.images.length === 0 && index === 0,
      }));
      product.images.push(...newImages);
    }
    
    await product.save();
    await product.populate('category', 'name slug');
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    // Delete associated inventory
    await Inventory.deleteMany({ product: product._id });
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get product recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    const limit = parseInt(req.query.limit) || 5;
    
    // Similar products based on category and tags
    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } },
        { brand: product.brand },
      ],
    })
      .sort({ popularity: -1, 'rating.average': -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .lean();
    
    res.json({
      success: true,
      data: similarProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get frequently bought together products (placeholder - would use order history)
exports.getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    const limit = parseInt(req.query.limit) || 3;
    
    // For now, return popular products from the same category
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    })
      .sort({ popularity: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .lean();
    
    res.json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
