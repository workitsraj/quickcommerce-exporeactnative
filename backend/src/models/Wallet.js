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
  // Use atomic update to prevent race conditions
  const Wallet = this.constructor;
  const updated = await Wallet.findOneAndUpdate(
    { _id: this._id },
    { $inc: { balance: amount }, updatedAt: new Date() },
    { new: true }
  );
  
  if (!updated) {
    throw new Error('Wallet not found');
  }
  
  const WalletTransaction = require('./WalletTransaction');
  await WalletTransaction.create({
    walletId: updated._id,
    userId: updated.userId,
    type: 'CREDIT',
    amount,
    description,
    referenceId,
    balanceAfter: updated.balance,
  });
  
  // Update current instance
  this.balance = updated.balance;
  this.updatedAt = updated.updatedAt;
  
  return this;
};

walletSchema.methods.deductBalance = async function(amount, description, referenceId) {
  // Use atomic update with condition to prevent race conditions
  const Wallet = this.constructor;
  const updated = await Wallet.findOneAndUpdate(
    { _id: this._id, balance: { $gte: amount } },
    { $inc: { balance: -amount }, updatedAt: new Date() },
    { new: true }
  );
  
  if (!updated) {
    throw new Error('Insufficient wallet balance');
  }
  
  const WalletTransaction = require('./WalletTransaction');
  await WalletTransaction.create({
    walletId: updated._id,
    userId: updated.userId,
    type: 'DEBIT',
    amount,
    description,
    referenceId,
    balanceAfter: updated.balance,
  });
  
  // Update current instance
  this.balance = updated.balance;
  this.updatedAt = updated.updatedAt;
  
  return this;
};

module.exports = mongoose.model('Wallet', walletSchema);
