# QuickCommerce - Instant Grocery Delivery Platform

A full-stack instant grocery delivery application replicating the core features and UI/UX of leading quick commerce platforms (Blinkit & Zepto) as of 2026. This platform enables 10-minute grocery delivery with real-time inventory management, dynamic pricing, and hyperlocal dark store operations.

## 🚀 Features Implemented

### ✅ User Authentication & Profile Management Module

This implementation provides a complete authentication system with the following features:

#### Authentication
- ✅ User registration with phone/email (OTP verification)
- ✅ Social login (Google, Apple, Facebook)
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Customer, Delivery Partner, Store Manager, Admin)
- ✅ Session management & device tracking
- ✅ Password reset & account recovery flow

#### Profile Management
- ✅ User profile CRUD operations
- ✅ Profile picture upload to AWS S3
- ✅ Password update functionality
- ✅ Account deactivation

#### Address Management
- ✅ Multiple address support with GPS integration
- ✅ Default address management
- ✅ Address types (Home, Work, Other)
- ✅ CRUD operations for addresses

## 🏗️ Architecture

```
quickcommerce-exporeactnative/
├── backend/                 # Node.js/Express Backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, upload, etc.
│   │   ├── services/       # Email, SMS, S3
│   │   ├── utils/          # JWT, helpers
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── README.md
│
├── mobile/                  # React Native App
│   ├── src/
│   │   ├── screens/        # UI screens
│   │   ├── navigation/     # App navigation
│   │   ├── contexts/       # State management
│   │   ├── services/       # API integration
│   │   ├── components/     # Reusable components
│   │   └── constants/      # App constants
│   ├── App.js
│   ├── package.json
│   └── README.md
│
└── README.md               # This file
```

## 💻 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Storage**: AWS S3
- **Email**: Nodemailer
- **SMS**: Twilio
- **Security**: Helmet, bcryptjs, express-rate-limit

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Storage**: AsyncStorage
- **UI Components**: Custom + React Native Paper

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- AWS account (for S3)
- Twilio account (for SMS)
- Email service (Gmail/SendGrid)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Start the server
npm run dev
```

The backend will start on `http://localhost:5000`

### 2. Mobile App Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Update API URL in src/constants/index.js
# Then start the app
npm start

# Run on specific platform
npm run ios     # For iOS
npm run android # For Android
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/social-login` | Social login |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/sessions` | Get active sessions |
| DELETE | `/api/auth/sessions/:id` | Revoke session |

### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/upload-picture` | Upload profile picture |
| DELETE | `/api/profile/picture` | Delete profile picture |
| PUT | `/api/profile/password` | Update password |
| DELETE | `/api/profile` | Delete account |

### Address Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/addresses` | Get all addresses |
| POST | `/api/addresses` | Add new address |
| PUT | `/api/addresses/:id` | Update address |
| DELETE | `/api/addresses/:id` | Delete address |
| PUT | `/api/addresses/:id/default` | Set default address |

For detailed API documentation, see [backend/README.md](backend/README.md)

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Refresh Tokens**: Long-lived tokens for seamless experience
3. **Password Hashing**: bcrypt for secure password storage
4. **Rate Limiting**: Protection against brute force attacks
5. **Helmet**: Security headers
6. **CORS**: Controlled cross-origin resource sharing
7. **Session Tracking**: Device and IP tracking
8. **OTP Verification**: Two-factor authentication
9. **Role-Based Access Control**: Fine-grained permissions

## 👥 User Roles

### Customer
- Browse and order products
- Manage profile and addresses
- Track orders

### Delivery Partner
- Accept and deliver orders
- Update vehicle information
- Toggle availability status

### Store Manager
- Manage store inventory
- View and process store orders
- Update store information

### Admin
- Full system access
- Manage users, stores, and settings
- View analytics and reports

## 🔧 Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/quickcommerce

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

# Social Login
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
APPLE_CLIENT_ID=your_apple_client_id
```

### Mobile (src/constants/index.js)
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```

## 📱 Mobile App Screens

1. **Login Screen** - Email/phone login with social options
2. **Register Screen** - User registration with role selection
3. **OTP Verification** - 6-digit OTP verification
4. **Profile Screen** - View/edit profile, manage settings
5. **Addresses Screen** - Manage delivery addresses
6. **Add/Edit Address** - Form for address details with GPS

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile Tests
```bash
cd mobile
npm test
```

## 📦 Deployment

### Backend Deployment (Heroku example)
```bash
cd backend
heroku create quickcommerce-api
git push heroku main
```

### Mobile Deployment
```bash
cd mobile
# For iOS
expo build:ios

# For Android
expo build:android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Blinkit and Zepto
- Built for learning and demonstration purposes

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@quickcommerce.com

---

**Note**: This is the User Authentication & Profile Management Module implementation. Additional modules (Orders, Inventory, Payments, etc.) will be implemented in future updates.
