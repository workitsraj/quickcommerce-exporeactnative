const logger = require('../config/logger');

// Simple authentication middleware - in production, use proper JWT authentication
const authMiddleware = (req, res, next) => {
  try {
    // For demo purposes, extract userId from header
    // In production, decode JWT token and extract userId
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    req.userId = userId;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

module.exports = authMiddleware;
