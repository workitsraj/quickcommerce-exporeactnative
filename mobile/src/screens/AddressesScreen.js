import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, ADDRESS_TYPES } from '../constants';
import * as authService from '../services/authService';

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await authService.getAddresses();
      setAddresses(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  const handleSetDefault = async (addressId) => {
    try {
      await authService.setDefaultAddress(addressId);
      fetchAddresses();
      Alert.alert('Success', 'Default address updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default address');
    }
  };

  const handleDelete = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAddress(addressId);
              fetchAddresses();
              Alert.alert('Success', 'Address deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const renderAddress = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditAddress', { address: item })}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.addressLine}>{item.addressLine1}</Text>
      {item.addressLine2 && (
        <Text style={styles.addressLine}>{item.addressLine2}</Text>
      )}
      {item.landmark && (
        <Text style={styles.landmark}>Landmark: {item.landmark}</Text>
      )}
      <Text style={styles.addressLine}>
        {item.city}, {item.state} - {item.pincode}
      </Text>

      <View style={styles.actions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item._id)}
          >
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item._id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No addresses found</Text>
            <Text style={styles.emptySubtext}>Add your first address</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAddress')}
      >
        <Text style={styles.addButtonText}>+ Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  defaultBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  defaultBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  editText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  addressLine: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 5,
  },
  landmark: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.gray,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressesScreen;
