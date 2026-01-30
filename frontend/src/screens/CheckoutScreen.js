import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

const DELIVERY_SLOTS = [
  { id: '1', label: '9AM - 12PM' },
  { id: '2', label: '12PM - 3PM' },
  { id: '3', label: '3PM - 6PM' },
  { id: '4', label: '6PM - 9PM' },
];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit/Debit Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'cash', label: 'Cash on Delivery' },
];

const CheckoutScreen = ({ navigation }) => {
  const { cart, clearCart } = useCart();
  const { createOrder, loading } = useOrders();
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  });
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const calculatePricing = () => {
    const subtotal = cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const discount = cart?.appliedCoupon?.discount || 0;
    const deliveryFee = 50;
    const surgeFee = 0;
    const tax = ((subtotal - discount) * 0.05);
    const total = subtotal - discount + deliveryFee + surgeFee + tax;
    
    return {
      subtotal,
      discount,
      deliveryFee,
      surgeFee,
      tax,
      total,
    };
  };

  const pricing = calculatePricing();

  const handlePlaceOrder = async () => {
    // Validate address
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }
    
    // Validate delivery slot
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a delivery slot');
      return;
    }
    
    const orderData = {
      items: cart.items,
      deliveryAddress,
      scheduledDelivery: {
        date: selectedDate,
        slot: DELIVERY_SLOTS.find(s => s.id === selectedSlot)?.label,
      },
      paymentMethod: selectedPaymentMethod,
      couponCode: cart.appliedCoupon?.code,
    };
    
    const result = await createOrder(orderData);
    
    if (result.success) {
      await clearCart();
      navigation.navigate('OrderConfirmation', { order: result.order });
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          value={deliveryAddress.street}
          onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, street: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          value={deliveryAddress.city}
          onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, city: text })}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="State"
            value={deliveryAddress.state}
            onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, state: text })}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="ZIP Code"
            value={deliveryAddress.zipCode}
            onChangeText={(text) => setDeliveryAddress({ ...deliveryAddress, zipCode: text })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Slot</Text>
        <View style={styles.slotsContainer}>
          {DELIVERY_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.slotButton,
                selectedSlot === slot.id && styles.slotButtonSelected,
              ]}
              onPress={() => setSelectedSlot(slot.id)}
            >
              <Text
                style={[
                  styles.slotButtonText,
                  selectedSlot === slot.id && styles.slotButtonTextSelected,
                ]}
              >
                {slot.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodButton,
              selectedPaymentMethod === method.id && styles.paymentMethodButtonSelected,
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === method.id && styles.paymentMethodTextSelected,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>${pricing.subtotal.toFixed(2)}</Text>
        </View>
        {pricing.discount > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={[styles.priceValue, styles.discountText]}>
              -${pricing.discount.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Fee</Text>
          <Text style={styles.priceValue}>${pricing.deliveryFee.toFixed(2)}</Text>
        </View>
        {pricing.surgeFee > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Surge Fee</Text>
            <Text style={styles.priceValue}>${pricing.surgeFee.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tax (5%)</Text>
          <Text style={styles.priceValue}>${pricing.tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${pricing.total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.placeOrderButton}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.placeOrderButtonText}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  slotButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  slotButtonText: {
    fontSize: 14,
    color: '#333',
  },
  slotButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  paymentMethodButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  paymentMethodButtonSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
  },
  paymentMethodTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
