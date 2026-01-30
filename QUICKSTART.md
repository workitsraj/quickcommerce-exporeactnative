# Quick Start Guide

This guide will help you get the QuickCommerce Multi-Payment Gateway & Wallet System up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (v4.4 or higher)
- Expo CLI: `npm install -g expo-cli`

## Step 1: Clone the Repository

```bash
git clone https://github.com/workitsraj/quickcommerce-exporeactnative.git
cd quickcommerce-exporeactnative
```

## Step 2: Backend Setup (5 minutes)

### 2.1. Install Dependencies

```bash
cd backend
npm install
```

### 2.2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/quickcommerce

# Get these from https://dashboard.razorpay.com/
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Get these from https://dashboard.stripe.com/
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

JWT_SECRET=your_jwt_secret_key_here
REFUND_TIMEOUT_MINUTES=5
MIN_WALLET_AMOUNT=10
MAX_WALLET_AMOUNT=50000
```

### 2.3. Start MongoDB

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or run directly
mongod
```

### 2.4. Start Backend Server

```bash
npm run dev
```

You should see:
```
Server is running on port 3000
Environment: development
MongoDB Connected: localhost
```

## Step 3: Frontend Setup (3 minutes)

### 3.1. Install Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 3.2. Configure API Endpoint

Edit `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api'; // For iOS simulator
// const API_BASE_URL = 'http://10.0.2.2:3000/api'; // For Android emulator
// const API_BASE_URL = 'http://YOUR_IP:3000/api'; // For physical device
```

### 3.3. Configure Payment Gateway Keys

**Edit `App.js`:**
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_xxxxx'; // Your Stripe publishable key
```

**Edit `src/utils/razorpay.js`:**
```javascript
key: 'rzp_test_xxxxx', // Your Razorpay key ID
```

### 3.4. Start Expo Development Server

```bash
npm start
```

### 3.5. Run on Device/Emulator

- **iOS Simulator**: Press `i` or run `npm run ios`
- **Android Emulator**: Press `a` or run `npm run android`
- **Physical Device**: Scan QR code with Expo Go app

## Step 4: Test the Application

### 4.1. Test Wallet Creation

1. Open the app
2. You'll see the Wallet screen
3. A wallet will be automatically created with ₹0 balance

### 4.2. Test Add Money to Wallet

1. On Wallet screen, enter an amount (₹10 - ₹50,000)
2. Click "Add Money"
3. Complete payment via Razorpay/Stripe
4. See balance updated in real-time

### 4.3. Test Payment with Different Methods

1. Click "Make Payment" button
2. Select a payment method:
   - **UPI**: Opens Razorpay with UPI options
   - **Card**: Opens Razorpay/Stripe card form
   - **Net Banking**: Opens Razorpay bank list
   - **Wallet**: Deducts from wallet balance
   - **COD**: Places order with COD

### 4.4. Test Transaction History

1. Click "Transaction History" button
2. View all payment transactions
3. Try retrying a failed payment

### 4.5. Test Wallet Transactions

1. Click "Transaction History" from Wallet screen
2. View all wallet credits/debits
3. See balance after each transaction

## Step 5: Test Backend APIs (Optional)

### 5.1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5.2. Create Wallet

```bash
curl -X POST http://localhost:3000/api/wallet/create \
  -H "x-user-id: user123" \
  -H "Content-Type: application/json"
```

### 5.3. Get Wallet

```bash
curl http://localhost:3000/api/wallet \
  -H "x-user-id: user123"
```

### 5.4. Initiate Payment

```bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "x-user-id: user123" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER123",
    "amount": 100,
    "paymentMethod": "UPI",
    "paymentGateway": "RAZORPAY"
  }'
```

## Step 6: Configure Webhooks (For Production)

### 6.1. Expose Local Server

For local development, use ngrok:

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 6.2. Configure Razorpay Webhook

1. Go to https://dashboard.razorpay.com/
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://abc123.ngrok.io/api/webhooks/razorpay`
4. Select events: `payment.captured`, `payment.failed`
5. Copy the webhook secret to `.env`

### 6.3. Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/
2. Navigate to Developers → Webhooks
3. Add endpoint: `https://abc123.ngrok.io/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook secret to `.env`

## Common Issues & Solutions

### Backend Issues

**Error: MongoDB connection failed**
```
Solution: Ensure MongoDB is running
mongod
```

**Error: Port 3000 already in use**
```
Solution: Change PORT in .env or kill the process
lsof -ti:3000 | xargs kill
```

**Error: Invalid Razorpay/Stripe keys**
```
Solution: 
1. Verify keys in .env
2. Ensure you're using test mode keys
3. Check for extra spaces or quotes
```

### Frontend Issues

**Error: Unable to connect to backend**
```
Solution:
1. Check API_BASE_URL in src/services/api.js
2. For Android emulator, use http://10.0.2.2:3000/api
3. For iOS simulator, use http://localhost:3000/api
4. For physical device, use your computer's IP
```

**Error: Razorpay/Stripe not opening**
```
Solution:
1. Verify keys in App.js and razorpay.js
2. Check if SDK dependencies are installed
3. Rebuild the app: expo prebuild && npm run android/ios
```

**Error: Expo Go crashing**
```
Solution:
1. Clear Expo cache: expo start -c
2. Reinstall Expo Go app
3. Try development build instead of Expo Go
```

## Testing with Test Cards

### Razorpay Test Cards

**Successful Payment:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

More test cards: https://razorpay.com/docs/payments/payments/test-card-details/

### Stripe Test Cards

**Successful Payment:**
- Card: 4242 4242 4242 4242
- CVV: Any 3 digits
- Expiry: Any future date

**Requires Authentication:**
- Card: 4000 0025 0000 3155

**Declined:**
- Card: 4000 0000 0000 0002

More test cards: https://stripe.com/docs/testing

## Next Steps

1. **Customize UI**: Modify screens in `frontend/src/screens/`
2. **Add Features**: Extend services in `backend/src/services/`
3. **Deploy Backend**: Use Heroku, AWS, or DigitalOcean
4. **Build App**: Use EAS Build for production app
5. **Add Analytics**: Integrate analytics tracking
6. **Add Tests**: Expand test coverage in `backend/tests/`

## Getting Help

- **Documentation**: See README.md, API_DOCUMENTATION.md, ARCHITECTURE.md
- **Issues**: Create an issue on GitHub
- **Razorpay Docs**: https://razorpay.com/docs/
- **Stripe Docs**: https://stripe.com/docs
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/

## Useful Commands

### Backend
```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Frontend
```bash
# Start Expo server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache
expo start -c
```

## Production Checklist

Before deploying to production:

- [ ] Change all test mode keys to live mode keys
- [ ] Set NODE_ENV=production in backend
- [ ] Use HTTPS for all API endpoints
- [ ] Configure proper authentication (replace x-user-id header)
- [ ] Set up proper database backups
- [ ] Enable MongoDB authentication
- [ ] Configure rate limiting for production traffic
- [ ] Set up monitoring and alerting
- [ ] Configure webhook URLs with production domain
- [ ] Test all payment flows end-to-end
- [ ] Review and update CORS settings
- [ ] Set up SSL certificates
- [ ] Enable logging and error tracking
- [ ] Perform security audit
- [ ] Test refund processing

Happy Coding! 🚀
