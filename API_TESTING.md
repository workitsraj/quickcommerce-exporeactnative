# API Testing Guide

This guide provides examples for testing the QuickCommerce API using cURL, Postman, or any HTTP client.

## Base URL
```
http://localhost:5000/api
```

## Authentication Flow Testing

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "password": "password123",
    "role": "customer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify OTP sent to your email and phone.",
  "data": {
    "userId": "65abc123def456...",
    "email": "john@example.com",
    "phone": "+919876543210"
  }
}
```

### 2. Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65abc123def456...",
    "otp": "123456",
    "deviceInfo": {
      "deviceId": "test-device-123",
      "deviceType": "android",
      "deviceName": "Samsung Galaxy S21",
      "appVersion": "1.0.0",
      "osVersion": "11"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "65abc123def456...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "role": "customer",
      "profilePicture": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "deviceInfo": {
      "deviceId": "test-device-123",
      "deviceType": "android"
    }
  }'
```

### 4. Social Login

```bash
curl -X POST http://localhost:5000/api/auth/social-login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "providerId": "google-user-id-12345",
    "email": "john@example.com",
    "name": "John Doe",
    "profilePicture": "https://example.com/profile.jpg",
    "deviceInfo": {
      "deviceId": "test-device-123",
      "deviceType": "ios"
    }
  }'
```

### 5. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### 6. Forgot Password

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### 7. Reset Password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "newpassword123"
  }'
```

## Profile Management Testing

### 1. Get User Profile

```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Update Profile

```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "newemail@example.com"
  }'
```

### 3. Upload Profile Picture

```bash
curl -X POST http://localhost:5000/api/profile/upload-picture \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### 4. Update Password

```bash
curl -X PUT http://localhost:5000/api/profile/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

### 5. Delete Account

```bash
curl -X DELETE http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Address Management Testing

### 1. Get All Addresses

```bash
curl -X GET http://localhost:5000/api/addresses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Add Address

```bash
curl -X POST http://localhost:5000/api/addresses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 3. Update Address

```bash
curl -X PUT http://localhost:5000/api/addresses/ADDRESS_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressLine1": "456 New Street",
    "city": "Mumbai"
  }'
```

### 4. Delete Address

```bash
curl -X DELETE http://localhost:5000/api/addresses/ADDRESS_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Set Default Address

```bash
curl -X PUT http://localhost:5000/api/addresses/ADDRESS_ID/default \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Session Management Testing

### 1. Get Active Sessions

```bash
curl -X GET http://localhost:5000/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Revoke Session

```bash
curl -X DELETE http://localhost:5000/api/auth/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## Delivery Partner Specific APIs

### 1. Update Vehicle Info

```bash
curl -X PUT http://localhost:5000/api/profile/vehicle-info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bike",
    "number": "MH12AB1234",
    "model": "Honda Activa"
  }'
```

### 2. Toggle Availability

```bash
curl -X PUT http://localhost:5000/api/profile/availability \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Testing Tips

1. **Save Access Token**: After login/register, save the access token for subsequent requests
2. **Token Expiry**: Access tokens expire in 15 minutes by default. Use refresh token to get a new one
3. **Error Handling**: Check for proper error messages and status codes
4. **Rate Limiting**: API has rate limiting (100 requests per 15 minutes by default)
5. **CORS**: Ensure proper CORS configuration for web clients

## Common HTTP Status Codes

- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Postman Collection

Import the following into Postman for easier testing:

1. Create a new collection named "QuickCommerce API"
2. Add a variable `baseUrl` = `http://localhost:5000/api`
3. Add a variable `accessToken` (will be set after login)
4. Import all endpoints from this guide

## Testing Checklist

- [ ] User can register successfully
- [ ] OTP is sent to email and phone
- [ ] OTP verification works
- [ ] User can login with email/password
- [ ] User can login with phone/password
- [ ] Social login works for each provider
- [ ] Access token expires and refresh works
- [ ] User can view profile
- [ ] User can update profile
- [ ] User can upload profile picture
- [ ] User can change password
- [ ] User can add address
- [ ] User can update address
- [ ] User can delete address
- [ ] User can set default address
- [ ] User can view active sessions
- [ ] User can logout
- [ ] Delivery partner can update vehicle info
- [ ] Delivery partner can toggle availability
- [ ] Password reset flow works
- [ ] Role-based access control works
- [ ] Rate limiting works
- [ ] Error messages are clear and helpful
