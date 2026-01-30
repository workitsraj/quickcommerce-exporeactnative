import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QuickCommerce</Text>
      <Text style={styles.subtitle}>Fast delivery from local stores</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.buttonText}>Go to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.buttonText}>Order History</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.infoText}>
        Cart, Checkout & Order Processing System
      </Text>
      <Text style={styles.featuresText}>
        ✓ Cart with quantity management{'\n'}
        ✓ Cart persistence (logged-in & guest){'\n'}
        ✓ Apply coupons & promotional codes{'\n'}
        ✓ Dynamic pricing calculation{'\n'}
        ✓ Order placement & tracking{'\n'}
        ✓ Order history & reorder{'\n'}
        ✓ Real-time order updates{'\n'}
        ✓ Order cancellation & refund
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonsContainer: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
    textAlign: 'left',
  },
});

export default HomeScreen;
