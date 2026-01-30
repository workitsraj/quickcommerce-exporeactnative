# QuickCommerce React Native App

Shopping cart, checkout, and order processing mobile application.

## Features

- **Cart Management**: Add to cart, update quantity, remove items
- **Cart Persistence**: Syncs across devices for logged-in users, AsyncStorage for guest users
- **Coupon System**: Apply and validate promotional codes
- **Checkout**: Select delivery address, time slot, and payment method
- **Order Placement**: Dynamic pricing with delivery fee, surge, and tax
- **Order Tracking**: Real-time status updates via Socket.io
- **Order History**: View past orders and reorder functionality
- **Order Cancellation**: Cancel pending/confirmed orders

## Installation

```bash
npm install
```

## Running the App

### Development

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Project Structure

```
frontend/
├── src/
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.js
│   │   ├── CartScreen.js
│   │   ├── CheckoutScreen.js
│   │   ├── OrderConfirmationScreen.js
│   │   ├── OrderTrackingScreen.js
│   │   └── OrderHistoryScreen.js
│   ├── context/          # Context providers
│   │   ├── CartContext.js
│   │   └── OrderContext.js
│   ├── services/         # API & services
│   │   ├── api.js
│   │   ├── socketService.js
│   │   └── storageService.js
│   └── navigation/       # Navigation setup
│       └── AppNavigator.js
├── App.js               # App entry point
├── app.json             # Expo config
└── package.json
```

## Screens

### Home Screen
- Welcome screen with navigation to Cart and Order History

### Cart Screen
- Display cart items with quantity controls
- Apply/remove coupons
- Show total with discounts
- Clear cart or proceed to checkout

### Checkout Screen
- Delivery address form
- Delivery slot selection (9AM-12PM, 12PM-3PM, etc.)
- Payment method selection (Card, UPI, Cash)
- Price breakdown (subtotal, discount, delivery, tax, total)
- Place order button

### Order Confirmation Screen
- Success message with order ID
- Order summary
- Delivery details
- Navigate to order tracking

### Order Tracking Screen
- Visual status tracker (pending → confirmed → packed → dispatched → delivered)
- Order items and pricing
- Delivery address and slot
- Cancel order (for pending/confirmed)
- Download invoice

### Order History Screen
- List of all orders with status badges
- Order details preview
- Reorder functionality for delivered orders
- Navigate to order tracking

## Context Providers

### CartContext
- Manages cart state
- Methods: `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart`, `applyCoupon`, `removeCoupon`
- Syncs with backend API
- Persists to AsyncStorage

### OrderContext
- Manages orders state
- Methods: `createOrder`, `getOrder`, `getUserOrders`, `cancelOrder`, `reorder`
- Real-time updates via Socket.io

## API Configuration

Update the API base URL in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

For production, use your server URL:

```javascript
const API_BASE_URL = 'https://your-api-server.com/api';
```

## Socket.io Configuration

Update the socket URL in `src/services/socketService.js`:

```javascript
const SOCKET_URL = 'http://localhost:5000';
```

## Technologies Used

- **React Native**: Mobile app framework
- **Expo**: Development platform
- **React Navigation**: Navigation library
- **AsyncStorage**: Local storage
- **Axios**: HTTP client
- **Socket.io Client**: Real-time communication

## State Management

- Context API for global state (Cart, Orders)
- AsyncStorage for offline persistence
- Socket.io for real-time updates

## Features Implementation

### Cart Persistence
- Logged-in users: Cart synced with backend
- Guest users: Cart stored in AsyncStorage with sessionId
- Automatic sync on login

### Dynamic Pricing
- Subtotal: Sum of item prices
- Discount: Coupon applied discount
- Delivery Fee: Fixed $50
- Surge Fee: Dynamic based on demand (0% default)
- Tax: 5% on subtotal after discount
- Total: Subtotal - Discount + Delivery + Surge + Tax

### Real-time Updates
- Socket.io connection on app start
- Events: `orderCreated`, `orderStatusUpdated`, `orderCancelled`
- Automatic UI updates on order status changes

### Order Status Flow
1. **pending**: Order placed, awaiting confirmation
2. **confirmed**: Order confirmed by store
3. **packed**: Order items packed
4. **dispatched**: Out for delivery
5. **delivered**: Order delivered
6. **cancelled**: Order cancelled

## Notes

- Backend API must be running for full functionality
- Socket.io server must be running for real-time updates
- Update API URLs before deploying to production
