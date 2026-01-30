# QuickCommerce - Complete Cart, Checkout & Order Processing System

A full-stack quick commerce application with React Native (Expo) frontend and Node.js/Express backend, featuring comprehensive shopping cart, checkout, and order management capabilities.

## 🚀 Features

### Cart Management
- ✅ Add to cart with quantity management
- ✅ Cart persistence (logged-in & guest users)
- ✅ Update item quantities
- ✅ Remove items from cart
- ✅ Clear entire cart
- ✅ Real-time cart synchronization

### Coupon & Promotions
- ✅ Apply promotional codes
- ✅ Validate coupon eligibility
- ✅ Percentage and fixed discount types
- ✅ Minimum order amount validation
- ✅ Usage limit tracking

### Dynamic Pricing
- ✅ Item price calculation
- ✅ Delivery fee
- ✅ Surge pricing (demand-based)
- ✅ Tax calculation (5%)
- ✅ Discount application

### Order Processing
- ✅ Order placement with dark store assignment (nearest available)
- ✅ Inventory validation
- ✅ Order confirmation & invoice generation (PDF)
- ✅ Order status tracking (pending → confirmed → packed → dispatched → delivered)
- ✅ Order history with reorder functionality
- ✅ Order cancellation & refund workflow
- ✅ Scheduled delivery slots

### Real-time Updates
- ✅ Socket.io integration for live order updates
- ✅ Order status change notifications
- ✅ Order creation alerts

## 📁 Project Structure

```
quickcommerce-exporeactnative/
├── backend/                    # Node.js/Express backend
│   ├── models/                # MongoDB models
│   │   ├── Cart.js           # Cart schema
│   │   ├── Order.js          # Order schema with status tracking
│   │   ├── Coupon.js         # Coupon schema
│   │   ├── DarkStore.js      # Dark store with geospatial index
│   │   ├── Product.js        # Product schema
│   │   └── User.js           # User schema
│   ├── controllers/           # Business logic
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── couponController.js
│   ├── routes/               # API routes
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── couponRoutes.js
│   ├── utils/                # Utility functions
│   │   ├── darkStoreUtils.js      # Nearest store finder
│   │   └── invoiceGenerator.js    # PDF invoice generation
│   ├── config/               # Configuration
│   │   └── database.js       # MongoDB connection
│   ├── server.js             # Express server with Socket.io
│   └── package.json
│
└── frontend/                  # React Native (Expo) app
    ├── src/
    │   ├── screens/          # App screens
    │   │   ├── HomeScreen.js
    │   │   ├── CartScreen.js
    │   │   ├── CheckoutScreen.js
    │   │   ├── OrderConfirmationScreen.js
    │   │   ├── OrderTrackingScreen.js
    │   │   └── OrderHistoryScreen.js
    │   ├── context/          # State management
    │   │   ├── CartContext.js
    │   │   └── OrderContext.js
    │   ├── services/         # API services
    │   │   ├── api.js              # REST API client
    │   │   ├── socketService.js    # Socket.io client
    │   │   └── storageService.js   # AsyncStorage wrapper
    │   └── navigation/       # Navigation setup
    │       └── AppNavigator.js
    ├── App.js               # App entry point
    └── package.json
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js** - REST API
- **MongoDB** with **Mongoose** - Database & ODM
- **Socket.io** - Real-time communication
- **PDFKit** - Invoice generation
- **bcryptjs** - Password hashing
- **JWT** - Authentication tokens

### Frontend
- **React Native** with **Expo** - Mobile framework
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **AsyncStorage** - Local storage
- **Context API** - State management

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Expo CLI (for React Native development)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (see .env.example)
cp .env.example .env

# Update .env with your MongoDB URI and other configs

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on your device
# - Scan QR code with Expo Go app (Android/iOS)
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Press 'w' for web browser
```

## 📡 API Endpoints

### Cart APIs
- `GET /api/cart` - Get user/guest cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `POST /api/cart/clear` - Clear cart
- `POST /api/cart/apply-coupon` - Apply coupon
- `POST /api/cart/remove-coupon` - Remove coupon

### Order APIs
- `POST /api/orders` - Create order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/user/:userId` - Get user orders
- `PUT /api/orders/:orderId/status` - Update order status
- `POST /api/orders/:orderId/cancel` - Cancel order
- `POST /api/orders/:orderId/reorder` - Reorder

### Coupon APIs
- `GET /api/coupons` - Get active coupons
- `POST /api/coupons/validate` - Validate coupon
- `POST /api/coupons` - Create coupon

## 🎯 Key Features Implementation

### 1. Cart Persistence
- **Logged-in users**: Cart synced with MongoDB, accessible across devices
- **Guest users**: Cart stored locally with unique sessionId, syncs on login

### 2. Dark Store Assignment
- Uses MongoDB geospatial queries (`$near`)
- Finds nearest store within 50km radius
- Validates inventory availability
- Falls back to next nearest store if out of stock

### 3. Dynamic Pricing Calculation
```javascript
Subtotal = Σ(item.price × item.quantity)
Discount = coupon discount (if applied)
Delivery Fee = $50 (fixed)
Surge Fee = 0% (can be dynamic based on demand)
Tax = 5% of (Subtotal - Discount)
Total = Subtotal - Discount + Delivery Fee + Surge Fee + Tax
```

### 4. Order State Machine
```
pending → confirmed → packed → dispatched → delivered
         ↓
     cancelled (from pending/confirmed only)
```

### 5. Real-time Updates
- Socket.io connection established on app start
- Events: `orderCreated`, `orderStatusUpdated`, `orderCancelled`
- Automatic UI updates without manual refresh

### 6. Invoice Generation
- PDF generated using PDFKit
- Includes order details, items, pricing breakdown
- Stored locally (can be uploaded to S3 in production)

## 📱 Mobile App Screens

1. **Home Screen** - Welcome & navigation
2. **Cart Screen** - View cart, apply coupons, manage quantities
3. **Checkout Screen** - Address, delivery slot, payment method, pricing
4. **Order Confirmation** - Success message, order summary
5. **Order Tracking** - Visual status tracker, order details, cancel option
6. **Order History** - All orders with status, reorder functionality

## 🔐 Security Considerations

- Passwords hashed with bcrypt
- JWT tokens for authentication (can be implemented)
- Input validation with express-validator
- CORS enabled for frontend communication
- Environment variables for sensitive data

## 🚀 Deployment

### Backend
- Deploy to Heroku, AWS, or any Node.js hosting
- Set environment variables
- Ensure MongoDB is accessible
- Configure CORS for production frontend URL

### Frontend
- Build with `expo build:android` or `expo build:ios`
- Update API URLs to production backend
- Submit to App Store / Play Store
- Or deploy web version with `expo build:web`

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickcommerce
JWT_SECRET=your_secret_key
NODE_ENV=development
AWS_ACCESS_KEY_ID=your_aws_key (for S3 invoice storage)
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=quickcommerce-invoices
```

### Frontend (update in code)
- `API_BASE_URL` in `src/services/api.js`
- `SOCKET_URL` in `src/services/socketService.js`

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 📄 License

ISC

## 👥 Contributors

Built for QuickCommerce quick delivery platform.

## 🎉 Acknowledgments

- MongoDB for geospatial queries
- Socket.io for real-time capabilities
- Expo for simplified React Native development
- PDFKit for invoice generation
