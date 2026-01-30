# QuickCommerce Mobile App

React Native mobile application for QuickCommerce - Instant Grocery Delivery Platform.

## Features

### Authentication
- ✅ User registration with phone/email
- ✅ OTP verification
- ✅ Login with email/phone
- ✅ Social login support (Google, Facebook, Apple)
- ✅ Password reset
- ✅ Token-based authentication with automatic refresh

### Profile Management
- ✅ View and edit profile
- ✅ Upload profile picture
- ✅ Change password
- ✅ View active sessions
- ✅ Logout functionality

### Address Management
- ✅ Add multiple addresses
- ✅ Edit addresses
- ✅ Delete addresses
- ✅ Set default address
- ✅ GPS location support

### Role-Based Features
- Customer interface
- Delivery Partner interface (availability toggle, vehicle info)
- Store Manager interface
- Admin interface

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Image Picker**: expo-image-picker
- **Location**: expo-location
- **Maps**: react-native-maps

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Setup

1. **Navigate to mobile directory**
```bash
cd mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Update API configuration**

Edit `src/constants/index.js` and update the `API_BASE_URL`:
```javascript
export const API_BASE_URL = 'http://YOUR_SERVER_IP:5000/api';
```

For local development:
- iOS Simulator: `http://localhost:5000/api`
- Android Emulator: `http://10.0.2.2:5000/api`
- Physical device: `http://YOUR_LOCAL_IP:5000/api`

4. **Start the development server**
```bash
npm start
```

5. **Run on device/emulator**

For iOS:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── VerifyOTPScreen.js
│   │   ├── ProfileScreen.js
│   │   └── AddressesScreen.js
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.js
│   ├── contexts/         # React contexts
│   │   └── AuthContext.js
│   ├── services/         # API services
│   │   ├── api.js
│   │   └── authService.js
│   ├── components/       # Reusable components
│   ├── constants/        # App constants
│   │   └── index.js
│   └── utils/           # Utility functions
├── App.js               # Root component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Screens

### Authentication Flow

1. **Login Screen** (`LoginScreen.js`)
   - Email/phone and password login
   - Social login buttons
   - Navigation to register and forgot password

2. **Register Screen** (`RegisterScreen.js`)
   - User registration form
   - Role selection
   - OTP verification flow

3. **OTP Verification** (`VerifyOTPScreen.js`)
   - 6-digit OTP input
   - Resend OTP functionality
   - Auto-login after verification

### Main Features

4. **Profile Screen** (`ProfileScreen.js`)
   - View and edit user information
   - Upload profile picture
   - Access settings and other features
   - Logout

5. **Addresses Screen** (`AddressesScreen.js`)
   - List all saved addresses
   - Add new address
   - Edit existing address
   - Delete address
   - Set default address

## API Integration

The app communicates with the backend API using Axios. The API client is configured in `src/services/api.js` with:

- Automatic token attachment to requests
- Token refresh on 401 errors
- Request/response interceptors

### Authentication Flow

1. User registers or logs in
2. Backend returns access token and refresh token
3. Tokens are stored in AsyncStorage
4. Access token is attached to all API requests
5. If access token expires, refresh token is used automatically
6. User is logged out if refresh token also expires

## Environment Configuration

Update the following in `src/constants/index.js`:

```javascript
export const API_BASE_URL = 'YOUR_API_URL';

export const COLORS = {
  primary: '#00B207',      // Main brand color
  secondary: '#2B8C4A',    // Secondary color
  // ... other colors
};
```

## Social Login Setup

### Google Sign-In

1. Install dependencies
2. Configure Google OAuth credentials
3. Add configuration to `app.json`

### Facebook Login

1. Create Facebook App
2. Configure Facebook SDK
3. Add app ID to `app.json`

### Apple Sign-In

1. Configure Apple Developer account
2. Enable Sign In with Apple capability
3. Automatically handled by Expo

## State Management

The app uses React Context API for state management:

- **AuthContext**: Manages authentication state, user data, and auth operations

## Storage

AsyncStorage is used to persist:
- Access token
- Refresh token
- User data

## Navigation

The app uses React Navigation with:
- Stack Navigator for screen transitions
- Bottom Tab Navigator for main app sections
- Conditional rendering based on authentication state

## Styling

Consistent styling using:
- StyleSheet API
- Centralized color constants
- Responsive layouts

## Testing

To run tests:
```bash
npm test
```

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
```bash
expo start -c
```

2. **Network request failed**
   - Check API_BASE_URL configuration
   - Ensure backend server is running
   - Check firewall settings

3. **Image picker not working**
   - Grant camera/gallery permissions
   - Check permission configuration in app.json

## Future Enhancements

- [ ] Biometric authentication
- [ ] Push notifications
- [ ] Offline mode
- [ ] In-app chat support
- [ ] Order tracking with real-time maps
- [ ] Payment integration
- [ ] Rating and reviews

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
