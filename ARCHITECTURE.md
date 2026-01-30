# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  UI Layer (Screens & Components)                      │  │
│  │  - WalletScreen                                       │  │
│  │  - PaymentMethodsScreen                              │  │
│  │  - TransactionHistoryScreen                          │  │
│  │  - WalletTransactionsScreen                          │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────▼─────────────────────────────────┐  │
│  │  Service Layer                                        │  │
│  │  - paymentService.js                                 │  │
│  │  - walletService.js                                  │  │
│  │  - api.js (Axios Client)                            │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────▼─────────────────────────────────┐  │
│  │  Payment Gateway Utils                               │  │
│  │  - razorpay.js (Native SDK)                         │  │
│  │  - stripe.js (Native SDK)                           │  │
│  └─────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   Node.js/Express Backend                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                          │  │
│  │  - /api/payments/*    (Payment endpoints)           │  │
│  │  - /api/wallet/*      (Wallet endpoints)            │  │
│  │  - /api/webhooks/*    (Webhook handlers)            │  │
│  └──────────────┬──────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼──────────────────────────────────────┐  │
│  │  Middleware                                          │  │
│  │  - Authentication (auth.js)                         │  │
│  │  - Rate Limiting (rateLimiter.js)                   │  │
│  │  - Error Handling                                   │  │
│  └──────────────┬──────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼──────────────────────────────────────┐  │
│  │  Controllers                                         │  │
│  │  - paymentController.js                             │  │
│  │  - walletController.js                              │  │
│  │  - webhookController.js                             │  │
│  └──────────────┬──────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼──────────────────────────────────────┐  │
│  │  Services (Business Logic)                          │  │
│  │  - paymentService.js  (Payment orchestration)       │  │
│  │  - walletService.js   (Wallet management)           │  │
│  │  - razorpayService.js (Razorpay integration)        │  │
│  │  - stripeService.js   (Stripe integration)          │  │
│  └──────────┬──────────────────────┬───────────────────┘  │
│             │                      │                        │
│  ┌──────────▼──────────┐  ┌────────▼──────────────────┐  │
│  │  Models              │  │  External Services        │  │
│  │  - User              │  │  - Razorpay SDK          │  │
│  │  - Wallet            │  │  - Stripe SDK            │  │
│  │  - WalletTransaction │  └──────────────────────────┘  │
│  │  - Transaction       │                                 │
│  └──────────┬───────────┘                                 │
└─────────────┼───────────────────────────────────────────────┘
              │
              │ Mongoose ODM
              │
┌─────────────▼───────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Collections                                         │  │
│  │  - users                                            │  │
│  │  - wallets                                          │  │
│  │  - wallet_transactions                              │  │
│  │  - transactions                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Payment Gateway Services                         │
│  ┌─────────────────────┐    ┌─────────────────────┐         │
│  │   Razorpay          │    │   Stripe            │         │
│  │   - Order Creation  │    │   - Payment Intent  │         │
│  │   - Payment Capture │    │   - Confirmation    │         │
│  │   - Refunds         │    │   - Refunds         │         │
│  │   - Webhooks        │    │   - Webhooks        │         │
│  └─────────────────────┘    └─────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Payment Initiation Flow

```
User (React Native)
    │
    │ 1. Select Payment Method
    ▼
Payment Screen
    │
    │ 2. POST /api/payments/initiate
    ▼
Backend API
    │
    │ 3. Create Transaction Record
    ▼
Payment Service
    │
    ├─── 4a. Razorpay Order ──► Razorpay API
    ├─── 4b. Stripe Intent  ──► Stripe API
    ├─── 4c. Check Wallet   ──► Wallet Service
    └─── 4d. COD Flow       ──► Direct Success
    │
    │ 5. Return Gateway Data
    ▼
Frontend
    │
    │ 6. Open Payment Sheet (Razorpay/Stripe SDK)
    ▼
Payment Gateway
    │
    │ 7. User Completes Payment
    ▼
Gateway Webhook
    │
    │ 8. POST /api/webhooks/razorpay or /stripe
    ▼
Webhook Handler
    │
    │ 9. Verify Signature
    │ 10. Update Transaction Status
    │ 11. Process Cashback
    │ 12. Update Wallet
    ▼
Database Updated
```

### Wallet Flow

```
User
    │
    │ 1. Add Money to Wallet
    ▼
Wallet Screen
    │
    │ 2. POST /api/wallet/add-money
    ▼
Wallet Service
    │
    │ 3. Validate Amount (₹10 - ₹50,000)
    ▼
    │ 4. Update Wallet Balance
    │ 5. Create Wallet Transaction Record
    ▼
Database
    │
    │ 6. Return Updated Balance
    ▼
UI Updates in Real-time
```

### Refund Flow

```
Refund Request
    │
    │ 1. POST /api/payments/:id/refund
    ▼
Payment Service
    │
    │ 2. Validate Transaction
    │ 3. Check Refund Eligibility
    ▼
Gateway Service
    │
    ├─── 4a. Razorpay Refund API
    └─── 4b. Stripe Refund API
    │
    │ 5. Process Refund
    ▼
Wallet Service
    │
    │ 6. Credit Refund to Wallet
    │ 7. Create Wallet Transaction
    ▼
Database
    │
    │ 8. Update Transaction Status
    │ 9. Add Audit Log
    ▼
Completed (< 5 minutes)
```

## Components

### Backend Components

#### 1. API Layer
- **Express Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests/responses
- **Middleware**: Authentication, rate limiting, error handling

#### 2. Business Logic Layer
- **Payment Service**: Orchestrates payment flows
- **Wallet Service**: Manages wallet operations
- **Gateway Services**: Integrate with Razorpay/Stripe

#### 3. Data Layer
- **Mongoose Models**: Define data schemas
- **Database**: MongoDB for persistence

### Frontend Components

#### 1. UI Layer
- **Screens**: Main app screens
- **Components**: Reusable UI components

#### 2. Service Layer
- **API Client**: Axios for HTTP requests
- **Payment Services**: Business logic for payments
- **Wallet Services**: Business logic for wallet

#### 3. Utilities
- **Payment Gateway Utils**: SDK wrappers

## Security Architecture

### Authentication Flow
```
Request → Auth Middleware → Validate User ID → Controller
```

### Webhook Security
```
Webhook → Signature Verification → Process Event → Update DB
```

### Rate Limiting
```
Request → Rate Limiter → Check Limit → Allow/Deny
```

## Database Design

### Collections

1. **users**
   - Primary collection for user data
   - One-to-one with wallets

2. **wallets**
   - Stores user wallet balance
   - Referenced by wallet_transactions

3. **wallet_transactions**
   - All wallet credits/debits
   - Maintains audit trail

4. **transactions**
   - All payment transactions
   - Complete audit log

### Indexes

- `transactions.userId + createdAt`: Transaction history queries
- `transactions.orderId`: Order lookup
- `transactions.gatewayTransactionId`: Gateway reconciliation
- `wallet_transactions.userId + createdAt`: Wallet history
- `wallets.userId`: Unique wallet per user

## Scaling Considerations

### Horizontal Scaling
- Stateless backend servers
- Load balancer for distribution
- MongoDB replica set

### Performance
- Database indexes for fast queries
- Caching for frequently accessed data
- Pagination for large datasets

### Reliability
- Webhook retry mechanism
- Transaction idempotency
- Audit logging
- Error handling and logging

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Payment Gateways**: Razorpay SDK, Stripe SDK
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React Native
- **Runtime**: Expo
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Payment SDKs**: 
  - react-native-razorpay
  - @stripe/stripe-react-native

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: dotenv
- **Process Manager**: nodemon (dev)

## API Design Principles

1. **RESTful**: Standard HTTP methods and status codes
2. **Consistent**: Uniform response format
3. **Versioned**: API versioning for backward compatibility
4. **Secure**: Authentication and rate limiting
5. **Documented**: Comprehensive API documentation
6. **Error Handling**: Descriptive error messages
