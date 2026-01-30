# System Architecture

## Overview

QuickCommerce is a full-stack mobile application built with React Native (Expo) frontend and Node.js/Express backend, featuring real-time order tracking and geospatial dark store assignment.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Native (Expo) App                     │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Screens   │  │  Context    │  │      Services           │ │
│  │             │  │  Providers  │  │                         │ │
│  │ • Home      │  │             │  │ • API Client (Axios)    │ │
│  │ • Cart      │──│• CartContext│──│ • Socket.io Client      │ │
│  │ • Checkout  │  │• OrderContext  │ • Storage (AsyncStorage)│ │
│  │ • Orders    │  │             │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                              │                   │
│                                              │ HTTP/WebSocket    │
└──────────────────────────────────────────────┼───────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Node.js/Express Backend                       │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐│
│  │   Routes     │   │ Controllers  │   │      Models          ││
│  │              │   │              │   │                      ││
│  │ • /cart      │──▶│ • Cart       │──▶│ • Cart (MongoDB)     ││
│  │ • /orders    │   │ • Order      │   │ • Order              ││
│  │ • /coupons   │   │ • Coupon     │   │ • Coupon             ││
│  └──────────────┘   └──────────────┘   │ • DarkStore          ││
│                                         │ • Product            ││
│  ┌──────────────┐   ┌──────────────┐   │ • User               ││
│  │  Socket.io   │   │   Utils      │   └──────────────────────┘│
│  │   Server     │   │              │                            │
│  │              │   │• Dark Store  │                            │
│  │• orderCreated│   │  Assignment  │                            │
│  │• statusUpdate│   │• Invoice Gen │                            │
│  │• cancelled   │   │• Pricing     │                            │
│  └──────────────┘   └──────────────┘                            │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │   MongoDB Atlas    │
                    │                    │
                    │ Collections:       │
                    │ • carts            │
                    │ • orders           │
                    │ • coupons          │
                    │ • darkstores       │
                    │ • products         │
                    │ • users            │
                    └────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Storage**: AsyncStorage
- **UI**: React Native components

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **PDF Generation**: PDFKit
- **Authentication**: bcryptjs, JWT (ready for implementation)
- **Validation**: express-validator

### Database
- **MongoDB** with collections:
  - `carts` - Shopping carts for users/guests
  - `orders` - Order documents with status tracking
  - `coupons` - Promotional codes
  - `darkstores` - Store locations with geospatial index
  - `products` - Product catalog
  - `users` - User accounts

## Data Flow

### 1. Cart Management Flow

```
User Action (Add to Cart)
    ↓
Cart Screen → CartContext
    ↓
API Call (POST /api/cart/add)
    ↓
Cart Controller → Cart Model
    ↓
MongoDB Update
    ↓
Response to Frontend
    ↓
Update Context State
    ↓
Update AsyncStorage (Persistence)
    ↓
Re-render Cart Screen
```

### 2. Order Placement Flow

```
User (Place Order)
    ↓
Checkout Screen → OrderContext
    ↓
API Call (POST /api/orders)
    ↓
Order Controller
    │
    ├─▶ Validate Cart Items
    ├─▶ Apply Coupon (if any)
    ├─▶ Calculate Pricing
    │   • Subtotal
    │   • Discount
    │   • Delivery Fee
    │   • Surge Fee
    │   • Tax (5%)
    │   • Total
    ├─▶ Find Nearest Dark Store
    │   • Geospatial query ($near)
    │   • Check inventory
    ├─▶ Create Order Document
    ├─▶ Generate Invoice (PDF)
    ├─▶ Clear User Cart
    └─▶ Emit Socket Event (orderCreated)
    ↓
Response with Order
    ↓
Navigate to Order Confirmation
```

### 3. Real-time Update Flow

```
Admin/System Updates Order Status
    ↓
API Call (PUT /api/orders/:id/status)
    ↓
Order Controller
    ↓
Update Order Status in MongoDB
    ↓
Emit Socket Event
    │
    └─▶ io.to(`user-${userId}`).emit('orderStatusUpdated')
    ↓
Socket.io Client (Frontend)
    ↓
OrderContext receives event
    ↓
Update Orders State
    ↓
Re-render Order Tracking Screen
    (Status updated without user refresh!)
```

## Key Features Implementation

### 1. Cart Persistence

**Guest Users:**
- Cart stored in AsyncStorage with unique `sessionId`
- sessionId format: `guest-{timestamp}-{random}`
- Cart synced with backend for consistency
- Can be converted to user cart on login

**Logged-in Users:**
- Cart stored in MongoDB with `userId`
- Synced across devices
- AsyncStorage used as cache for offline access

### 2. Dark Store Assignment

```javascript
// Geospatial query to find nearest store
DarkStore.find({
  isActive: true,
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 50000 // 50km radius
    }
  }
})

// Then check inventory availability
for each store:
  if store.canFulfillOrder(orderItems):
    assign this store
    break
```

### 3. Dynamic Pricing Calculation

```javascript
pricing = {
  subtotal: Σ(item.price × item.quantity),
  discount: coupon.calculateDiscount(subtotal),
  deliveryFee: 50, // Fixed
  surgeFee: (subtotal × surgePercentage) / 100,
  tax: ((subtotal - discount) × 5) / 100,
  total: subtotal - discount + deliveryFee + surgeFee + tax
}
```

### 4. Order State Machine

```
States: pending → confirmed → packed → dispatched → delivered
                    ↓
                cancelled (only from pending/confirmed)

Transitions:
- pending → confirmed: Store accepts order
- confirmed → packed: Items packed
- packed → dispatched: Out for delivery
- dispatched → delivered: Customer receives order
- pending/confirmed → cancelled: Customer or store cancels
```

### 5. Real-time Communication

**Socket.io Events:**
- `join`: User joins their room (`user-{userId}`)
- `orderCreated`: New order notification
- `orderStatusUpdated`: Status change notification
- `orderCancelled`: Cancellation notification

**Implementation:**
- Server emits to specific user room
- Client listens for events
- Context automatically updates state
- UI re-renders reactively

### 6. Invoice Generation

```javascript
// Using PDFKit
1. Create PDF document
2. Add header (Company name, logo)
3. Add order details (ID, date, status)
4. Add delivery address
5. Add items table
6. Add pricing breakdown
7. Generate and save to file system
8. (Production) Upload to S3
9. Return URL
```

## API Endpoints

### Cart APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user/guest cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update` | Update item quantity |
| DELETE | `/api/cart/remove` | Remove item |
| POST | `/api/cart/clear` | Clear cart |
| POST | `/api/cart/apply-coupon` | Apply coupon |
| POST | `/api/cart/remove-coupon` | Remove coupon |

### Order APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:orderId` | Get order details |
| GET | `/api/orders/user/:userId` | Get user orders |
| PUT | `/api/orders/:orderId/status` | Update status |
| POST | `/api/orders/:orderId/cancel` | Cancel order |
| POST | `/api/orders/:orderId/reorder` | Reorder |

### Coupon APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/coupons` | Get active coupons |
| POST | `/api/coupons/validate` | Validate coupon |
| POST | `/api/coupons` | Create coupon (admin) |

## Database Schema

### Cart Schema
```javascript
{
  userId: ObjectId (optional, ref: User),
  sessionId: String (for guest users),
  items: [{
    productId: ObjectId (ref: Product),
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: Number,
  appliedCoupon: {
    code: String,
    discount: Number,
    discountType: 'percentage' | 'fixed'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  orderId: String (unique, e.g., ORD-ABC123),
  userId: ObjectId (ref: User),
  items: [OrderItemSchema],
  
  // Pricing
  subtotal: Number,
  deliveryFee: Number,
  surgeFee: Number,
  tax: Number,
  discount: Number,
  totalAmount: Number,
  
  // Delivery
  deliveryAddress: AddressSchema,
  scheduledDelivery: {
    date: Date,
    slot: String
  },
  
  // Assignment
  darkStoreId: ObjectId (ref: DarkStore),
  
  // Status
  status: 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'delivered' | 'cancelled',
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  
  // Payment
  paymentMethod: 'card' | 'cash' | 'upi',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  
  // Other
  invoiceUrl: String,
  cancellationReason: String,
  refundAmount: Number,
  refundStatus: 'none' | 'pending' | 'processed',
  
  createdAt: Date,
  updatedAt: Date
}
```

### DarkStore Schema (with Geospatial Index)
```javascript
{
  name: String,
  address: AddressSchema,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] // GeoJSON format
  },
  inventory: [{
    productId: ObjectId (ref: Product),
    quantity: Number
  }],
  isActive: Boolean,
  operatingHours: {
    open: String,
    close: String
  },
  createdAt: Date
}

// Index
location: '2dsphere' // Enables geospatial queries
```

## Security Considerations

1. **Authentication**: JWT tokens (ready for implementation)
2. **Password Hashing**: bcrypt with salt rounds
3. **Input Validation**: express-validator for all inputs
4. **CORS**: Configured for frontend origin
5. **Environment Variables**: Sensitive data in .env
6. **API Rate Limiting**: Can be added with express-rate-limit
7. **SQL Injection**: Protected by Mongoose
8. **XSS**: React Native escapes by default

## Scalability Considerations

1. **Database**: MongoDB Atlas with replication
2. **Caching**: Redis for cart/session data (can be added)
3. **Load Balancing**: Multiple backend instances
4. **CDN**: Static assets (images, invoices on S3)
5. **Microservices**: Can split into services (cart, order, payment)
6. **Message Queue**: RabbitMQ/SQS for order processing
7. **Horizontal Scaling**: Stateless backend design

## Monitoring & Logging

Recommended additions:
- **Winston**: Logging library
- **Morgan**: HTTP request logger
- **Sentry**: Error tracking
- **New Relic/DataDog**: Performance monitoring
- **MongoDB Atlas Monitoring**: Database metrics

## Future Enhancements

1. **Payment Gateway Integration**: Stripe, Razorpay
2. **Push Notifications**: Firebase Cloud Messaging
3. **Analytics**: Google Analytics, Mixpanel
4. **A/B Testing**: Optimize conversion rates
5. **ML-based Surge Pricing**: Dynamic surge calculation
6. **Route Optimization**: For delivery drivers
7. **Loyalty Program**: Points and rewards
8. **Live Chat**: Customer support
9. **Product Recommendations**: Personalized suggestions
10. **Multi-language Support**: i18n
