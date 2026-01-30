import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <CartProvider>
        <OrderProvider>
          <AppNavigator />
        </OrderProvider>
      </CartProvider>
    </>
  );
}
