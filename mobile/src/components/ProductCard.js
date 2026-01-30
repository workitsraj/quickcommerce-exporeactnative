import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { formatPrice, getDiscountPercentage, getPrimaryImage, getMinPrice } from '../utils/helpers';

const ProductCard = ({ product, onPress }) => {
  const imageUrl = getPrimaryImage(product);
  const minPrice = getMinPrice(product.variants);
  const minVariant = product.variants.find(v => v.price === minPrice);
  const discount = minVariant?.compareAtPrice 
    ? getDiscountPercentage(minVariant.price, minVariant.compareAtPrice)
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      
      {discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}% OFF</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand || 'Generic'}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(minPrice)}</Text>
          {minVariant?.compareAtPrice && (
            <Text style={styles.comparePrice}>
              {formatPrice(minVariant.compareAtPrice)}
            </Text>
          )}
        </View>
        
        {product.rating?.count > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating.average.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({product.rating.count})</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginRight: 8,
  },
  comparePrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#FFA500',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
  },
});

export default ProductCard;
