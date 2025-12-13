const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  itemId: {
    type: String,
    required: true,
    index: true
  },
  itemType: {
    type: String,
    required: true,
    enum: ['article', 'book'],
    default: 'article'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'test']
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'no_payment_required'],
    default: 'unpaid'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
transactionSchema.index({ userEmail: 1, createdAt: -1 });
transactionSchema.index({ itemId: 1, itemType: 1 });
transactionSchema.index({ paymentMethod: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;