import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import walletService from '../services/walletService';

const WalletTransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const loadTransactions = async (isRefresh = false) => {
    try {
      const skip = isRefresh ? 0 : transactions.length;
      const result = await walletService.getTransactionHistory(20, skip);
      
      if (isRefresh) {
        setTransactions(result.data.transactions);
      } else {
        setTransactions([...transactions, ...result.data.transactions]);
      }
      
      setHasMore(result.data.hasMore);
    } catch (error) {
      console.error('Failed to load transactions:', error);
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

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[styles.typeIndicator, item.type === 'CREDIT' ? styles.credit : styles.debit]}>
          <Text style={styles.typeText}>{item.type === 'CREDIT' ? '↓' : '↑'}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, item.type === 'CREDIT' ? styles.creditAmount : styles.debitAmount]}>
            {item.type === 'CREDIT' ? '+' : '-'}₹{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.balance}>Bal: ₹{item.balanceAfter.toFixed(2)}</Text>
        </View>
      </View>
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
            <Text style={styles.emptyText}>No wallet transactions found</Text>
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
    alignItems: 'center',
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  credit: {
    backgroundColor: '#E8F5E9',
  },
  debit: {
    backgroundColor: '#FFEBEE',
  },
  typeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionInfo: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  creditAmount: {
    color: '#34C759',
  },
  debitAmount: {
    color: '#FF3B30',
  },
  balance: {
    fontSize: 12,
    color: '#666',
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

export default WalletTransactionsScreen;
