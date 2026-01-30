# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except webhooks) require authentication via the `x-user-id` header.

```
x-user-id: user123
```

## Payment Endpoints

### 1. Initiate Payment

Creates a new payment transaction and initiates the payment with the selected gateway.

**Endpoint:** `POST /payments/initiate`

**Headers:**
```
x-user-id: user123
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "ORDER123",
  "amount": 100,
  "paymentMethod": "UPI",
  "paymentGateway": "RAZORPAY",
  "metadata": {
    "productId": "prod123",
    "customerId": "cust456"
  }
}
```

**Parameters:**
- `orderId` (string, required): Unique order identifier
- `amount` (number, required): Payment amount in INR
- `paymentMethod` (string, required): One of `UPI`, `CARD`, `NET_BANKING`, `WALLET`, `COD`
- `paymentGateway` (string, required): One of `RAZORPAY`, `STRIPE`, `WALLET`, `COD`
- `metadata` (object, optional): Additional data

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "trans_123",
    "userId": "user123",
    "orderId": "ORDER123",
    "amount": 100,
    "paymentMethod": "UPI",
    "paymentGateway": "RAZORPAY",
    "status": "PROCESSING",
    "gatewayOrderId": "order_xyz",
    "gatewayResponse": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Confirm Payment

Confirms a payment after successful gateway transaction.

**Endpoint:** `POST /payments/confirm`

**Request Body:**
```json
{
  "transactionId": "trans_123",
  "gatewayTransactionId": "pay_456",
  "gatewayData": {
    "razorpay_signature": "abc123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "trans_123",
    "status": "SUCCESS",
    "gatewayTransactionId": "pay_456"
  }
}
```

---

### 3. Retry Payment

Retries a failed payment.

**Endpoint:** `POST /payments/:transactionId/retry`

**URL Parameters:**
- `transactionId` (string): Transaction ID to retry

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "trans_124",
    "orderId": "ORDER123",
    "status": "PROCESSING",
    "retryCount": 1
  }
}
```

---

### 4. Process Refund

Processes a full or partial refund.

**Endpoint:** `POST /payments/:transactionId/refund`

**Request Body:**
```json
{
  "amount": 50
}
```

**Parameters:**
- `amount` (number, optional): Refund amount. If not provided, full refund is processed.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "trans_123",
    "status": "PARTIALLY_REFUNDED",
    "refundAmount": 50,
    "refundedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Get Transaction History

Retrieves user's payment transaction history.

**Endpoint:** `GET /payments/history`

**Query Parameters:**
- `limit` (number, optional): Number of records (default: 50, max: 100)
- `skip` (number, optional): Number of records to skip (default: 0)
- `status` (string, optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "total": 100,
    "hasMore": true
  }
}
```

---

### 6. Verify COD

Verifies Cash on Delivery payment.

**Endpoint:** `POST /payments/:transactionId/verify-cod`

**Request Body:**
```json
{
  "verificationStatus": "VERIFIED"
}
```

**Parameters:**
- `verificationStatus` (string): One of `PENDING`, `VERIFIED`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "trans_123",
    "codVerificationStatus": "VERIFIED",
    "status": "SUCCESS"
  }
}
```

---

## Wallet Endpoints

### 1. Create Wallet

Creates a new wallet for the user.

**Endpoint:** `POST /wallet/create`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "wallet_123",
    "userId": "user123",
    "balance": 0,
    "currency": "INR",
    "isActive": true
  }
}
```

---

### 2. Get Wallet

Retrieves user's wallet information.

**Endpoint:** `GET /wallet`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "wallet_123",
    "userId": "user123",
    "balance": 500,
    "currency": "INR",
    "isActive": true
  }
}
```

---

### 3. Add Money to Wallet

Adds money to the wallet.

**Endpoint:** `POST /wallet/add-money`

**Request Body:**
```json
{
  "amount": 100,
  "description": "Money added to wallet",
  "referenceId": "REF123"
}
```

**Parameters:**
- `amount` (number, required): Amount to add (min: 10, max: 50000)
- `description` (string, optional): Transaction description
- `referenceId` (string, optional): Reference ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "wallet_123",
    "balance": 600
  }
}
```

---

### 4. Get Wallet Transactions

Retrieves wallet transaction history.

**Endpoint:** `GET /wallet/transactions`

**Query Parameters:**
- `limit` (number, optional): Number of records (default: 50)
- `skip` (number, optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "wt_123",
        "type": "CREDIT",
        "amount": 100,
        "description": "Money added",
        "balanceAfter": 600,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "hasMore": false
  }
}
```

---

## Webhook Endpoints

### 1. Razorpay Webhook

Handles Razorpay payment webhooks.

**Endpoint:** `POST /webhooks/razorpay`

**Headers:**
```
x-razorpay-signature: signature_string
Content-Type: application/json
```

**Request Body:**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_123",
        "order_id": "order_456",
        "status": "captured",
        "amount": 10000
      }
    }
  }
}
```

---

### 2. Stripe Webhook

Handles Stripe payment webhooks.

**Endpoint:** `POST /webhooks/stripe`

**Headers:**
```
stripe-signature: signature_string
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_123",
      "amount": 10000,
      "status": "succeeded"
    }
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `429`: Too Many Requests (Rate Limited)
- `500`: Internal Server Error

---

## Rate Limiting

Rate limits are applied per IP address:

- Payment endpoints: 10 requests per 15 minutes
- Wallet endpoints: 20 requests per 15 minutes
- Webhook endpoints: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1234567890
```

---

## Testing

### Test Credentials

**Razorpay Test Mode:**
- Key ID: Available in Razorpay dashboard
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/

**Stripe Test Mode:**
- Publishable Key: Available in Stripe dashboard
- Test cards: https://stripe.com/docs/testing

### Example cURL Requests

**Initiate Payment:**
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

**Get Wallet:**
```bash
curl -X GET http://localhost:3000/api/wallet \
  -H "x-user-id: user123"
```

---

## Webhook Signature Verification

### Razorpay

```javascript
const crypto = require('crypto');

const signature = req.headers['x-razorpay-signature'];
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

const isValid = signature === expectedSignature;
```

### Stripe

```javascript
const stripe = require('stripe')(SECRET_KEY);

const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  signature,
  WEBHOOK_SECRET
);
```
