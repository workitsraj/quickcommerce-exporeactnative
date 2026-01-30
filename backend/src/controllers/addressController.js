const User = require('../models/User');

/**
 * Get All Addresses
 * @route GET /api/addresses
 */
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add New Address
 * @route POST /api/addresses
 */
exports.addAddress = async (req, res) => {
  try {
    const {
      type,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      landmark,
      latitude,
      longitude,
      isDefault
    } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // If this is the first address or isDefault is true, make it default
    if (user.addresses.length === 0 || isDefault) {
      // Set all other addresses to non-default
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    // Add new address
    user.addresses.push({
      type,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country: country || 'India',
      landmark,
      latitude,
      longitude,
      isDefault: user.addresses.length === 0 || isDefault
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update Address
 * @route PUT /api/addresses/:addressId
 */
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updateData = req.body;
    
    const user = await User.findById(req.user._id);
    
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Update address fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'isDefault') {
        address[key] = updateData[key];
      }
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete Address
 * @route DELETE /api/addresses/:addressId
 */
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    const wasDefault = address.isDefault;
    
    // Remove address
    address.remove();
    
    // If deleted address was default, make first address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Set Default Address
 * @route PUT /api/addresses/:addressId/default
 */
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Set all addresses to non-default
    user.addresses.forEach(addr => addr.isDefault = false);
    
    // Set selected address as default
    address.isDefault = true;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
