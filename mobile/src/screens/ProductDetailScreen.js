import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { productsAPI, inventoryAPI } from '../services/api';
import { formatPrice, getDiscountPercentage, getPrimaryImage } from '../utils/helpers';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
    loadRecommendations();
  }, [productId]);

  useEffect(() => {
    if (selectedVariant) {
      checkAvailability();
    }
  }, [selectedVariant]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(productId);
      setProduct(response.data.data);
      
      if (response.data.data.variants.length > 0) {
        setSelectedVariant(response.data.data.variants[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await productsAPI.getRecommendations(productId, 5);
      setRecommendations(response.data.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const checkAvailability = async () => {
    if (!selectedVariant) return;
    
    try {
      const response = await inventoryAPI.checkAvailability({
        product: productId,
        variantSku: selectedVariant.sku,
        darkStore: 'Store-001', // Default store - should come from user location
        quantity: 1,
      });
      setAvailability(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const imageUrl = getPrimaryImage(product);
  const discount = selectedVariant?.compareAtPrice
    ? getDiscountPercentage(selectedVariant.price, selectedVariant.compareAtPrice)
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Product Images */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.brand}>{product.brand || 'Generic'}</Text>
        <Text style={styles.name}>{product.name}</Text>
        
        {product.shortDescription && (
          <Text style={styles.shortDescription}>{product.shortDescription}</Text>
        )}

        {/* Rating */}
        {product.rating?.count > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating.average.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({product.rating.count} reviews)</Text>
          </View>
        )}

        {/* Variant Selection */}
        {product.variants.length > 1 && (
          <View style={styles.variantsContainer}>
            <Text style={styles.sectionTitle}>Select Variant:</Text>
            <View style={styles.variantButtons}>
              {product.variants.map((variant) => (
                <TouchableOpacity
                  key={variant.sku}
                  style={[
                    styles.variantButton,
                    selectedVariant?.sku === variant.sku && styles.variantButtonActive
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                >
                  <Text style={[
                    styles.variantButtonText,
                    selectedVariant?.sku === variant.sku && styles.variantButtonTextActive
                  ]}>
                    {variant.name}
                  </Text>
                  {variant.weight && (
                    <Text style={[
                      styles.variantWeight,
                      selectedVariant?.sku === variant.sku && styles.variantWeightActive
                    ]}>
                      {variant.weight.value}{variant.weight.unit}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Price and Availability */}
        <View style={styles.priceSection}>
          <View>
            <Text style={styles.price}>{formatPrice(selectedVariant?.price || 0)}</Text>
            {selectedVariant?.compareAtPrice && (
              <Text style={styles.comparePrice}>
                MRP: {formatPrice(selectedVariant.compareAtPrice)}
              </Text>
            )}
          </View>
          
          {availability && (
            <View style={styles.availabilityContainer}>
              {availability.available ? (
                <>
                  <Text style={styles.inStock}>✓ In Stock</Text>
                  {availability.isLowStock && (
                    <Text style={styles.lowStock}>Only {availability.quantity} left!</Text>
                  )}
                </>
              ) : (
                <Text style={styles.outOfStock}>Out of Stock</Text>
              )}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Nutrition Info */}
        {product.nutrition && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Information</Text>
            {product.nutrition.servingSize && (
              <Text style={styles.nutritionText}>
                Serving Size: {product.nutrition.servingSize}
              </Text>
            )}
            {product.nutrition.calories && (
              <Text style={styles.nutritionText}>
                Calories: {product.nutrition.calories}
              </Text>
            )}
            {product.nutrition.ingredients && product.nutrition.ingredients.length > 0 && (
              <>
                <Text style={styles.nutritionLabel}>Ingredients:</Text>
                <Text style={styles.nutritionText}>
                  {product.nutrition.ingredients.join(', ')}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {product.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>You May Also Like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommendations.map((item) => (
              <View key={item._id} style={styles.recommendationCard}>
                <ProductCard
                  product={item}
                  onPress={() => navigation.push('ProductDetail', { productId: item._id })}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (!availability?.available) && styles.addToCartButtonDisabled
          ]}
          disabled={!availability?.available}
        >
          <Text style={styles.addToCartButtonText}>
            {availability?.available ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    color: '#FFA500',
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  variantsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  variantButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  variantButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
  },
  variantButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  variantButtonText: {
    fontSize: 14,
    color: '#666',
  },
  variantButtonTextActive: {
    color: '#fff',
  },
  variantWeight: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  variantWeightActive: {
    color: '#fff',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  comparePrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  availabilityContainer: {
    alignItems: 'flex-end',
  },
  inStock: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  lowStock: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 2,
  },
  outOfStock: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nutritionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#2E7D32',
  },
  recommendationsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  recommendationCard: {
    width: 200,
    marginRight: 12,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
