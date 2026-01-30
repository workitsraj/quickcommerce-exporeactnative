const rateLimit = require('express-rate-limit');

// Rate limiter for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many payment requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for wallet operations
const walletLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many wallet requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for webhook endpoints
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many webhook requests',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  paymentLimiter,
  walletLimiter,
  webhookLimiter,
};
