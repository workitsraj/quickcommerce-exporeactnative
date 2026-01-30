const mongoose = require('mongoose');
const Category = require('./backend/models/Category');
const Product = require('./backend/models/Product');
const Inventory = require('./backend/models/Inventory');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const rootCategory1 = await Category.create({
      name: 'Fresh Fruits',
      slug: 'fresh-fruits',
      description: 'Fresh and seasonal fruits',
      level: 0,
    });

    const subCategory1 = await Category.create({
      name: 'Seasonal Fruits',
      slug: 'seasonal-fruits',
      description: 'Fruits in season',
      parent: rootCategory1._id,
      level: 1,
    });

    const rootCategory2 = await Category.create({
      name: 'Vegetables',
      slug: 'vegetables',
      description: 'Fresh vegetables',
      level: 0,
    });

    console.log('Created categories');

    // Create products
    const product1 = await Product.create({
      name: 'Fresh Mango',
      slug: 'fresh-mango',
      description: 'Sweet and juicy Alphonso mangoes, handpicked from the finest orchards. Rich in vitamins and perfect for the summer season.',
      shortDescription: 'Sweet and juicy mangoes',
      brand: 'FreshFarms',
      category: subCategory1._id,
      variants: [
        {
          name: '500g',
          sku: 'MNG-500',
          barcode: '1234567890123',
          price: 299,
          compareAtPrice: 349,
          weight: { value: 500, unit: 'g' },
        },
        {
          name: '1kg',
          sku: 'MNG-1000',
          barcode: '1234567890124',
          price: 549,
          compareAtPrice: 649,
          weight: { value: 1000, unit: 'g' },
        },
      ],
      nutrition: {
        servingSize: '100g',
        calories: 60,
        protein: '0.8g',
        carbohydrates: '15g',
        fat: '0.4g',
        fiber: '1.6g',
        sugar: '13.7g',
        ingredients: ['Mango'],
        allergens: [],
      },
      tags: ['fruit', 'seasonal', 'mango', 'summer'],
      rating: { average: 4.5, count: 120 },
      popularity: 95,
      isFeatured: true,
    });

    const product2 = await Product.create({
      name: 'Organic Apple',
      slug: 'organic-apple',
      description: 'Crisp and sweet organic apples from certified organic farms. No pesticides or chemicals used.',
      shortDescription: 'Crisp organic apples',
      brand: 'OrganicHarvest',
      category: rootCategory1._id,
      variants: [
        {
          name: '250g',
          sku: 'APL-250',
          barcode: '1234567890125',
          price: 149,
          compareAtPrice: 199,
          weight: { value: 250, unit: 'g' },
        },
        {
          name: '500g',
          sku: 'APL-500',
          barcode: '1234567890126',
          price: 279,
          compareAtPrice: 349,
          weight: { value: 500, unit: 'g' },
        },
      ],
      nutrition: {
        servingSize: '100g',
        calories: 52,
        protein: '0.3g',
        carbohydrates: '14g',
        fat: '0.2g',
        fiber: '2.4g',
        sugar: '10.4g',
        ingredients: ['Apple'],
        allergens: [],
      },
      tags: ['fruit', 'organic', 'apple', 'healthy'],
      rating: { average: 4.7, count: 85 },
      popularity: 88,
      isFeatured: true,
    });

    const product3 = await Product.create({
      name: 'Fresh Tomato',
      slug: 'fresh-tomato',
      description: 'Fresh and ripe tomatoes, perfect for salads and cooking. Rich in lycopene and vitamins.',
      shortDescription: 'Fresh ripe tomatoes',
      brand: 'FreshFarms',
      category: rootCategory2._id,
      variants: [
        {
          name: '500g',
          sku: 'TOM-500',
          barcode: '1234567890127',
          price: 89,
          compareAtPrice: 120,
          weight: { value: 500, unit: 'g' },
        },
      ],
      tags: ['vegetable', 'tomato', 'fresh'],
      rating: { average: 4.3, count: 65 },
      popularity: 75,
    });

    console.log('Created products');

    // Create inventory
    await Inventory.create([
      {
        product: product1._id,
        variantSku: 'MNG-500',
        darkStore: 'Store-001',
        quantity: 500,
        lowStockThreshold: 50,
        reorderPoint: 20,
        reorderQuantity: 200,
      },
      {
        product: product1._id,
        variantSku: 'MNG-1000',
        darkStore: 'Store-001',
        quantity: 300,
        lowStockThreshold: 30,
        reorderPoint: 15,
        reorderQuantity: 150,
      },
      {
        product: product2._id,
        variantSku: 'APL-250',
        darkStore: 'Store-001',
        quantity: 400,
        lowStockThreshold: 40,
        reorderPoint: 20,
        reorderQuantity: 200,
      },
      {
        product: product2._id,
        variantSku: 'APL-500',
        darkStore: 'Store-001',
        quantity: 250,
        lowStockThreshold: 25,
        reorderPoint: 10,
        reorderQuantity: 100,
      },
      {
        product: product3._id,
        variantSku: 'TOM-500',
        darkStore: 'Store-001',
        quantity: 600,
        lowStockThreshold: 60,
        reorderPoint: 30,
        reorderQuantity: 300,
      },
    ]);

    console.log('Created inventory');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nSummary:');
    console.log('- Categories: 3');
    console.log('- Products: 3');
    console.log('- Inventory items: 5');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
