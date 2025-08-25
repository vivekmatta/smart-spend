const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Budget name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Budget type is required'],
    enum: {
      values: ['spending_limit', 'saving_goal'],
      message: 'Budget type must be either spending_limit or saving_goal'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Healthcare',
        'Utilities',
        'Housing',
        'Education',
        'Travel',
        'Personal Care',
        'Insurance',
        'Investments',
        'Other'
      ],
      message: 'Invalid category'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: String,
    default: 'default-user' // For demo purposes, in production use proper auth
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, type: 1 });
budgetSchema.index({ userId: 1, category: 1 });
budgetSchema.index({ userId: 1, endDate: 1 });

// Virtual for progress percentage
budgetSchema.virtual('progressPercentage').get(function() {
  if (this.type === 'spending_limit') {
    return Math.min((this.currentAmount / this.amount) * 100, 100);
  } else {
    return Math.min((this.currentAmount / this.amount) * 100, 100);
  }
});

// Virtual for remaining amount
budgetSchema.virtual('remainingAmount').get(function() {
  if (this.type === 'spending_limit') {
    return Math.max(this.amount - this.currentAmount, 0);
  } else {
    return Math.max(this.amount - this.currentAmount, 0);
  }
});

// Virtual for days remaining
budgetSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
});

// Virtual for formatted start date
budgetSchema.virtual('formattedStartDate').get(function() {
  return this.startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Virtual for formatted end date
budgetSchema.virtual('formattedEndDate').get(function() {
  return this.endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Virtual for formatted amount
budgetSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

// Virtual for formatted current amount
budgetSchema.virtual('formattedCurrentAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.currentAmount);
});

module.exports = mongoose.model('Budget', budgetSchema);
