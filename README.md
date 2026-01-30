# QuickCommerce - Multi-Payment Gateway & Wallet System

A comprehensive payment solution for quickcommerce React Native applications with multiple payment gateway support, in-app wallet, and secure transaction management.

## Features

### Payment Gateway Integration
- ✅ **Razorpay Integration** - Full support for UPI, Cards, Net Banking
- ✅ **Stripe Integration** - International payment support
- ✅ **Multiple Payment Methods**
  - UPI
  - Credit/Debit Cards
  - Net Banking
  - In-app Wallet
  - Cash on Delivery (COD)

### Wallet System
- ✅ **In-app Wallet** - Add and manage wallet balance
- ✅ **Real-time Balance Updates** - Instant balance updates after transactions
- ✅ **Cashback System** - Automatic cashback crediting
- ✅ **Refund to Wallet** - Quick refunds processed within 5 minutes
- ✅ **Transaction History** - Complete audit trail of all wallet transactions

### Payment Features
- ✅ **Payment Retry Mechanism** - Retry failed transactions
- ✅ **Transaction Logging** - Complete audit trail with timestamps
- ✅ **Receipt Generation** - Digital receipts for all transactions
- ✅ **COD Verification** - Cash on delivery verification workflow
- ✅ **Webhook Handling** - Secure webhook endpoints with signature verification

### Security & Compliance
- ✅ **PCI-DSS Compliant** - Secure payment flow
- ✅ **Signature Verification** - Webhook signature verification
- ✅ **Rate Limiting** - API rate limiting to prevent abuse
- ✅ **Encryption** - Secure data transmission
- ✅ **Authentication** - User authentication middleware

## Project Structure

```
quickcommerce-exporeactnative/
├── backend/                      # Node.js/Express backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── database.js      # MongoDB connection
│   │   │   └── logger.js        # Winston logger setup
│   │   ├── models/              # Mongoose models
│   │   │   ├── User.js          # User model
│   │   │   ├── Wallet.js        # Wallet model
│   │   │   ├── WalletTransaction.js  # Wallet transactions
│   │   │   └── Transaction.js   # Payment transactions
│   │   ├── services/            # Business logic
│   │   │   ├── razorpayService.js    # Razorpay integration
│   │   │   ├── stripeService.js      # Stripe integration
│   │   │   ├── walletService.js      # Wallet operations
│   │   │   └── paymentService.js     # Payment processing
│   │   ├── controllers/         # Route handlers
│   │   │   ├── paymentController.js  # Payment endpoints
│   │   │   ├── walletController.js   # Wallet endpoints
│   │   │   └── webhookController.js  # Webhook handlers
│   │   ├── routes/              # Express routes
│   │   │   ├── payment.js       # Payment routes
│   │   │   ├── wallet.js        # Wallet routes
│   │   │   └── webhook.js       # Webhook routes
│   │   ├── middleware/          # Middleware
│   │   │   ├── auth.js          # Authentication
│   │   │   └── rateLimiter.js   # Rate limiting
│   │   └── server.js            # Express server
│   ├── package.json
│   └── .env.example
│
├── frontend/                    # React Native frontend
│   ├── src/
│   │   ├── screens/            # React Native screens
│   │   │   ├── WalletScreen.js
│   │   │   ├── PaymentMethodsScreen.js
│   │   │   ├── TransactionHistoryScreen.js
│   │   │   └── WalletTransactionsScreen.js
│   │   ├── services/           # API services
│   │   │   ├── api.js          # Axios client
│   │   │   ├── paymentService.js
│   │   │   └── walletService.js
│   │   ├── utils/              # Utilities
│   │   │   ├── razorpay.js     # Razorpay helper
│   │   │   └── stripe.js       # Stripe helper
│   │   └── components/         # Reusable components
│   ├── App.js
│   ├── app.json
│   ├── babel.config.js
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Expo CLI (`npm install -g expo-cli`)
- Razorpay account (for payments)
- Stripe account (for payments)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/quickcommerce
   
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
   
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API configuration**
   
   Edit `src/services/api.js` and update the `API_BASE_URL`:
   ```javascript
   const API_BASE_URL = 'http://your-backend-url:3000/api';
   ```

4. **Update payment gateway keys**
   
   Edit `App.js` and update Stripe publishable key:
   ```javascript
   const STRIPE_PUBLISHABLE_KEY = 'your_stripe_publishable_key';
   ```
   
   Edit `src/utils/razorpay.js` and update Razorpay key:
   ```javascript
   key: 'your_razorpay_key_id',
   ```

5. **Start the Expo development server**
   ```bash
   npm start
   ```

6. **Run on device/emulator**
   - For iOS: Press `i` or run `npm run ios`
   - For Android: Press `a` or run `npm run android`
   - Scan QR code with Expo Go app

## API Endpoints

### Payment APIs

#### Initiate Payment
```
POST /api/payments/initiate
Headers: x-user-id: <userId>
Body: {
  "orderId": "ORDER123",
  "amount": 100,
  "paymentMethod": "UPI",
  "paymentGateway": "RAZORPAY",
  "metadata": {}
}
```

#### Confirm Payment
```
POST /api/payments/confirm
Body: {
  "transactionId": "trans_123",
  "gatewayTransactionId": "pay_123",
  "gatewayData": {}
}
```

#### Retry Payment
```
POST /api/payments/:transactionId/retry
```

#### Process Refund
```
POST /api/payments/:transactionId/refund
Body: {
  "amount": 50  // Optional, defaults to full amount
}
```

#### Get Transaction History
```
GET /api/payments/history?limit=50&skip=0&status=SUCCESS
```

#### Verify COD
```
POST /api/payments/:transactionId/verify-cod
Body: {
  "verificationStatus": "VERIFIED"
}
```

### Wallet APIs

#### Create Wallet
```
POST /api/wallet/create
Headers: x-user-id: <userId>
```

#### Get Wallet
```
GET /api/wallet
Headers: x-user-id: <userId>
```

#### Add Money to Wallet
```
POST /api/wallet/add-money
Body: {
  "amount": 100,
  "description": "Money added",
  "referenceId": "REF123"
}
```

#### Get Wallet Transactions
```
GET /api/wallet/transactions?limit=50&skip=0
```

### Webhook APIs

#### Razorpay Webhook
```
POST /api/webhooks/razorpay
Headers: x-razorpay-signature: <signature>
```

#### Stripe Webhook
```
POST /api/webhooks/stripe
Headers: stripe-signature: <signature>
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Wallets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  balance: Number,
  currency: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Wallet Transactions Collection
```javascript
{
  _id: ObjectId,
  walletId: ObjectId (ref: Wallet),
  userId: ObjectId (ref: User),
  type: String (CREDIT/DEBIT),
  amount: Number,
  description: String,
  referenceId: String,
  balanceAfter: Number,
  metadata: Object,
  createdAt: Date
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  orderId: String,
  amount: Number,
  currency: String,
  paymentMethod: String,
  paymentGateway: String,
  status: String,
  gatewayTransactionId: String,
  gatewayOrderId: String,
  gatewayResponse: Object,
  retryCount: Number,
  refundAmount: Number,
  refundedAt: Date,
  cashbackAmount: Number,
  cashbackApplied: Boolean,
  codVerificationStatus: String,
  receipt: String,
  metadata: Object,
  auditLog: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Test Payment Flow

1. **Start the backend and frontend**
2. **Navigate to Wallet screen**
3. **Add money to wallet** (amount between ₹10 and ₹50,000)
4. **Make a payment** using different payment methods
5. **View transaction history** to see all transactions
6. **Test retry mechanism** by retrying a failed payment

### Webhook Testing

Use tools like ngrok to expose your local server:

```bash
ngrok http 3000
```

Configure webhook URLs in Razorpay/Stripe dashboard:
- Razorpay: `https://your-ngrok-url/api/webhooks/razorpay`
- Stripe: `https://your-ngrok-url/api/webhooks/stripe`

## Security Best Practices

1. **Never commit sensitive keys** - Use environment variables
2. **Validate webhook signatures** - Always verify signatures
3. **Use HTTPS in production** - Secure data transmission
4. **Implement rate limiting** - Prevent API abuse
5. **Sanitize user inputs** - Prevent injection attacks
6. **Use strong authentication** - Implement JWT authentication
7. **Encrypt sensitive data** - Use encryption for PII
8. **Regular security audits** - Keep dependencies updated

## Compliance

### PCI-DSS Compliance
- Payment data is handled by Razorpay/Stripe (PCI-DSS compliant)
- No card details stored on servers
- Secure webhook signature verification
- HTTPS for all payment communications

### Data Protection
- User data encrypted at rest
- Secure API authentication
- Audit trail for all transactions
- Regular backups

## Troubleshooting

### Backend Issues

**MongoDB connection failed**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

**Payment gateway errors**
- Verify API keys in `.env`
- Check webhook signature secrets

### Frontend Issues

**API connection failed**
- Update `API_BASE_URL` in `src/services/api.js`
- Ensure backend is running

**Razorpay/Stripe not working**
- Update publishable keys in configuration
- Test mode keys for development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions:
- Create an issue on GitHub
- Contact support team

## Acknowledgments

- Razorpay for payment gateway
- Stripe for international payments
- Expo for React Native development
- MongoDB for database
- Express.js for backend API
