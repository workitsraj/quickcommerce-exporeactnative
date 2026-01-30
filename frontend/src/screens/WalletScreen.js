import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import walletService from '../services/walletService';

const WalletScreen = ({ navigation }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addingMoney, setAddingMoney] = useState(false);

  const loadWallet = async () => {
    try {
      const result = await walletService.getWallet();
      setWallet(result.data);
    } catch (error) {
      // Wallet doesn't exist, create it
      try {
        const result = await walletService.createWallet();
        setWallet(result.data);
      } catch (createError) {
        Alert.alert('Error', 'Failed to load wallet: ' + createError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWallet();
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addMoneyAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount < 10 || amount > 50000) {
      Alert.alert('Error', 'Amount must be between ₹10 and ₹50,000');
      return;
    }

    setAddingMoney(true);
    try {
      // First initiate payment for adding money to wallet
      // This would typically go through Razorpay/Stripe
      await walletService.addMoney(amount, 'Money added to wallet', 'ADD_MONEY_' + Date.now());
      
      Alert.alert('Success', `₹${amount} added to wallet successfully!`);
      setAddMoneyAmount('');
      loadWallet();
    } catch (error) {
      Alert.alert('Error', 'Failed to add money: ' + error);
    } finally {
      setAddingMoney(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balance}>₹{wallet?.balance.toFixed(2) || '0.00'}</Text>
        <Text style={styles.currency}>{wallet?.currency || 'INR'}</Text>
      </View>

      <View style={styles.addMoneyCard}>
        <Text style={styles.cardTitle}>Add Money to Wallet</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={addMoneyAmount}
          onChangeText={setAddMoneyAmount}
          editable={!addingMoney}
        />
        <TouchableOpacity
          style={[styles.addButton, addingMoney && styles.addButtonDisabled]}
          onPress={handleAddMoney}
          disabled={addingMoney}
        >
          {addingMoney ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>Add Money</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WalletTransactions')}
        >
          <Text style={styles.actionIcon}>📜</Text>
          <Text style={styles.actionText}>Transaction History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PaymentMethods', {
            orderId: 'ORDER_' + Date.now(),
            amount: 100,
          })}
        >
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionText}>Make Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Wallet Features</Text>
        <Text style={styles.infoText}>• Add money via UPI, Cards, Net Banking</Text>
        <Text style={styles.infoText}>• Use wallet for quick payments</Text>
        <Text style={styles.infoText}>• Get instant refunds to wallet</Text>
        <Text style={styles.infoText}>• Earn cashback on purchases</Text>
        <Text style={styles.infoText}>• Secure and encrypted transactions</Text>
      </View>
    </ScrollView>
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
  balanceCard: {
    backgroundColor: '#007AFF',
    margin: 15,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 10,
  },
  balance: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currency: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 5,
  },
  addMoneyCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#A0C4FF',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default WalletScreen;
