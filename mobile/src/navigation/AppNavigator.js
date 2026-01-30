import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';

// Main Screens
import ProfileScreen from '../screens/ProfileScreen';
import AddressesScreen from '../screens/AddressesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
  </Stack.Navigator>
);

// Customer Tab Navigator
const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#00B207',
      tabBarInactiveTintColor: '#6C757D',
    }}
  >
    <Tab.Screen
      name="Home"
      component={ProfileScreen}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

// Main Stack Navigator
const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Tabs"
      component={CustomerTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Addresses"
      component={AddressesScreen}
      options={{ title: 'My Addresses' }}
    />
  </Stack.Navigator>
);

// Main Navigation Component
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
