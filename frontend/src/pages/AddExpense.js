import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useExpenses } from '../contexts/ExpenseContext';
import { 
  Save, 
  Calendar, 
  DollarSign, 
  Store, 
  FileText,
  Loader2,
  Repeat,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const AddExpense = () => {
  const navigate = useNavigate();
  const { addExpense } = useExpenses();
  const [isSubscription, setIsSubscription] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      amount: '',
      description: '',
      merchant: '',
      category: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isSubscription: false,
      subscriptionFrequency: 'monthly'
    }
  });

  const watchedIsSubscription = watch('isSubscription');

  const onSubmit = async (data) => {
    try {
      const expenseData = {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        isSubscription: data.isSubscription || false
      };

      // Add subscription-specific fields if it's a subscription
      if (data.isSubscription) {
        expenseData.subscriptionFrequency = data.subscriptionFrequency;
        expenseData.subscriptionStartDate = new Date(data.date);
        
        // Calculate the next due date based on frequency
        const startDate = new Date(data.date);
        let nextDueDate = new Date(startDate);
        
        switch (data.subscriptionFrequency) {
          case 'weekly':
            nextDueDate.setDate(startDate.getDate() + 7);
            break;
          case 'biweekly':
            nextDueDate.setDate(startDate.getDate() + 14);
            break;
          case 'monthly':
            nextDueDate.setMonth(startDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDueDate.setMonth(startDate.getMonth() + 3);
            break;
          case 'yearly':
            nextDueDate.setFullYear(startDate.getFullYear() + 1);
            break;
          default:
            nextDueDate.setMonth(startDate.getMonth() + 1);
        }
        
        expenseData.nextDueDate = nextDueDate;
      }

      await addExpense(expenseData);
      navigate('/expenses');
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const categories = [
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
  ];

  const subscriptionFrequencies = [
    { value: 'weekly', label: 'Weekly', description: 'Every week' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
    { value: 'monthly', label: 'Monthly', description: 'Every month' },
    { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
    { value: 'yearly', label: 'Yearly', description: 'Every year' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your spending and manage your budget
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  id="amount"
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' }
                  })}
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="description"
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 3, message: 'Description must be at least 3 characters' }
                  })}
                  className="input pl-10"
                  placeholder="e.g., Coffee at Starbucks"
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
              )}
            </div>

            {/* Merchant */}
            <div>
              <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-2">
                Merchant
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="merchant"
                  {...register('merchant', { 
                    required: 'Merchant is required',
                    minLength: { value: 2, message: 'Merchant must be at least 2 characters' }
                  })}
                  className="input pl-10"
                  placeholder="e.g., Starbucks"
                />
              </div>
              {errors.merchant && (
                <p className="mt-1 text-sm text-danger-600">{errors.merchant.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                {...register('category', { required: 'Category is required' })}
                className="input"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  {...register('date', { required: 'Date is required' })}
                  className="input pl-10"
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-danger-600">{errors.date.message}</p>
              )}
            </div>

            {/* Subscription Toggle */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="isSubscription"
                  {...register('isSubscription')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isSubscription" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Repeat className="h-4 w-4 text-primary-600" />
                  <span>This is a recurring subscription</span>
                </label>
              </div>

              {/* Subscription Fields */}
              {watchedIsSubscription && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Subscription Details</span>
                  </div>
                  
                  {/* Frequency */}
                  <div>
                    <label htmlFor="subscriptionFrequency" className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Frequency
                    </label>
                    <select
                      id="subscriptionFrequency"
                      {...register('subscriptionFrequency')}
                      className="input"
                    >
                      {subscriptionFrequencies.map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label} - {freq.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Next Due Date Info */}
                  <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">
                        Next due date will be calculated automatically based on the frequency
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save {watchedIsSubscription ? 'Subscription' : 'Expense'}
                  </>
                  )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">💡 Tips for Better Tracking</h3>
        </div>
        <div className="card-body">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Be specific in your descriptions (e.g., "Coffee at Starbucks" vs "Coffee")</li>
            <li>• Include the merchant name for better organization</li>
            <li>• Use consistent categories for similar expenses</li>
            <li>• Track expenses regularly to stay on top of your budget</li>
            <li>• Mark recurring expenses as subscriptions for better budget planning</li>
            <li>• Set accurate next due dates for subscriptions to avoid late fees</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
