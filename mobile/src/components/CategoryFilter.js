import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.categoryButtonActive
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Text style={[
            styles.categoryText,
            !selectedCategory && styles.categoryTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category._id}
            style={[
              styles.categoryButton,
              selectedCategory?._id === category._id && styles.categoryButtonActive
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory?._id === category._id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
});

export default CategoryFilter;
