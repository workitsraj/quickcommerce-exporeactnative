import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import paymentService from '../services/paymentService';

const TransactionHistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const loadTransactions = async (isRefresh = false) => {
    try {
      const skip = isRefresh ? 0 : transactions.length;
      const result = await paymentService.getTransactionHistory(20, skip);
      
      if (isRefresh) {
        setTransactions(result.data.transactions);
      } else {
        setTransactions([...transactions, ...result.data.transactions]);
      }
      
      setHasMore(result.data.hasMore);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions: ' + error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions(true);
  };

  const handleRetry = async (transaction) => {
    try {
      Alert.alert(
        'Retry Payment',
        'Do you want to retry this payment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            onPress: async () => {
              try {
                await paymentService.retryPayment(transaction._id);
                Alert.alert('Success', 'Payment retry initiated');
                onRefresh();
              } catch (error) {
                Alert.alert('Error', 'Failed to retry payment: ' + error);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return '#34C759';
      case 'FAILED':
        return '#FF3B30';
      case 'PENDING':
      case 'PROCESSING':
        return '#FF9500';
      case 'REFUNDED':
        return '#5856D6';
      default:
        return '#8E8E93';
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.orderId}>Order #{item.orderId}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>₹{item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Method:</Text>
          <Text style={styles.detailValue}>{item.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gateway:</Text>
          <Text style={styles.detailValue}>{item.paymentGateway}</Text>
        </View>
        {item.cashbackAmount > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cashback:</Text>
            <Text style={[styles.detailValue, styles.cashback]}>
              +₹{item.cashbackAmount.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {item.status === 'FAILED' && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => handleRetry(item)}
        >
          <Text style={styles.retryButtonText}>Retry Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => hasMore && loadTransactions()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginBottom: 0,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  cashback: {
    color: '#34C759',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TransactionHistoryScreen;
