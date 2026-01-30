import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useOrders } from '../context/OrderContext';

const OrderHistoryScreen = ({ navigation }) => {
  const { orders, getUserOrders, reorder, loading } = useOrders();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    await getUserOrders();
  };

  const handleReorder = async (orderId) => {
    Alert.alert(
      'Reorder',
      'Do you want to reorder these items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const result = await reorder(orderId);
            if (result.success) {
              Alert.alert('Success', 'Order placed successfully!');
              navigation.navigate('OrderTracking', { orderId: result.order.orderId });
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA726',
      confirmed: '#42A5F5',
      packed: '#AB47BC',
      dispatched: '#5C6BC0',
      delivered: '#66BB6A',
      cancelled: '#EF5350',
    };
    return colors[status] || '#999';
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderTracking', { orderId: item.orderId })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>#{item.orderId}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        <Text style={styles.itemsLabel}>Items:</Text>
        {item.items.slice(0, 2).map((product, index) => (
          <Text key={index} style={styles.itemText}>
            • {product.name} x {product.quantity}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>
          Total: ${item.totalAmount.toFixed(2)}
        </Text>
        {item.status === 'delivered' && (
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={(e) => {
              e.stopPropagation();
              handleReorder(item.orderId);
            }}
          >
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No orders yet</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.orderId}
        contentContainerStyle={styles.listContainer}
        onRefresh={loadOrders}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderItems: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  reorderButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;
