import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useOrders } from '../context/OrderContext';

const ORDER_STATUSES = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'dispatched', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { getOrder, cancelOrder, loading } = useOrders();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    const result = await getOrder(orderId);
    if (result.success) {
      setOrder(result.order);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const result = await cancelOrder(orderId, 'Customer requested cancellation');
            if (result.success) {
              Alert.alert('Success', 'Order cancelled successfully');
              setOrder(result.order);
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  const currentStatusIndex = ORDER_STATUSES.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.orderId}</Text>
        <Text style={[styles.status, isCancelled && styles.cancelledStatus]}>
          {isCancelled ? 'CANCELLED' : order.status.toUpperCase()}
        </Text>
      </View>

      {!isCancelled && (
        <View style={styles.trackingContainer}>
          {ORDER_STATUSES.map((status, index) => {
            const isActive = index <= currentStatusIndex;
            const isCompleted = index < currentStatusIndex;
            
            return (
              <View key={status.key} style={styles.statusItem}>
                <View style={styles.statusIconContainer}>
                  <View
                    style={[
                      styles.statusIcon,
                      isActive && styles.statusIconActive,
                      isCompleted && styles.statusIconCompleted,
                    ]}
                  >
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  {index < ORDER_STATUSES.length - 1 && (
                    <View
                      style={[
                        styles.statusLine,
                        isCompleted && styles.statusLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.statusLabel,
                    isActive && styles.statusLabelActive,
                  ]}
                >
                  {status.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
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
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>
          {order.deliveryAddress.street}
        </Text>
        <Text style={styles.addressText}>
          {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
        </Text>
      </View>

      {order.scheduledDelivery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Delivery</Text>
          <Text style={styles.text}>
            {new Date(order.scheduledDelivery.date).toLocaleDateString()}
          </Text>
          <Text style={styles.text}>{order.scheduledDelivery.slot}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.priceRow}>
          <Text>Subtotal:</Text>
          <Text>${order.subtotal.toFixed(2)}</Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.priceRow}>
            <Text>Discount:</Text>
            <Text style={styles.discountText}>-${order.discount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text>Delivery Fee:</Text>
          <Text>${order.deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text>Tax:</Text>
          <Text>${order.tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>${order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {['pending', 'confirmed'].includes(order.status) && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelOrder}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      )}

      {order.invoiceUrl && (
        <TouchableOpacity style={styles.invoiceButton}>
          <Text style={styles.invoiceButtonText}>Download Invoice</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cancelledStatus: {
    color: '#ff5252',
  },
  trackingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    marginTop: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  statusIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconActive: {
    borderColor: '#4CAF50',
  },
  statusIconCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusLine: {
    width: 2,
    height: 30,
    backgroundColor: '#ddd',
    marginTop: 4,
  },
  statusLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusLabel: {
    fontSize: 16,
    color: '#999',
    paddingTop: 4,
  },
  statusLabelActive: {
    color: '#333',
    fontWeight: '500',
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
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
    paddingTop: 8,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ff5252',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  invoiceButton: {
    backgroundColor: '#2196F3',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  invoiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderTrackingScreen;
