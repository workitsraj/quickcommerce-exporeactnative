# Quick Commerce Backend

Complete shopping experience backend with cart, checkout, and order processing.

## Features

- **Cart Management**: Add to cart, update quantity, remove items, cart persistence
- **Order Processing**: Place orders, track status, cancel orders, reorder functionality
- **Coupon System**: Apply coupons, validate discounts
- **Dark Store Assignment**: Automatic assignment to nearest store with inventory
- **Dynamic Pricing**: Item price + delivery fee + surge + tax calculation
- **Real-time Updates**: Socket.io for order status updates
- **Invoice Generation**: PDF invoice generation

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickcommerce
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Cart
- `GET /api/cart?userId=xxx` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `POST /api/cart/clear` - Clear cart
- `POST /api/cart/apply-coupon` - Apply coupon
- `POST /api/cart/remove-coupon` - Remove coupon

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/user/:userId` - Get user orders
- `PUT /api/orders/:orderId/status` - Update order status
- `POST /api/orders/:orderId/cancel` - Cancel order
- `POST /api/orders/:orderId/reorder` - Reorder

### Coupons
- `GET /api/coupons` - Get all active coupons
- `POST /api/coupons/validate` - Validate coupon
- `POST /api/coupons` - Create coupon (admin)

## Socket.io Events

### Client to Server
- `join` - Join user room for updates

### Server to Client
- `orderCreated` - New order created
- `orderStatusUpdated` - Order status changed
- `orderCancelled` - Order cancelled

## Data Models

### Cart
- userId, sessionId, items, totalAmount, appliedCoupon

### Order
- orderId, userId, items, pricing (subtotal, deliveryFee, surgeFee, tax, discount, totalAmount)
- deliveryAddress, scheduledDelivery, darkStoreId
- status (pending, confirmed, packed, dispatched, delivered, cancelled)
- paymentMethod, paymentStatus, invoiceUrl

### Coupon
- code, discountType (percentage/fixed), discountValue
- minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil

### DarkStore
- name, address, location (coordinates), inventory, isActive

## Order Status Flow

1. pending → 2. confirmed → 3. packed → 4. dispatched → 5. delivered

Or: cancelled (from pending/confirmed)
