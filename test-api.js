const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

const testAPI = async () => {
  console.log('🧪 Testing Quick Commerce API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Get Categories
    console.log('2️⃣ Testing Get Categories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    console.log(`✅ Found ${categoriesResponse.data.count} categories`);
    console.log('');

    // Test 3: Get Category Tree
    console.log('3️⃣ Testing Get Category Tree...');
    const treeResponse = await axios.get(`${API_BASE_URL}/categories/tree`);
    console.log('✅ Category tree retrieved');
    console.log('');

    // Test 4: Get Products
    console.log('4️⃣ Testing Get Products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`);
    console.log(`✅ Found ${productsResponse.data.count} products`);
    console.log(`   Query time: ${productsResponse.data.queryTime}`);
    console.log('');

    // Test 5: Search Products
    console.log('5️⃣ Testing Product Search...');
    const searchResponse = await axios.get(`${API_BASE_URL}/products/search`, {
      params: { q: 'mango' }
    });
    console.log(`✅ Search found ${searchResponse.data.count} results`);
    console.log(`   Query time: ${searchResponse.data.queryTime}`);
    console.log('');

    // Test 6: Get Product Details
    if (productsResponse.data.data.length > 0) {
      const productId = productsResponse.data.data[0]._id;
      console.log('6️⃣ Testing Get Product Details...');
      const productResponse = await axios.get(`${API_BASE_URL}/products/${productId}`);
      console.log(`✅ Product details retrieved: ${productResponse.data.data.name}`);
      console.log('');

      // Test 7: Get Recommendations
      console.log('7️⃣ Testing Get Recommendations...');
      const recsResponse = await axios.get(`${API_BASE_URL}/products/${productId}/recommendations`);
      console.log(`✅ Found ${recsResponse.data.data.length} recommendations`);
      console.log('');
    }

    // Test 8: Check Inventory Availability
    console.log('8️⃣ Testing Check Inventory Availability...');
    const availResponse = await axios.get(`${API_BASE_URL}/inventory/check-availability`, {
      params: {
        product: productsResponse.data.data[0]._id,
        variantSku: productsResponse.data.data[0].variants[0].sku,
        darkStore: 'Store-001',
        quantity: 1
      }
    });
    console.log(`✅ Availability check: ${availResponse.data.available ? 'In Stock' : 'Out of Stock'}`);
    console.log(`   Quantity available: ${availResponse.data.quantity}`);
    console.log('');

    // Test 9: Get Low Stock Alerts
    console.log('9️⃣ Testing Get Low Stock Alerts...');
    const lowStockResponse = await axios.get(`${API_BASE_URL}/inventory/alerts/low-stock`);
    console.log(`✅ Found ${lowStockResponse.data.count} low stock items`);
    console.log('');

    // Test 10: Filter Products
    console.log('🔟 Testing Product Filters...');
    const filteredResponse = await axios.get(`${API_BASE_URL}/products`, {
      params: {
        minPrice: 100,
        maxPrice: 500,
        sortBy: 'popularity',
        order: 'desc'
      }
    });
    console.log(`✅ Filtered products: ${filteredResponse.data.count} results`);
    console.log('');

    console.log('🎉 All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
};

// Wait for server to be ready
setTimeout(() => {
  testAPI();
}, 2000);
