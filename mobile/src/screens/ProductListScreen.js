import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('created');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts(true);
  }, [selectedCategory, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll({ parent: 'null', level: 0 });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async (reset = false) => {
    if (loading && !reset) return;
    
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      
      const params = {
        page: currentPage,
        limit: 20,
        sortBy,
        order: 'desc',
      };
      
      if (selectedCategory) {
        params.category = selectedCategory._id;
      }
      
      const response = await productsAPI.getAll(params);
      
      if (reset) {
        setProducts(response.data.data);
        setPage(1);
      } else {
        setProducts(prev => [...prev, ...response.data.data]);
      }
      
      setHasMore(response.data.page < response.data.pages);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts(true);
  }, [selectedCategory, sortBy]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadProducts();
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setProducts([]);
    setPage(1);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Products</Text>
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.sortButtonText}>🔍 Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const sorts = ['created', 'popularity', 'rating', 'price'];
            const currentIndex = sorts.indexOf(sortBy);
            const nextSort = sorts[(currentIndex + 1) % sorts.length];
            setSortBy(nextSort);
          }}
        >
          <Text style={styles.sortButtonText}>
            Sort: {sortBy === 'created' ? 'Newest' : 
                   sortBy === 'popularity' ? 'Popular' :
                   sortBy === 'rating' ? 'Rating' : 'Price'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={handleProductPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    paddingVertical: 20,
  },
});

export default ProductListScreen;
