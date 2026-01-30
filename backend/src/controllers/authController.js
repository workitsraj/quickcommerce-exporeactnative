const User = require('../models/User');
const Session = require('../models/Session');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');
const { sendOTPSMS } = require('../services/smsService');
const crypto = require('crypto');

/**
 * Register User
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer'
    });
    
    // Generate OTP
    const otp = user.generateOTP();
    await user.save();
    
    // Send OTP via email and SMS
    await Promise.all([
      sendOTPEmail(email, name, otp),
      sendOTPSMS(phone, otp)
    ]);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify OTP sent to your email and phone.',
      data: {
        userId: user._id,
        email: user.email,
        phone: user.phone
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
 * Verify OTP
 * @route POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify OTP
    const isValid = user.verifyOTP(otp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Mark as verified
    user.isPhoneVerified = true;
    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    // Create session
    await Session.create({
      user: user._id,
      refreshToken,
      deviceInfo: req.body.deviceInfo,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePicture: user.profilePicture
        },
        accessToken,
        refreshToken
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
 * Resend OTP
 * @route POST /api/auth/resend-otp
 */
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();
    
    // Send OTP
    await Promise.all([
      sendOTPEmail(user.email, user.name, otp),
      sendOTPSMS(user.phone, otp)
    ]);
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Login User
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, phone, password, deviceInfo } = req.body;
    
    // Check if email or phone provided
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }
    
    // Find user
    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    // Create session
    await Session.create({
      user: user._id,
      refreshToken,
      deviceInfo: deviceInfo || {},
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified
        },
        accessToken,
        refreshToken
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
 * Social Login
 * @route POST /api/auth/social-login
 */
exports.socialLogin = async (req, res) => {
  try {
    const { provider, providerId, email, name, profilePicture, deviceInfo } = req.body;
    
    // Check if user exists with this provider
    let user = await User.findOne({
      'socialLogin.provider': provider,
      'socialLogin.providerId': providerId
    });
    
    // If not found, check by email
    if (!user && email) {
      user = await User.findOne({ email });
      
      if (user) {
        // Link social account to existing user
        user.socialLogin = { provider, providerId };
        if (profilePicture) user.profilePicture = profilePicture;
        user.isEmailVerified = true;
        await user.save();
      }
    }
    
    // Create new user if doesn't exist
    if (!user) {
      // Generate unique phone number placeholder
      const phone = `+${Date.now()}`;
      
      user = await User.create({
        name,
        email: email || `${providerId}@${provider}.com`,
        phone,
        profilePicture,
        socialLogin: { provider, providerId },
        isEmailVerified: email ? true : false,
        role: 'customer'
      });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    // Create session
    await Session.create({
      user: user._id,
      refreshToken,
      deviceInfo: deviceInfo || {},
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    res.status(200).json({
      success: true,
      message: 'Social login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePicture: user.profilePicture
        },
        accessToken,
        refreshToken
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
 * Refresh Token
 * @route POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Find session
    const session = await Session.findOne({
      refreshToken,
      isActive: true
    });
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session not found or expired'
      });
    }
    
    // Get user
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated'
      });
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(user._id, user.role);
    
    // Update session last accessed
    await session.updateAccess();
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
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
 * Forgot Password
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    
    // Send email
    await sendPasswordResetEmail(user.email, user.name, resetToken);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Reset Password
 * @route POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    // Invalidate all sessions
    await Session.updateMany(
      { user: user._id },
      { isActive: false }
    );
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Logout
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Invalidate session
      await Session.findOneAndUpdate(
        { refreshToken },
        { isActive: false }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get Active Sessions
 * @route GET /api/auth/sessions
 */
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user._id,
      isActive: true
    }).sort('-lastAccessedAt');
    
    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Revoke Session
 * @route DELETE /api/auth/sessions/:sessionId
 */
exports.revokeSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.sessionId,
        user: req.user._id
      },
      { isActive: false }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
