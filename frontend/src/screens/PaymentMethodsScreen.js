import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import paymentService from '../services/paymentService';
import { processRazorpayPayment } from '../utils/razorpay';

const PaymentMethodsScreen = ({ route, navigation }) => {
  const { orderId, amount } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'UPI', name: 'UPI', gateway: 'RAZORPAY', icon: '📱' },
    { id: 'CARD', name: 'Credit/Debit Card', gateway: 'RAZORPAY', icon: '💳' },
    { id: 'NET_BANKING', name: 'Net Banking', gateway: 'RAZORPAY', icon: '🏦' },
    { id: 'WALLET', name: 'Wallet', gateway: 'WALLET', icon: '👛' },
    { id: 'COD', name: 'Cash on Delivery', gateway: 'COD', icon: '💵' },
  ];

  const handlePayment = async (method) => {
    setLoading(true);
    try {
      if (method.gateway === 'WALLET') {
        // Direct wallet payment
        const result = await paymentService.initiatePayment(
          orderId,
          amount,
          method.id,
          method.gateway
        );
        
        await paymentService.confirmPayment(
          result.data._id,
          'WALLET_' + Date.now(),
          { source: 'wallet' }
        );

        Alert.alert('Success', 'Payment completed successfully!');
        navigation.navigate('TransactionHistory');
      } else if (method.gateway === 'COD') {
        // COD payment
        const result = await paymentService.initiatePayment(
          orderId,
          amount,
          method.id,
          method.gateway
        );

        Alert.alert('Success', 'Order placed with Cash on Delivery!');
        navigation.navigate('TransactionHistory');
      } else if (method.gateway === 'RAZORPAY') {
        // Razorpay payment
        const result = await paymentService.initiatePayment(
          orderId,
          amount,
          method.id,
          method.gateway
        );

        const orderData = {
          orderId,
          amount,
          gatewayOrderId: result.data.gatewayOrderId,
        };

        processRazorpayPayment(
          orderData,
          async (paymentData) => {
            // Payment successful
            try {
              await paymentService.confirmPayment(
                result.data._id,
                paymentData.razorpay_payment_id,
                paymentData
              );
              Alert.alert('Success', 'Payment completed successfully!');
              navigation.navigate('TransactionHistory');
            } catch (error) {
              Alert.alert('Error', 'Payment confirmation failed: ' + error);
            }
          },
          (error) => {
            // Payment failed
            Alert.alert('Payment Failed', error.description || 'Payment was cancelled');
          }
        );
      }
    } catch (error) {
      Alert.alert('Error', error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Payment Method</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to Pay:</Text>
          <Text style={styles.amount}>₹{amount}</Text>
        </View>
      </View>

      <View style={styles.methodsContainer}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardSelected,
            ]}
            onPress={() => {
              setSelectedMethod(method.id);
              handlePayment(method);
            }}
            disabled={loading}
          >
            <Text style={styles.methodIcon}>{method.icon}</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodGateway}>{method.gateway}</Text>
            </View>
            {loading && selectedMethod === method.id && (
              <ActivityIndicator size="small" color="#007AFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  methodsContainer: {
    padding: 15,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  methodCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  methodIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  methodGateway: {
    fontSize: 12,
    color: '#666',
  },
});

export default PaymentMethodsScreen;
