const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const Session = require('../models/Session');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Verify phone or email is verified
 */
const requireVerification = (req, res, next) => {
  if (!req.user.isPhoneVerified && !req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your phone number or email to continue'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  requireVerification
};
