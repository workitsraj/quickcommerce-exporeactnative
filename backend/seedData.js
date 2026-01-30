const mongoose = require('mongoose');
const Product = require('./models/Product');
const DarkStore = require('./models/DarkStore');
const Coupon = require('./models/Coupon');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickcommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await DarkStore.deleteMany({});
    await Coupon.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create sample products
    const products = await Product.insertMany([
      {
        name: 'Fresh Apples',
        description: 'Organic red apples',
        price: 4.99,
        image: 'https://via.placeholder.com/150',
        category: 'Fruits',
        unit: 'kg',
        inStock: true,
      },
      {
        name: 'Milk',
        description: 'Fresh whole milk',
        price: 3.49,
        image: 'https://via.placeholder.com/150',
        category: 'Dairy',
        unit: 'liter',
        inStock: true,
      },
      {
        name: 'Bread',
        description: 'Whole wheat bread',
        price: 2.99,
        image: 'https://via.placeholder.com/150',
        category: 'Bakery',
        unit: 'loaf',
        inStock: true,
      },
      {
        name: 'Eggs',
        description: 'Farm fresh eggs',
        price: 5.99,
        image: 'https://via.placeholder.com/150',
        category: 'Dairy',
        unit: 'dozen',
        inStock: true,
      },
      {
        name: 'Orange Juice',
        description: 'Freshly squeezed',
        price: 6.99,
        image: 'https://via.placeholder.com/150',
        category: 'Beverages',
        unit: 'liter',
        inStock: true,
      },
    ]);
    console.log(`Created ${products.length} products`);

    // Create sample dark stores
    const darkStores = await DarkStore.insertMany([
      {
        name: 'Downtown Store',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749], // [longitude, latitude]
        },
        inventory: products.map(p => ({
          productId: p._id,
          quantity: 100,
        })),
        isActive: true,
        operatingHours: {
          open: '08:00',
          close: '22:00',
        },
      },
      {
        name: 'Mission District Store',
        address: {
          street: '456 Valencia St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94110',
          country: 'USA',
        },
        location: {
          type: 'Point',
          coordinates: [-122.4216, 37.7599],
        },
        inventory: products.map(p => ({
          productId: p._id,
          quantity: 80,
        })),
        isActive: true,
        operatingHours: {
          open: '07:00',
          close: '23:00',
        },
      },
    ]);
    console.log(`Created ${darkStores.length} dark stores`);

    // Create sample coupons
    const coupons = await Coupon.insertMany([
      {
        code: 'WELCOME10',
        description: '10% off on first order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 20,
        maxDiscount: 10,
        usageLimit: 100,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        code: 'SAVE5',
        description: '$5 off on orders above $30',
        discountType: 'fixed',
        discountValue: 5,
        minOrderAmount: 30,
        usageLimit: 50,
        isActive: true,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      },
      {
        code: 'FLAT20',
        description: '20% off on orders above $50',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 50,
        maxDiscount: 20,
        usageLimit: 200,
        isActive: true,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    ]);
    console.log(`Created ${coupons.length} coupons`);

    // Create sample user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890',
      addresses: [
        {
          street: '789 Market St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'USA',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          isDefault: true,
        },
      ],
    });
    console.log(`Created test user: ${user.email}`);

    console.log('\n✅ Seed data created successfully!');
    console.log('\nSample Data:');
    console.log('- Products:', products.length);
    console.log('- Dark Stores:', darkStores.length);
    console.log('- Coupons:', coupons.length);
    console.log('- User: test@example.com (password: password123)');
    console.log('\nAvailable Coupons:');
    coupons.forEach(c => {
      console.log(`  - ${c.code}: ${c.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
