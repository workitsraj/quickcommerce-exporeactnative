const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create text indexes for search
    await createSearchIndexes();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createSearchIndexes = async () => {
  try {
    const Product = require('../models/Product');
    
    // Create text index for product search
    await Product.collection.createIndex({
      name: 'text',
      description: 'text',
      brand: 'text',
      tags: 'text'
    }, {
      weights: {
        name: 10,
        brand: 5,
        tags: 3,
        description: 1
      }
    });

    console.log('Search indexes created successfully');
  } catch (error) {
    console.log('Index creation:', error.message);
  }
};

module.exports = connectDB;
