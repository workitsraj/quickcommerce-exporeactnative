const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    deviceId: String,
    deviceType: {
      type: String,
      enum: ['ios', 'android', 'web']
    },
    deviceName: String,
    appVersion: String,
    osVersion: String
  },
  ipAddress: String,
  userAgent: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update last accessed time
sessionSchema.methods.updateAccess = function() {
  this.lastAccessedAt = Date.now();
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);
