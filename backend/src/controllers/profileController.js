const User = require('../models/User');
const { uploadToS3, deleteFromS3 } = require('../services/s3Service');

/**
 * Get User Profile
 * @route GET /api/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update User Profile
 * @route PUT /api/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email && email !== req.user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      updateData.email = email;
      updateData.isEmailVerified = false;
    }
    if (phone && phone !== req.user.phone) {
      // Check if phone is already taken
      const existingUser = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already in use'
        });
      }
      updateData.phone = phone;
      updateData.isPhoneVerified = false;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Upload Profile Picture
 * @route POST /api/profile/upload-picture
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Delete old profile picture if exists
    if (req.user.profilePicture) {
      await deleteFromS3(req.user.profilePicture);
    }
    
    // Upload new picture to S3
    const imageUrl = await uploadToS3(req.file, 'profile-pictures');
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: imageUrl },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete Profile Picture
 * @route DELETE /api/profile/picture
 */
exports.deleteProfilePicture = async (req, res) => {
  try {
    if (req.user.profilePicture) {
      await deleteFromS3(req.user.profilePicture);
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: null },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update Password
 * @route PUT /api/profile/password
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete Account
 * @route DELETE /api/profile
 */
exports.deleteAccount = async (req, res) => {
  try {
    // Soft delete - deactivate account
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    
    // Delete profile picture from S3
    if (req.user.profilePicture) {
      await deleteFromS3(req.user.profilePicture);
    }
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update Delivery Partner Vehicle Info
 * @route PUT /api/profile/vehicle-info
 */
exports.updateVehicleInfo = async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({
        success: false,
        message: 'Only delivery partners can update vehicle info'
      });
    }
    
    const { type, number, model } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        vehicleInfo: { type, number, model }
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Vehicle info updated successfully',
      data: user.vehicleInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Toggle Delivery Partner Availability
 * @route PUT /api/profile/availability
 */
exports.toggleAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({
        success: false,
        message: 'Only delivery partners can update availability'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isAvailable: !req.user.isAvailable },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `Availability set to ${user.isAvailable ? 'available' : 'unavailable'}`,
      data: {
        isAvailable: user.isAvailable
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
