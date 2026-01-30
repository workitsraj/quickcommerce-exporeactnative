# Testing Guide

## Prerequisites
Before testing, ensure you have:
- Node.js installed
- MongoDB running (local or MongoDB Atlas)
- AWS S3 bucket configured (optional - for image upload testing)

## Setup for Testing

### 1. Install Dependencies
```bash
npm install
cd mobile && npm install
cd ..
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file with your MongoDB URI and AWS credentials.

### 3. Start MongoDB
If using local MongoDB:
```bash
mongod --dbpath /path/to/data
```

Or configure MongoDB Atlas connection string in `.env`.

### 4. Seed Test Data
```bash
npm run seed
```

This will create:
- 3 categories (Fresh Fruits, Seasonal Fruits, Vegetables)
- 3 products (Fresh Mango, Organic Apple, Fresh Tomato)
- 5 inventory records

### 5. Start Backend Server
```bash
npm start
```

Server will run on http://localhost:3000

### 6. Test API Endpoints
```bash
node test-api.js
```

## Manual Testing

### Test Category Hierarchy

1. **Create Root Category**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beverages",
    "description": "All beverages"
  }'
```

2. **Create Subcategory**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Soft Drinks",
    "description": "Carbonated beverages",
    "parent": "PARENT_CATEGORY_ID"
  }'
```

3. **Get Category Tree**
```bash
curl http://localhost:3000/api/categories/tree
```

### Test Product Search Performance

1. **Search Products**
```bash
curl "http://localhost:3000/api/products/search?q=mango"
```

Expected: Response time < 500ms with relevant results

2. **Search with Typo Tolerance**
```bash
curl "http://localhost:3000/api/products/search?q=aple"
```

Expected: Should find "Apple" products

### Test Product Filters

1. **Filter by Price Range**
```bash
curl "http://localhost:3000/api/products?minPrice=100&maxPrice=300"
```

2. **Filter by Category and Sort**
```bash
curl "http://localhost:3000/api/products?category=CATEGORY_ID&sortBy=popularity&order=desc"
```

3. **Multiple Filters**
```bash
curl "http://localhost:3000/api/products?minPrice=100&maxPrice=500&tags=organic&sortBy=rating"
```

### Test Inventory Operations

1. **Check Availability**
```bash
curl "http://localhost:3000/api/inventory/check-availability?product=PRODUCT_ID&variantSku=SKU&darkStore=Store-001&quantity=5"
```

2. **Reserve Inventory**
```bash
curl -X POST http://localhost:3000/api/inventory/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "PRODUCT_ID",
        "variantSku": "MNG-500",
        "darkStore": "Store-001",
        "quantity": 2
      }
    ]
  }'
```

3. **Get Low Stock Alerts**
```bash
curl "http://localhost:3000/api/inventory/alerts/low-stock?darkStore=Store-001"
```

4. **Get Reorder Suggestions**
```bash
curl "http://localhost:3000/api/inventory/suggestions/reorder"
```

### Test CSV Upload

1. **Download Product Template**
```bash
curl -O http://localhost:3000/api/upload/templates/products
```

2. **Upload Products CSV**
```bash
curl -X POST http://localhost:3000/api/upload/products \
  -F "file=@products.csv"
```

3. **Download Inventory Template**
```bash
curl -O http://localhost:3000/api/upload/templates/inventory
```

4. **Upload Inventory CSV**
```bash
curl -X POST http://localhost:3000/api/upload/inventory \
  -F "file=@inventory.csv"
```

### Test Product Images (requires AWS S3)

1. **Create Product with Images**
```bash
curl -X POST http://localhost:3000/api/products \
  -F "name=Test Product" \
  -F "description=Test description" \
  -F "category=CATEGORY_ID" \
  -F "variants=[{\"name\":\"Default\",\"sku\":\"TEST-001\",\"price\":100}]" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

## Mobile App Testing

### 1. Start Mobile App
```bash
cd mobile
npm start
```

### 2. Update API URL
Before testing, update `mobile/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP:3000/api';
// For Android emulator: http://10.0.2.2:3000/api
// For iOS simulator: http://localhost:3000/api
// For physical device: http://YOUR_LOCAL_IP:3000/api
```

### 3. Test Screens

**Product List Screen:**
- ✅ Products load correctly
- ✅ Category filters work
- ✅ Sort options work
- ✅ Infinite scroll pagination
- ✅ Pull to refresh

**Search Screen:**
- ✅ Real-time search with debouncing
- ✅ Search results under 500ms
- ✅ Empty states display correctly

**Product Detail Screen:**
- ✅ Product images display
- ✅ Variant selection works
- ✅ Real-time availability check
- ✅ Recommendations load
- ✅ Nutrition info displays

## Performance Testing

### 1. Search Performance
```bash
time curl "http://localhost:3000/api/products/search?q=mango"
```
Expected: < 500ms

### 2. Product Listing with Filters
```bash
time curl "http://localhost:3000/api/products?category=ID&minPrice=100&maxPrice=500"
```
Expected: < 1 second

### 3. Concurrent Requests
Use tools like Apache Bench or Artillery:
```bash
ab -n 1000 -c 10 http://localhost:3000/api/products
```

## Integration Testing

### Order Flow Simulation

1. **Reserve inventory for order**
```bash
curl -X POST http://localhost:3000/api/inventory/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"product": "ID1", "variantSku": "SKU1", "darkStore": "Store-001", "quantity": 2},
      {"product": "ID2", "variantSku": "SKU2", "darkStore": "Store-001", "quantity": 1}
    ]
  }'
```

2. **Check availability after reservation**
```bash
curl "http://localhost:3000/api/inventory/check-availability?product=ID1&variantSku=SKU1&darkStore=Store-001&quantity=1"
```

3. **Fulfill order**
```bash
curl -X POST http://localhost:3000/api/inventory/fulfill \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"product": "ID1", "variantSku": "SKU1", "darkStore": "Store-001", "quantity": 2}
    ]
  }'
```

4. **Verify inventory updated**
```bash
curl "http://localhost:3000/api/inventory/product/ID1?darkStore=Store-001"
```

## Validation Checklist

### Backend
- [ ] All API endpoints return correct status codes
- [ ] Error handling works properly
- [ ] Input validation prevents invalid data
- [ ] Search returns results < 500ms
- [ ] Filters work on multiple parameters
- [ ] Inventory reservation/release works correctly
- [ ] Low stock alerts trigger correctly
- [ ] CSV upload handles errors properly
- [ ] MongoDB indexes are created

### Mobile App
- [ ] Navigation works smoothly
- [ ] Images load correctly
- [ ] Loading states display
- [ ] Error messages show properly
- [ ] Search is responsive
- [ ] Filter UI is intuitive
- [ ] Product details show all information
- [ ] Recommendations display

### Data Integrity
- [ ] Category hierarchy maintains parent-child relationships
- [ ] Product variants have unique SKUs
- [ ] Inventory reservations don't exceed available quantity
- [ ] Inventory available = quantity - reserved
- [ ] Low stock alerts use correct thresholds

## Common Issues and Solutions

### Issue: MongoDB connection fails
**Solution:** 
- Check MongoDB is running: `systemctl status mongod`
- Verify connection string in `.env`
- Check network/firewall settings

### Issue: Search returns no results
**Solution:**
- Ensure text indexes are created: Check server logs on startup
- Run seed script to populate data
- Try exact match search first

### Issue: Mobile app can't connect to API
**Solution:**
- Check API URL in `mobile/src/services/api.js`
- Ensure backend server is running
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, use your computer's local IP

### Issue: Image upload fails
**Solution:**
- Verify AWS credentials in `.env`
- Check S3 bucket permissions
- Ensure bucket name is correct
- For testing without AWS, comment out S3 configuration

## Automated Testing Script

Run the automated test script:
```bash
# Start server in one terminal
npm start

# Run tests in another terminal
node test-api.js
```

## Load Testing

For production readiness, perform load testing:

```bash
# Install artillery
npm install -g artillery

# Create artillery config
artillery quick --count 10 --num 100 http://localhost:3000/api/products
```

## Security Testing

- [ ] SQL/NoSQL injection attempts fail
- [ ] File upload validates file types
- [ ] File upload respects size limits
- [ ] CORS is properly configured
- [ ] Sensitive data not exposed in errors

## Documentation Validation

- [ ] README is clear and complete
- [ ] API documentation matches actual endpoints
- [ ] Setup instructions work from scratch
- [ ] Examples in docs are accurate
- [ ] Environment variables are documented
