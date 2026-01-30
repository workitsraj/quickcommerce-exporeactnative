# QuickCommerce Backend API

Complete authentication and profile management system for the QuickCommerce instant grocery delivery platform.

## Features

### Authentication System
- ✅ User registration with phone/email
- ✅ OTP verification via SMS and Email
- ✅ Social login (Google, Apple, Facebook)
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Customer, Delivery Partner, Store Manager, Admin)
- ✅ Session management & device tracking
- ✅ Password reset & account recovery flow

### Profile Management
- ✅ User profile CRUD operations
- ✅ Profile picture upload to AWS S3
- ✅ Password update
- ✅ Account deactivation
- ✅ Delivery partner vehicle info management
- ✅ Delivery partner availability toggle

### Address Management
- ✅ Multiple address support
- ✅ GPS coordinates integration
- ✅ Default address management
- ✅ Address types (Home, Work, Other)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer + AWS S3
- **Email**: Nodemailer
- **SMS**: Twilio
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
- MongoDB connection string
- JWT secrets
- AWS S3 credentials
- Email service credentials (Gmail, SendGrid, etc.)
- Twilio credentials for SMS
- Social login credentials (Google, Facebook, Apple)

4. **Start the server**

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "password123",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify OTP sent to your email and phone.",
  "data": {
    "userId": "64abc123...",
    "email": "john@example.com",
    "phone": "+919876543210"
  }
}
```

#### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "userId": "64abc123...",
  "otp": "123456",
  "deviceInfo": {
    "deviceId": "device-uuid",
    "deviceType": "android",
    "deviceName": "Samsung Galaxy S21",
    "appVersion": "1.0.0",
    "osVersion": "11"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "role": "customer",
      "profilePicture": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "deviceInfo": {
    "deviceId": "device-uuid",
    "deviceType": "android"
  }
}
```

#### 4. Social Login
```http
POST /api/auth/social-login
Content-Type: application/json

{
  "provider": "google",
  "providerId": "google-user-id",
  "email": "john@example.com",
  "name": "John Doe",
  "profilePicture": "https://...",
  "deviceInfo": {}
}
```

#### 5. Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 6. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 7. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

#### 8. Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 9. Get Active Sessions
```http
GET /api/auth/sessions
Authorization: Bearer {accessToken}
```

#### 10. Revoke Session
```http
DELETE /api/auth/sessions/{sessionId}
Authorization: Bearer {accessToken}
```

### Profile Endpoints

#### 1. Get Profile
```http
GET /api/profile
Authorization: Bearer {accessToken}
```

#### 2. Update Profile
```http
PUT /api/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Updated",
  "email": "newemail@example.com",
  "phone": "+919876543211"
}
```

#### 3. Upload Profile Picture
```http
POST /api/profile/upload-picture
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

image: [file]
```

#### 4. Delete Profile Picture
```http
DELETE /api/profile/picture
Authorization: Bearer {accessToken}
```

#### 5. Update Password
```http
PUT /api/profile/password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### 6. Delete Account
```http
DELETE /api/profile
Authorization: Bearer {accessToken}
```

#### 7. Update Vehicle Info (Delivery Partners Only)
```http
PUT /api/profile/vehicle-info
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "bike",
  "number": "MH12AB1234",
  "model": "Honda Activa"
}
```

#### 8. Toggle Availability (Delivery Partners Only)
```http
PUT /api/profile/availability
Authorization: Bearer {accessToken}
```

### Address Endpoints

#### 1. Get All Addresses
```http
GET /api/addresses
Authorization: Bearer {accessToken}
```

#### 2. Add Address
```http
POST /api/addresses
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "home",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "landmark": "Near Central Mall",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "isDefault": true
}
```

#### 3. Update Address
```http
PUT /api/addresses/{addressId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "addressLine1": "456 New Street",
  "city": "Mumbai"
}
```

#### 4. Delete Address
```http
DELETE /api/addresses/{addressId}
Authorization: Bearer {accessToken}
```

#### 5. Set Default Address
```http
PUT /api/addresses/{addressId}/default
Authorization: Bearer {accessToken}
```

## User Roles

### Customer
- Can order products
- Can manage profile and addresses
- Default role for new users

### Delivery Partner
- Can accept and deliver orders
- Has vehicle information
- Can toggle availability status
- Requires vehicle info to be active

### Store Manager
- Can manage store inventory
- Can view store orders
- Assigned to specific store

### Admin
- Full system access
- Can manage users, stores, and settings
- Can view analytics

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Refresh Tokens**: Long-lived tokens for seamless user experience
3. **Password Hashing**: bcrypt for secure password storage
4. **Rate Limiting**: Protection against brute force attacks
5. **Helmet**: Security headers
6. **CORS**: Controlled cross-origin resource sharing
7. **Session Tracking**: Device and IP tracking for security
8. **OTP Verification**: Two-factor authentication
9. **Role-Based Access Control**: Fine-grained permissions

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  role: Enum['customer', 'delivery_partner', 'store_manager', 'admin'],
  profilePicture: String (S3 URL),
  addresses: [AddressSchema],
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  socialLogin: {
    provider: Enum['google', 'facebook', 'apple'],
    providerId: String
  },
  isActive: Boolean,
  lastLogin: Date,
  otp: {
    code: String,
    expiresAt: Date,
    verified: Boolean
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  vehicleInfo: {
    type: Enum['bike', 'scooter', 'bicycle', 'car'],
    number: String,
    model: String
  },
  isAvailable: Boolean,
  assignedStore: ObjectId (ref: Store)
}
```

### Session Model
```javascript
{
  user: ObjectId (ref: User),
  refreshToken: String (unique),
  deviceInfo: {
    deviceId: String,
    deviceType: Enum['ios', 'android', 'web'],
    deviceName: String,
    appVersion: String,
    osVersion: String
  },
  ipAddress: String,
  userAgent: String,
  isActive: Boolean,
  lastAccessedAt: Date,
  expiresAt: Date
}
```

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing

Run tests:
```bash
npm test
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
