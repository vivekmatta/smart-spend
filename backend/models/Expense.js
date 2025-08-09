const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  merchant: {
    type: String,
    required: [true, 'Merchant is required'],
    trim: true,
    maxlength: [100, 'Merchant name cannot exceed 100 characters']
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
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, merchant: 1 });

// Virtual for formatted date
expenseSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

module.exports = mongoose.model('Expense', expenseSchema);
