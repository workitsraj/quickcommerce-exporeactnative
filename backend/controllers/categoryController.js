const Category = require('../models/Category');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent, image } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Calculate level based on parent
    let level = 0;
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(404).json({ error: 'Parent category not found' });
      }
      level = parentCategory.level + 1;
    }
    
    const category = new Category({
      name,
      slug,
      description,
      parent: parent || null,
      level,
      image,
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all categories with hierarchy
exports.getCategories = async (req, res) => {
  try {
    const { parent, level, includeInactive } = req.query;
    
    const filter = {};
    if (parent) {
      filter.parent = parent === 'null' ? null : parent;
    }
    if (level !== undefined) {
      filter.level = parseInt(level);
    }
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .populate('parent', 'name slug');
    
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get category hierarchy (tree structure)
exports.getCategoryTree = async (req, res) => {
  try {
    const rootCategories = await Category.find({ parent: null, isActive: true })
      .sort({ sortOrder: 1, name: 1 });
    
    const buildTree = async (categories) => {
      const tree = [];
      for (const category of categories) {
        const children = await Category.find({ parent: category._id, isActive: true })
          .sort({ sortOrder: 1, name: 1 });
        
        const node = {
          ...category.toObject(),
          children: children.length > 0 ? await buildTree(children) : [],
        };
        tree.push(node);
      }
      return tree;
    };
    
    const tree = await buildTree(rootCategories);
    
    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    // Get children
    const children = await Category.find({ parent: category._id })
      .sort({ sortOrder: 1, name: 1 });
    
    // Get path
    const path = await category.getPath();
    
    res.json({
      success: true,
      data: {
        ...category.toObject(),
        children,
        path,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, parent, image, isActive, sortOrder } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    // Update fields
    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    
    // Update parent and level
    if (parent !== undefined) {
      if (parent && parent !== category.parent?.toString()) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          return res.status(404).json({ error: 'Parent category not found' });
        }
        category.parent = parent;
        category.level = parentCategory.level + 1;
      } else if (!parent) {
        category.parent = null;
        category.level = 0;
      }
    }
    
    await category.save();
    
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    // Check if category has children
    const children = await Category.find({ parent: category._id });
    if (children.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with subcategories',
      });
    }
    
    // Check if category has products
    const Product = require('../models/Product');
    const products = await Product.countDocuments({ category: category._id });
    if (products > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with products',
      });
    }
    
    await category.deleteOne();
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
