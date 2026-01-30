const csv = require('csv-parser');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Inventory = require('../models/Inventory');
const { Readable } = require('stream');

// Upload products from CSV
exports.uploadProductsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No CSV file uploaded',
      });
    }
    
    const results = [];
    const errors = [];
    let lineNumber = 0;
    
    // Parse CSV
    const stream = Readable.from(req.file.buffer.toString());
    
    const parsePromise = new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          lineNumber++;
          results.push({ line: lineNumber, data });
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });
    
    await parsePromise;
    
    const created = [];
    const updated = [];
    
    // Process each row
    for (const row of results) {
      try {
        const {
          name,
          description,
          shortDescription,
          brand,
          categorySlug,
          sku,
          barcode,
          price,
          compareAtPrice,
          weight,
          weightUnit,
          tags,
        } = row.data;
        
        // Validate required fields
        if (!name || !description || !categorySlug || !sku || !price) {
          errors.push({
            line: row.line,
            error: 'Missing required fields (name, description, categorySlug, sku, price)',
            data: row.data,
          });
          continue;
        }
        
        // Find category
        const category = await Category.findOne({ slug: categorySlug.trim().toLowerCase() });
        if (!category) {
          errors.push({
            line: row.line,
            error: `Category not found: ${categorySlug}`,
            data: row.data,
          });
          continue;
        }
        
        // Generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        // Check if product exists
        let product = await Product.findOne({ slug });
        
        const variant = {
          name: 'Default',
          sku: sku.trim(),
          barcode: barcode ? barcode.trim() : undefined,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
          weight: weight && weightUnit ? {
            value: parseFloat(weight),
            unit: weightUnit.trim(),
          } : undefined,
        };
        
        if (product) {
          // Update existing product
          const existingVariantIndex = product.variants.findIndex(v => v.sku === variant.sku);
          if (existingVariantIndex >= 0) {
            product.variants[existingVariantIndex] = variant;
          } else {
            product.variants.push(variant);
          }
          
          product.description = description.trim();
          if (shortDescription) product.shortDescription = shortDescription.trim();
          if (brand) product.brand = brand.trim();
          product.category = category._id;
          if (tags) {
            product.tags = tags.split(',').map(t => t.trim());
          }
          
          await product.save();
          updated.push(product);
        } else {
          // Create new product
          product = new Product({
            name: name.trim(),
            slug,
            description: description.trim(),
            shortDescription: shortDescription ? shortDescription.trim() : undefined,
            brand: brand ? brand.trim() : undefined,
            category: category._id,
            variants: [variant],
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
          });
          
          await product.save();
          created.push(product);
        }
      } catch (error) {
        errors.push({
          line: row.line,
          error: error.message,
          data: row.data,
        });
      }
    }
    
    res.json({
      success: errors.length === 0,
      summary: {
        totalRows: results.length,
        created: created.length,
        updated: updated.length,
        errors: errors.length,
      },
      created,
      updated,
      errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Upload inventory from CSV
exports.uploadInventoryCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No CSV file uploaded',
      });
    }
    
    const results = [];
    const errors = [];
    let lineNumber = 0;
    
    // Parse CSV
    const stream = Readable.from(req.file.buffer.toString());
    
    const parsePromise = new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          lineNumber++;
          results.push({ line: lineNumber, data });
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });
    
    await parsePromise;
    
    const created = [];
    const updated = [];
    
    // Process each row
    for (const row of results) {
      try {
        const {
          sku,
          darkStore,
          quantity,
          lowStockThreshold,
          reorderPoint,
          reorderQuantity,
        } = row.data;
        
        // Validate required fields
        if (!sku || !darkStore || quantity === undefined) {
          errors.push({
            line: row.line,
            error: 'Missing required fields (sku, darkStore, quantity)',
            data: row.data,
          });
          continue;
        }
        
        // Find product by SKU
        const product = await Product.findOne({ 'variants.sku': sku.trim() });
        if (!product) {
          errors.push({
            line: row.line,
            error: `Product not found for SKU: ${sku}`,
            data: row.data,
          });
          continue;
        }
        
        // Find existing inventory or create new
        let inventory = await Inventory.findOne({
          product: product._id,
          variantSku: sku.trim(),
          darkStore: darkStore.trim(),
        });
        
        if (inventory) {
          // Update existing
          inventory.quantity = parseInt(quantity);
          if (lowStockThreshold) inventory.lowStockThreshold = parseInt(lowStockThreshold);
          if (reorderPoint) inventory.reorderPoint = parseInt(reorderPoint);
          if (reorderQuantity) inventory.reorderQuantity = parseInt(reorderQuantity);
          
          await inventory.save();
          updated.push(inventory);
        } else {
          // Create new
          inventory = new Inventory({
            product: product._id,
            variantSku: sku.trim(),
            darkStore: darkStore.trim(),
            quantity: parseInt(quantity),
            lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 10,
            reorderPoint: reorderPoint ? parseInt(reorderPoint) : 5,
            reorderQuantity: reorderQuantity ? parseInt(reorderQuantity) : 100,
          });
          
          await inventory.save();
          created.push(inventory);
        }
      } catch (error) {
        errors.push({
          line: row.line,
          error: error.message,
          data: row.data,
        });
      }
    }
    
    res.json({
      success: errors.length === 0,
      summary: {
        totalRows: results.length,
        created: created.length,
        updated: updated.length,
        errors: errors.length,
      },
      created,
      updated,
      errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Download sample CSV templates
exports.downloadProductTemplate = (req, res) => {
  const template = `name,description,shortDescription,brand,categorySlug,sku,barcode,price,compareAtPrice,weight,weightUnit,tags
Fresh Mango,Sweet and juicy mangoes,Seasonal fruit,FreshFarms,seasonal-fruits,MNG-001,1234567890,299,349,500,g,"fruit,seasonal,mango"
Organic Apple,Crisp organic apples,Healthy snack,OrganicHarvest,fresh-fruits,APL-001,0987654321,199,249,250,g,"fruit,organic,apple"`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=product-template.csv');
  res.send(template);
};

exports.downloadInventoryTemplate = (req, res) => {
  const template = `sku,darkStore,quantity,lowStockThreshold,reorderPoint,reorderQuantity
MNG-001,Store-001,500,50,20,200
APL-001,Store-001,300,30,15,150
MNG-001,Store-002,400,50,20,200`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=inventory-template.csv');
  res.send(template);
};
