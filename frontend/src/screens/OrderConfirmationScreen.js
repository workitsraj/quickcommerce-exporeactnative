import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { order } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.successContainer}>
        <View style={styles.checkmarkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Order Placed Successfully!</Text>
        <Text style={styles.successSubtitle}>
          Thank you for your order
        </Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderIdLabel}>Order ID</Text>
        <Text style={styles.orderId}>#{order.orderId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              ${item.price.toFixed(2)} x {item.quantity}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>${order.subtotal.toFixed(2)}</Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={[styles.priceValue, styles.discountText]}>
              -${order.discount.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Fee</Text>
          <Text style={styles.priceValue}>${order.deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tax</Text>
          <Text style={styles.priceValue}>${order.tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <Text style={styles.text}>
          {order.deliveryAddress.street}
        </Text>
        <Text style={styles.text}>
          {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
        </Text>
        {order.scheduledDelivery && (
          <>
            <Text style={styles.deliverySlot}>
              Delivery Slot: {order.scheduledDelivery.slot}
            </Text>
            <Text style={styles.deliveryDate}>
              {new Date(order.scheduledDelivery.date).toLocaleDateString()}
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => navigation.navigate('OrderTracking', { orderId: order.orderId })}
      >
        <Text style={styles.trackButtonText}>Track Order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.continueButtonText}>Continue Shopping</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  successContainer: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  orderInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  orderIdLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deliverySlot: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 12,
  },
  deliveryDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  trackButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  continueButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderConfirmationScreen;
