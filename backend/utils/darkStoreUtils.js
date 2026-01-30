const DarkStore = require('../models/DarkStore');

/**
 * Find nearest dark store with available inventory
 * @param {Number} latitude - Customer latitude
 * @param {Number} longitude - Customer longitude
 * @param {Array} items - Order items to check inventory
 * @returns {Object} - Dark store object or null
 */
const findNearestDarkStore = async (latitude, longitude, items) => {
  try {
    // Find dark stores near the location (within 50km)
    const darkStores = await DarkStore.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 50000 // 50km in meters
        }
      }
    }).populate('inventory.productId');
    
    // Find first dark store that can fulfill the order
    for (let store of darkStores) {
      if (store.canFulfillOrder(items)) {
        return store;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding nearest dark store:', error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Number} lat1 - Latitude 1
 * @param {Number} lon1 - Longitude 1
 * @param {Number} lat2 - Latitude 2
 * @param {Number} lon2 - Longitude 2
 * @returns {Number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

module.exports = {
  findNearestDarkStore,
  calculateDistance
};
