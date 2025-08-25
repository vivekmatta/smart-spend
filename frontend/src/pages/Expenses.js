import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../contexts/ExpenseContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  DollarSign,
  Store,
  Tag,
  Repeat,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

// Helper function to safely convert Firebase Timestamps to Date objects
const safeFormatDate = (dateValue, formatString = 'MMM dd, yyyy') => {
  try {
    let date;
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      // Firebase Timestamp
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      // Already a Date object
      date = dateValue;
    } else if (dateValue) {
      // String or number, try to create Date
      date = new Date(dateValue);
    } else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error, dateValue);
    return 'Invalid date';
  }
};

// Helper function to get subscription frequency display text
const getSubscriptionFrequencyText = (frequency) => {
  const frequencyMap = {
    'weekly': 'Weekly',
    'biweekly': 'Bi-weekly', 
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'yearly': 'Yearly'
  };
  return frequencyMap[frequency] || frequency;
};

// Helper function to check if subscription is overdue
const isSubscriptionOverdue = (nextDueDate) => {
  if (!nextDueDate) return false;
  const dueDate = nextDueDate.toDate ? nextDueDate.toDate() : new Date(nextDueDate);
  return dueDate < new Date();
};

// Helper function to get days until due
const getDaysUntilDue = (nextDueDate) => {
  if (!nextDueDate) return null;
  const dueDate = nextDueDate.toDate ? nextDueDate.toDate() : new Date(nextDueDate);
  const today = new Date();
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const Expenses = () => {
  const { 
    expenses, 
    loading, 
    pagination, 
    filters, 
    fetchExpenses, 
    deleteExpense, 
    setFilters,
    updateExpense,
    addExpense
  } = useExpenses();

  const [localFilters, setLocalFilters] = useState({
    month: filters.month || '',
    year: filters.year || 2024,
    category: filters.category || '',
    merchant: filters.merchant || '',
    subscriptionType: filters.subscriptionType || ''
  });

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

  useEffect(() => {
    fetchExpenses(filters, pagination.currentPage);
  }, [filters, pagination.currentPage, fetchExpenses]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      month: '',
      year: 2024,
      category: '',
      merchant: '',
      subscriptionType: ''
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  const handleMarkAsPaid = async (expense) => {
    if (!expense.isSubscription) return;
    
    try {
      // Calculate next due date based on frequency
      const currentDueDate = expense.nextDueDate?.toDate ? expense.nextDueDate.toDate() : new Date(expense.nextDueDate);
      let nextDueDate = new Date(currentDueDate);
      
      switch (expense.subscriptionFrequency) {
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'biweekly':
          nextDueDate.setDate(nextDueDate.getDate() + 14);
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          break;
        default:
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }

      // Create a new expense record for the payment
      const newExpense = {
        ...expense,
        date: new Date(),
        nextDueDate: nextDueDate,
        id: undefined // Remove ID so it creates a new document
      };

      // Update the original subscription with new due date
      await updateExpense({
        ...expense,
        nextDueDate: nextDueDate
      });

      // Add the new payment record
      await addExpense(newExpense);
      
      // Refresh the expenses list
      fetchExpenses(filters, pagination.currentPage);
    } catch (error) {
      console.error('Error marking subscription as paid:', error);
    }
  };

  const handleFixOverdueSubscription = async (expense) => {
    if (!expense.isSubscription) return;
    
    try {
      // Calculate a new due date from today based on frequency
      const today = new Date();
      let nextDueDate = new Date(today);
      
      switch (expense.subscriptionFrequency) {
        case 'weekly':
          nextDueDate.setDate(today.getDate() + 7);
          break;
        case 'biweekly':
          nextDueDate.setDate(today.getDate() + 14);
          break;
        case 'monthly':
          nextDueDate.setMonth(today.getMonth() + 1);
          break;
        case 'quarterly':
          nextDueDate.setMonth(today.getMonth() + 3);
          break;
        case 'yearly':
          nextDueDate.setFullYear(today.getFullYear() + 1);
          break;
        default:
          nextDueDate.setMonth(today.getMonth() + 1);
      }

      // Update the subscription with new due date
      await updateExpense({
        ...expense,
        nextDueDate: nextDueDate
      });
      
      // Refresh the expenses list
      fetchExpenses(filters, pagination.currentPage);
    } catch (error) {
      console.error('Error fixing overdue subscription:', error);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchExpenses(filters, page);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Utilities': 'bg-gray-100 text-gray-800',
      'Housing': 'bg-indigo-100 text-indigo-800',
      'Education': 'bg-yellow-100 text-yellow-800',
      'Travel': 'bg-cyan-100 text-cyan-800',
      'Personal Care': 'bg-rose-100 text-rose-800',
      'Insurance': 'bg-emerald-100 text-emerald-800',
      'Investments': 'bg-lime-100 text-lime-800',
      'Other': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your spending history
          </p>
        </div>
        <Link
          to="/add"
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={localFilters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="input"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {format(new Date(2024, month - 1), 'MMMM')}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={localFilters.year}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                className="input"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={localFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
              <input
                type="text"
                value={localFilters.merchant}
                onChange={(e) => handleFilterChange('merchant', e.target.value)}
                className="input"
                placeholder="Search merchants..."
              />
            </div>

            {/* Subscription Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Type</label>
              <select
                value={localFilters.subscriptionType}
                onChange={(e) => handleFilterChange('subscriptionType', e.target.value)}
                className="input"
              >
                <option value="">All Expenses</option>
                <option value="subscription">Subscriptions Only</option>
                <option value="one-time">One-time Expenses Only</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
            <button
              onClick={applyFilters}
              className="btn btn-primary"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {expenses.length} of {pagination.totalItems} expenses
        </p>
        {pagination.totalItems > 0 && (
          <p className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
        )}
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-500">Loading expenses...</span>
            </div>
          </div>
        </div>
      ) : expenses.length > 0 ? (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="card hover:shadow-medium transition-shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-semibold text-gray-900 truncate">
                            {expense.description}
                          </p>
                          <span className={`badge ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                          {expense.isSubscription && (
                            <span className="badge bg-blue-100 text-blue-800 border-blue-200">
                              <Repeat className="h-3 w-3 mr-1" />
                              Subscription
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Store className="h-4 w-4" />
                            <span>{expense.merchant}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{safeFormatDate(expense.date)}</span>
                          </div>
                        </div>
                        
                        {/* Subscription Details */}
                        {expense.isSubscription && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                {getSubscriptionFrequencyText(expense.subscriptionFrequency)} Subscription
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3 text-blue-600" />
                                  <span className="text-blue-700">
                                    Next due: {safeFormatDate(expense.nextDueDate)}
                                  </span>
                                </div>
                                
                                {expense.subscriptionStartDate && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3 text-blue-600" />
                                    <span className="text-blue-700">
                                      Started: {safeFormatDate(expense.subscriptionStartDate)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Subscription Status */}
                              <div className="flex items-center space-x-2">
                                {isSubscriptionOverdue(expense.nextDueDate) ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Overdue
                                  </span>
                                ) : (
                                  (() => {
                                    const daysUntilDue = getDaysUntilDue(expense.nextDueDate);
                                    if (daysUntilDue !== null) {
                                      if (daysUntilDue <= 7) {
                                        return (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Due in {daysUntilDue} days
                                          </span>
                                        );
                                      }
                                    }
                                    return null;
                                  })()
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </p>
                      {expense.isSubscription && (
                        <p className="text-sm text-blue-600 font-medium">
                          {getSubscriptionFrequencyText(expense.subscriptionFrequency)}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                                              {expense.isSubscription && (
                          <>
                            <button
                              onClick={() => handleMarkAsPaid(expense)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Mark subscription as paid"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                            {isSubscriptionOverdue(expense.nextDueDate) && (
                              <button
                                onClick={() => handleFixOverdueSubscription(expense)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Fix overdue subscription date"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      <button
                        onClick={() => {/* TODO: Implement edit */}}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit expense"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.values(localFilters).some(f => f !== '' && f !== new Date().getFullYear()) 
                  ? 'Try adjusting your filters or add a new expense.'
                  : 'Get started by adding your first expense.'
                }
              </p>
              <div className="mt-6">
                <Link
                  to="/add"
                  className="btn btn-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="btn btn-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    page === pagination.currentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="btn btn-secondary"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
