const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: String,
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  },
  landmark: String,
  latitude: Number,
  longitude: Number,
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: function() {
      return !this.socialLogin;
    },
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'delivery_partner', 'store_manager', 'admin'],
    default: 'customer'
  },
  profilePicture: {
    type: String,
    default: null
  },
  addresses: [addressSchema],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  socialLogin: {
    provider: {
      type: String,
      enum: ['google', 'facebook', 'apple', null],
      default: null
    },
    providerId: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  otp: {
    code: String,
    expiresAt: Date,
    verified: Boolean
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Delivery Partner specific fields
  vehicleInfo: {
    type: {
      type: String,
      enum: ['bike', 'scooter', 'bicycle', 'car']
    },
    number: String,
    model: String
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  // Store Manager specific fields
  assignedStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000),
    verified: false
  };
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(otp) {
  if (!this.otp || !this.otp.code) {
    return false;
  }
  
  if (this.otp.expiresAt < Date.now()) {
    return false;
  }
  
  if (this.otp.code !== otp) {
    return false;
  }
  
  this.otp.verified = true;
  return true;
};

module.exports = mongoose.model('User', userSchema);
