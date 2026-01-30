import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StripeProvider } from '@stripe/stripe-react-native';

import WalletScreen from './src/screens/WalletScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import WalletTransactionsScreen from './src/screens/WalletTransactionsScreen';

const Stack = createStackNavigator();

const STRIPE_PUBLISHABLE_KEY = 'your_stripe_publishable_key'; // Replace with actual key

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Wallet"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Wallet" 
            component={WalletScreen}
            options={{ title: 'My Wallet' }}
          />
          <Stack.Screen 
            name="PaymentMethods" 
            component={PaymentMethodsScreen}
            options={{ title: 'Payment Methods' }}
          />
          <Stack.Screen 
            name="TransactionHistory" 
            component={TransactionHistoryScreen}
            options={{ title: 'Transaction History' }}
          />
          <Stack.Screen 
            name="WalletTransactions" 
            component={WalletTransactionsScreen}
            options={{ title: 'Wallet Transactions' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}
