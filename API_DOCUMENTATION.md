# API Documentation

Base URL: `http://localhost:3000/api`

## Table of Contents
- [Categories](#categories)
- [Products](#products)
- [Inventory](#inventory)
- [Batch Upload](#batch-upload)

---

## Categories

### Create Category
Create a new category or subcategory.

**Endpoint:** `POST /categories`

**Request Body:**
```json
{
  "name": "Fresh Fruits",
  "description": "Fresh and seasonal fruits",
  "parent": null,
  "image": "https://cdn.example.com/fruits.jpg"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Fresh Fruits",
    "slug": "fresh-fruits",
    "description": "Fresh and seasonal fruits",
    "parent": null,
    "level": 0,
    "image": "https://cdn.example.com/fruits.jpg",
    "isActive": true,
    "sortOrder": 0
  }
}
```

### Get All Categories
Get all categories with optional filtering.

**Endpoint:** `GET /categories`

**Query Parameters:**
- `parent` (optional) - Filter by parent category ID or "null" for root categories
- `level` (optional) - Filter by category level (0, 1, 2, etc.)
- `includeInactive` (optional) - Include inactive categories

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### Get Category Tree
Get hierarchical category tree structure.

**Endpoint:** `GET /categories/tree`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Fresh Fruits",
      "slug": "fresh-fruits",
      "children": [
        {
          "_id": "...",
          "name": "Seasonal Fruits",
          "slug": "seasonal-fruits",
          "children": [...]
        }
      ]
    }
  ]
}
```

### Get Single Category
Get category details with children and path.

**Endpoint:** `GET /categories/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Seasonal Fruits",
    "children": [...],
    "path": [
      { "name": "Fresh Fruits", ... },
      { "name": "Seasonal Fruits", ... }
    ]
  }
}
```

### Update Category
Update an existing category.

**Endpoint:** `PUT /categories/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": true,
  "sortOrder": 1
}
```

### Delete Category
Delete a category (must have no children or products).

**Endpoint:** `DELETE /categories/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Products

### Create Product
Create a new product with images and variants.

**Endpoint:** `POST /products`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` - Product name (required)
- `description` - Full description (required)
- `shortDescription` - Short description (optional)
- `brand` - Brand name (optional)
- `category` - Category ID (required)
- `variants` - JSON array of variants (optional)
- `nutrition` - JSON object with nutrition info (optional)
- `tags` - JSON array of tags (optional)
- `isFeatured` - Boolean (optional)
- `images` - Array of image files (max 5)

**Variants Format:**
```json
[
  {
    "name": "500g",
    "sku": "MNG-500",
    "barcode": "1234567890",
    "price": 299,
    "compareAtPrice": 349,
    "weight": {
      "value": 500,
      "unit": "g"
    }
  }
]
```

**Response:** `201 Created`

### Get Products
Get products with filtering, sorting, and pagination.

**Endpoint:** `GET /products`

**Query Parameters:**
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `brand` - Filter by brand
- `tags` - Filter by tags (can be array)
- `isFeatured` - Filter featured products (true/false)
- `isActive` - Filter active products (true/false, default: true)
- `sortBy` - Sort field: `price`, `popularity`, `rating`, `name`, `created`
- `order` - Sort order: `asc`, `desc`
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)
- `search` - Text search query

**Example:**
```
GET /products?category=60a1b2c3&minPrice=100&maxPrice=500&sortBy=popularity&order=desc&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "queryTime": "45ms",
  "data": [...]
}
```

### Search Products
Fast text search with typo tolerance.

**Endpoint:** `GET /products/search`

**Query Parameters:**
- `q` - Search query (required)
- `limit` - Max results (default: 10)

**Example:**
```
GET /products/search?q=mango&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "queryTime": "42ms",
  "data": [...]
}
```

### Get Product Details
Get detailed product information with inventory.

**Endpoint:** `GET /products/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Fresh Mango",
    "description": "...",
    "variants": [...],
    "images": [...],
    "nutrition": {...},
    "inventory": [...]
  }
}
```

### Update Product
Update an existing product.

**Endpoint:** `PUT /products/:id`

**Content-Type:** `multipart/form-data`

**Form Data:** Same as create, all fields optional

### Delete Product
Delete a product and its inventory.

**Endpoint:** `DELETE /products/:id`

### Get Recommendations
Get similar products based on category, brand, and tags.

**Endpoint:** `GET /products/:id/recommendations`

**Query Parameters:**
- `limit` - Max results (default: 5)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...]
}
```

### Get Frequently Bought Together
Get products frequently bought with this product.

**Endpoint:** `GET /products/:id/frequently-bought-together`

**Query Parameters:**
- `limit` - Max results (default: 3)

---

## Inventory

### Create/Update Inventory
Create or update inventory for a product variant at a dark store.

**Endpoint:** `POST /inventory`

**Request Body:**
```json
{
  "product": "product_id",
  "variantSku": "MNG-001",
  "darkStore": "Store-001",
  "quantity": 500,
  "lowStockThreshold": 50,
  "reorderPoint": 20,
  "reorderQuantity": 200,
  "location": {
    "aisle": "A1",
    "shelf": "S2",
    "bin": "B3"
  }
}
```

**Response:** `201 Created` or `200 OK`

### Get Product Inventory
Get inventory for all variants of a product.

**Endpoint:** `GET /inventory/product/:productId`

**Query Parameters:**
- `darkStore` (optional) - Filter by specific dark store

### Get Dark Store Inventory
Get all inventory items for a dark store.

**Endpoint:** `GET /inventory/darkstore/:darkStore`

**Query Parameters:**
- `lowStockOnly` - Show only low stock items (true/false)
- `outOfStockOnly` - Show only out of stock items (true/false)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

### Check Availability
Check if a product variant is available at a dark store.

**Endpoint:** `GET /inventory/check-availability`

**Query Parameters:**
- `product` - Product ID
- `variantSku` - Variant SKU
- `darkStore` - Dark store ID
- `quantity` - Requested quantity (default: 1)

**Response:** `200 OK`
```json
{
  "success": true,
  "available": true,
  "quantity": 450,
  "isLowStock": false,
  "isOutOfStock": false
}
```

### Reserve Inventory
Reserve inventory for order placement.

**Endpoint:** `POST /inventory/reserve`

**Request Body:**
```json
{
  "items": [
    {
      "product": "product_id",
      "variantSku": "MNG-001",
      "darkStore": "Store-001",
      "quantity": 2
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "reservations": [...],
  "errors": []
}
```

### Release Reservation
Release reserved inventory (order cancellation).

**Endpoint:** `POST /inventory/release`

**Request Body:** Same as reserve

### Fulfill Order
Fulfill order by deducting from reserved inventory.

**Endpoint:** `POST /inventory/fulfill`

**Request Body:** Same as reserve

### Restock Inventory
Add stock to inventory.

**Endpoint:** `POST /inventory/restock`

**Request Body:**
```json
{
  "product": "product_id",
  "variantSku": "MNG-001",
  "darkStore": "Store-001",
  "quantity": 100
}
```

### Get Low Stock Alerts
Get items below low stock threshold.

**Endpoint:** `GET /inventory/alerts/low-stock`

**Query Parameters:**
- `darkStore` (optional) - Filter by specific dark store

### Get Reorder Suggestions
Get items that need reordering.

**Endpoint:** `GET /inventory/suggestions/reorder`

**Query Parameters:**
- `darkStore` (optional) - Filter by specific dark store

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "inventory": {...},
      "product": {...},
      "suggestedQuantity": 200
    }
  ]
}
```

---

## Batch Upload

### Upload Products CSV
Batch upload products from CSV file.

**Endpoint:** `POST /upload/products`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - CSV file

**CSV Format:**
```csv
name,description,shortDescription,brand,categorySlug,sku,barcode,price,compareAtPrice,weight,weightUnit,tags
Fresh Mango,Sweet and juicy mangoes,Seasonal fruit,FreshFarms,seasonal-fruits,MNG-001,1234567890,299,349,500,g,"fruit,seasonal,mango"
```

**Response:** `200 OK`
```json
{
  "success": true,
  "summary": {
    "totalRows": 10,
    "created": 7,
    "updated": 3,
    "errors": 0
  },
  "created": [...],
  "updated": [...],
  "errors": []
}
```

### Upload Inventory CSV
Batch upload inventory from CSV file.

**Endpoint:** `POST /upload/inventory`

**Content-Type:** `multipart/form-data`

**CSV Format:**
```csv
sku,darkStore,quantity,lowStockThreshold,reorderPoint,reorderQuantity
MNG-001,Store-001,500,50,20,200
```

### Download Product Template
Download sample CSV template for products.

**Endpoint:** `GET /upload/templates/products`

**Response:** CSV file download

### Download Inventory Template
Download sample CSV template for inventory.

**Endpoint:** `GET /upload/templates/inventory`

**Response:** CSV file download

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
