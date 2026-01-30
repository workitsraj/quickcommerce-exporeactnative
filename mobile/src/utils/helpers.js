export const formatPrice = (price) => {
  return `₹${price.toFixed(2)}`;
};

export const getDiscountPercentage = (price, compareAtPrice) => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

export const getPrimaryImage = (product) => {
  if (!product.images || product.images.length === 0) {
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }
  
  const primary = product.images.find(img => img.isPrimary);
  return primary ? primary.url : product.images[0].url;
};

export const getMinPrice = (variants) => {
  if (!variants || variants.length === 0) return 0;
  return Math.min(...variants.map(v => v.price));
};

export const getMaxPrice = (variants) => {
  if (!variants || variants.length === 0) return 0;
  return Math.max(...variants.map(v => v.price));
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
