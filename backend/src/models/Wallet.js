const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

walletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

walletSchema.methods.addBalance = async function(amount, description, referenceId) {
  this.balance += amount;
  await this.save();
  
  const WalletTransaction = require('./WalletTransaction');
  await WalletTransaction.create({
    walletId: this._id,
    userId: this.userId,
    type: 'CREDIT',
    amount,
    description,
    referenceId,
    balanceAfter: this.balance,
  });
  
  return this;
};

walletSchema.methods.deductBalance = async function(amount, description, referenceId) {
  if (this.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  
  this.balance -= amount;
  await this.save();
  
  const WalletTransaction = require('./WalletTransaction');
  await WalletTransaction.create({
    walletId: this._id,
    userId: this.userId,
    type: 'DEBIT',
    amount,
    description,
    referenceId,
    balanceAfter: this.balance,
  });
  
  return this;
};

module.exports = mongoose.model('Wallet', walletSchema);
