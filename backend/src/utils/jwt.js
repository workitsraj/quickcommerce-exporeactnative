const jwt = require('jsonwebtoken');

/**
 * Generate Access Token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate Password Reset Token
 */
const generateResetToken = () => {
  return jwt.sign(
    { purpose: 'reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateResetToken
};
