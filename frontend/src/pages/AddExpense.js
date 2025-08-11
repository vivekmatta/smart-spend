import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useExpenses } from '../contexts/ExpenseContext';
import { 
  Save, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Store, 
  FileText,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

const AddExpense = () => {
  const navigate = useNavigate();
  const { addExpense, addSubscription, categorizeExpense } = useExpenses();
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [categorizedCategory, setCategorizedCategory] = useState('');
  const [categorizationConfidence, setCategorizationConfidence] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      amount: '',
      description: '',
      merchant: '',
      category: '',
      date: format(new Date(), 'yyyy-MM-dd')
    }
  });

  const description = watch('description');

  // Auto-categorize when description changes
  useEffect(() => {
    const categorizeDescription = async () => {
      if (description && description.length > 3) {
        setIsCategorizing(true);
        try {
          const result = await categorizeExpense(description);
          setCategorizedCategory(result.category);
          setCategorizationConfidence(result.confidence);
          
          // Auto-fill category if confidence is high enough
          if (result.confidence > 0.6) {
            setValue('category', result.category);
          }
        } catch (error) {
          console.error('Categorization failed:', error);
        } finally {
          setIsCategorizing(false);
        }
      } else {
        setCategorizedCategory('');
        setCategorizationConfidence(0);
      }
    };

    const timeoutId = setTimeout(categorizeDescription, 1000);
    return () => clearTimeout(timeoutId);
  }, [description, setValue, categorizeExpense]);

  const onSubmit = async (data) => {
    try {
      if (data.isSubscription) {
        await addSubscription({
          amount: parseFloat(data.amount),
          description: data.description,
          merchant: data.merchant,
          category: data.category,
          subDayOfMonth: data.subDayOfMonth,
          subStartDate: data.subStartDate,
          interval: data.interval,
        });
        // Also save an immediate expense for today so user sees it instantly
        await addExpense({
          amount: parseFloat(data.amount),
          description: `${data.description} (first charge)`,
          merchant: data.merchant,
          category: data.category,
          date: new Date(),
        });
      } else {
        await addExpense({
          ...data,
          amount: parseFloat(data.amount),
          date: new Date(data.date)
        });
      }
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

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'text-success-600';
    if (confidence > 0.6) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getConfidenceText = (confidence) => {
    if (confidence > 0.8) return 'High';
    if (confidence > 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your spending with AI-powered categorization
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
                {isCategorizing && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                  </div>
                )}
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
              )}
              
              {/* AI Categorization Result */}
              {categorizedCategory && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">AI Suggestion:</span>
                    <span className="text-sm text-gray-900">{categorizedCategory}</span>
                    <span className={`text-xs ${getConfidenceColor(categorizationConfidence)}`}>
                      ({getConfidenceText(categorizationConfidence)} confidence: {(categorizationConfidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
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

            {/* Subscription Options */}
            <div className="border-t pt-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('isSubscription')} />
                <span className="text-sm text-gray-700">Make this a subscription</span>
              </label>

              {watch('isSubscription') && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interval</label>
                    <select className="input" defaultValue="monthly" {...register('interval')}> 
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Day of month</label>
                    <input type="number" min="1" max="31" className="input" defaultValue={new Date().getDate()} {...register('subDayOfMonth')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start date</label>
                    <input type="date" className="input" defaultValue={format(new Date(), 'yyyy-MM-dd')} {...register('subStartDate')} />
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
                    Save Expense
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
          <h3 className="text-lg font-semibold text-gray-900">💡 Tips for Better Categorization</h3>
        </div>
        <div className="card-body">
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Be specific in your descriptions (e.g., "Coffee at Starbucks" vs "Coffee")</li>
            <li>• Include the merchant name in the description for better accuracy</li>
            <li>• The AI learns from your corrections - feel free to adjust categories</li>
            <li>• Use consistent naming for similar expenses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
