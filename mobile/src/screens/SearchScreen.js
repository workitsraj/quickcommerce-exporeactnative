import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { productsAPI } from '../services/api';
import { debounce } from '../utils/helpers';
import ProductCard from '../components/ProductCard';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState(null);

  const searchProducts = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      setSearchTime(null);
      return;
    }

    try {
      setLoading(true);
      const startTime = Date.now();
      const response = await productsAPI.search(searchQuery);
      const endTime = Date.now();
      
      setResults(response.data.data);
      setSearchTime(endTime - startTime);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchProducts, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {searchTime !== null && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            Found {results.length} results in {searchTime}ms
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}

      {!loading && query.length > 0 && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>
            Try searching with different keywords
          </Text>
        </View>
      )}

      {!loading && query.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔍</Text>
          <Text style={styles.emptySubtext}>
            Start typing to search for products
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={handleProductPress} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    borderRadius: 20,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 12,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#666',
  },
  searchInfo: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInfoText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
});

export default SearchScreen;
