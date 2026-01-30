# Quick Commerce - Product Catalog & Real-time Inventory System

A comprehensive product management system with real-time inventory tracking for a quick commerce React Native application.

## 🎯 Features

### Backend Features
- ✅ Multi-level category hierarchy (e.g., Fruits → Seasonal Fruits → Mangoes)
- ✅ Product CRUD with rich details (images, variants, nutrition info)
- ✅ SKU management & barcode integration
- ✅ Real-time inventory tracking per dark store
- ✅ Low stock alerts & auto-reordering suggestions
- ✅ Product search with MongoDB text indexes (<500ms response time)
- ✅ Advanced filtering & sorting (price, discount, popularity, rating)
- ✅ Product recommendations engine
- ✅ CSV batch upload for products and inventory
- ✅ AWS S3 integration for product images with CloudFront CDN support

### Mobile App Features
- ✅ Product listing with category filters
- ✅ Real-time product search
- ✅ Product detail view with variants
- ✅ Real-time inventory availability check
- ✅ Product recommendations
- ✅ Responsive UI with loading states

## 🏗️ Architecture

### Backend Stack
- **Node.js** with **Express.js** - REST API server
- **MongoDB** with **Mongoose** - Database and ODM
- **AWS S3** - Product image storage
- **AWS CloudFront** - CDN for fast image delivery
- **Multer & Multer-S3** - File upload handling

### Mobile Stack
- **React Native** with **Expo** - Cross-platform mobile app
- **React Navigation** - Navigation between screens
- **Axios** - HTTP client for API calls

## 📁 Project Structure

```
quickcommerce-exporeactnative/
├── backend/
│   ├── config/
│   │   ├── database.js      # MongoDB connection & search indexes
│   │   └── s3.js            # AWS S3 configuration
│   ├── models/
│   │   ├── Category.js      # Category schema with hierarchy support
│   │   ├── Product.js       # Product schema with variants & nutrition
│   │   └── Inventory.js     # Inventory schema with real-time tracking
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── inventoryController.js
│   │   └── uploadController.js
│   └── routes/
│       ├── categoryRoutes.js
│       ├── productRoutes.js
│       ├── inventoryRoutes.js
│       └── uploadRoutes.js
├── mobile/
│   └── src/
│       ├── screens/
│       │   ├── ProductListScreen.js
│       │   ├── ProductDetailScreen.js
│       │   └── SearchScreen.js
│       ├── components/
│       │   ├── ProductCard.js
│       │   └── CategoryFilter.js
│       ├── services/
│       │   └── api.js
│       ├── navigation/
│       │   └── AppNavigator.js
│       └── utils/
│           └── helpers.js
├── server.js                # Main server entry point
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- AWS Account (for S3 and CloudFront) - optional for testing
- Expo CLI (for mobile development)

### Backend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/quickcommerce
PORT=3000
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=quickcommerce-products
AWS_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
```

3. **Start the server:**
```bash
npm start
```

The server will run on http://localhost:3000

### Mobile App Setup

1. **Navigate to mobile directory:**
```bash
cd mobile
```

2. **Install dependencies:**
```bash
npm install
```

3. **Update API URL:**
Edit `mobile/src/services/api.js` and update `API_BASE_URL` with your backend URL:
```javascript
const API_BASE_URL = 'http://your-backend-url:3000/api';
// For local development on emulator: http://10.0.2.2:3000/api (Android)
// For local development on device: http://your-local-ip:3000/api
```

4. **Start the app:**
```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for Web

## 📚 API Documentation

### Categories

#### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Fresh Fruits",
  "description": "Fresh and seasonal fruits",
  "parent": null,  // or parent category ID for subcategory
  "image": "https://cdn.example.com/fruits.jpg"
}
```

#### Get All Categories
```http
GET /api/categories?level=0&parent=null
```

#### Get Category Tree
```http
GET /api/categories/tree
```

#### Get Single Category
```http
GET /api/categories/:id
```

#### Update Category
```http
PUT /api/categories/:id
```

#### Delete Category
```http
DELETE /api/categories/:id
```

### Products

#### Create Product
```http
POST /api/products
Content-Type: multipart/form-data

Form Data:
- name: "Fresh Mango"
- description: "Sweet and juicy mangoes"
- category: "category_id"
- variants: JSON array
- images: files
```

#### Get Products with Filters
```http
GET /api/products?category=id&minPrice=100&maxPrice=500&sortBy=popularity&page=1&limit=20
```

Supported filters:
- `category` - Filter by category
- `minPrice` / `maxPrice` - Price range
- `brand` - Filter by brand
- `tags` - Filter by tags
- `isFeatured` - Featured products only
- `sortBy` - Sort by: `price`, `popularity`, `rating`, `name`, `created`
- `order` - Sort order: `asc`, `desc`

#### Search Products
```http
GET /api/products/search?q=mango&limit=10
```

#### Get Product Details
```http
GET /api/products/:id
```

#### Get Recommendations
```http
GET /api/products/:id/recommendations?limit=5
```

#### Get Frequently Bought Together
```http
GET /api/products/:id/frequently-bought-together?limit=3
```

### Inventory

#### Create/Update Inventory
```http
POST /api/inventory
Content-Type: application/json

{
  "product": "product_id",
  "variantSku": "MNG-001",
  "darkStore": "Store-001",
  "quantity": 500,
  "lowStockThreshold": 50,
  "reorderPoint": 20,
  "reorderQuantity": 200
}
```

#### Check Availability
```http
GET /api/inventory/check-availability?product=id&variantSku=SKU&darkStore=Store-001&quantity=1
```

#### Reserve Inventory
```http
POST /api/inventory/reserve
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "variantSku": "SKU",
      "darkStore": "Store-001",
      "quantity": 2
    }
  ]
}
```

#### Get Low Stock Alerts
```http
GET /api/inventory/alerts/low-stock?darkStore=Store-001
```

#### Get Reorder Suggestions
```http
GET /api/inventory/suggestions/reorder?darkStore=Store-001
```

### Batch Upload

#### Upload Products CSV
```http
POST /api/upload/products
Content-Type: multipart/form-data

Form Data:
- file: products.csv
```

#### Upload Inventory CSV
```http
POST /api/upload/inventory
Content-Type: multipart/form-data

Form Data:
- file: inventory.csv
```

#### Download CSV Templates
```http
GET /api/upload/templates/products
GET /api/upload/templates/inventory
```

## 📊 Database Schema

### Category Schema
```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  parent: ObjectId (ref: Category),
  level: Number,
  image: String,
  isActive: Boolean,
  sortOrder: Number
}
```

### Product Schema
```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  brand: String,
  category: ObjectId (ref: Category),
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  variants: [{
    name: String,
    sku: String (unique),
    barcode: String,
    price: Number,
    compareAtPrice: Number,
    weight: { value: Number, unit: String }
  }],
  nutrition: {
    servingSize: String,
    calories: Number,
    ingredients: [String],
    allergens: [String]
  },
  tags: [String],
  rating: {
    average: Number,
    count: Number
  },
  popularity: Number
}
```

### Inventory Schema
```javascript
{
  product: ObjectId (ref: Product),
  variantSku: String,
  darkStore: String,
  quantity: Number,
  reserved: Number,
  available: Number,
  lowStockThreshold: Number,
  reorderPoint: Number,
  reorderQuantity: Number,
  location: {
    aisle: String,
    shelf: String,
    bin: String
  }
}
```

## 🔍 Search Performance

The system uses MongoDB text indexes for fast search:
- Text index on: `name`, `description`, `brand`, `tags`
- Weighted scoring: name (10), brand (5), tags (3), description (1)
- Target response time: < 500ms
- Typo tolerance through MongoDB fuzzy matching

## 📦 CSV Batch Upload

### Products CSV Format
```csv
name,description,shortDescription,brand,categorySlug,sku,barcode,price,compareAtPrice,weight,weightUnit,tags
Fresh Mango,Sweet and juicy mangoes,Seasonal fruit,FreshFarms,seasonal-fruits,MNG-001,1234567890,299,349,500,g,"fruit,seasonal"
```

### Inventory CSV Format
```csv
sku,darkStore,quantity,lowStockThreshold,reorderPoint,reorderQuantity
MNG-001,Store-001,500,50,20,200
```

## 🎨 Mobile App Screens

1. **Product List Screen**
   - Category filtering
   - Sort options (newest, popular, rating, price)
   - Infinite scroll pagination
   - Pull to refresh

2. **Product Detail Screen**
   - Product images
   - Variant selection
   - Real-time availability check
   - Nutrition information
   - Product recommendations

3. **Search Screen**
   - Real-time search with debouncing
   - Search performance metrics
   - Empty states

## 🔒 Security Considerations

- Input validation on all API endpoints
- File upload size limits (5MB for images, 10MB for CSV)
- File type validation (images, CSV only)
- MongoDB injection prevention through Mongoose
- Environment variables for sensitive data

## 🚦 Performance Optimizations

1. **Database Indexes**
   - Text indexes for search
   - Compound indexes for common queries
   - Index on category, SKU, barcode fields

2. **API Response Times**
   - Pagination for large datasets
   - Lean queries for read operations
   - Selective field population

3. **Image Optimization**
   - CDN delivery via CloudFront
   - S3 bucket configuration for optimal performance

## 📈 Future Enhancements

- [ ] Real-time WebSocket updates for inventory
- [ ] Advanced recommendation algorithm using ML
- [ ] Order history integration for "frequently bought together"
- [ ] Image optimization and multiple sizes
- [ ] Caching layer (Redis)
- [ ] API rate limiting
- [ ] Authentication and authorization
- [ ] Admin dashboard
- [ ] Analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

ISC

## 👥 Authors

Quick Commerce Development Team

