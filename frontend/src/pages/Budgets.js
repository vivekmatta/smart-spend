import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBudgets } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

// Helper function to safely convert dates
const safeFormatDate = (dateValue, formatString = 'MMM dd, yyyy') => {
  try {
    let date;
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      // Firebase Timestamp (legacy support)
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

const Budgets = () => {
  const { 
    budgets, 
    loading, 
    pagination, 
    filters, 
    fetchBudgets, 
    deleteBudget, 
    setFilters,
    error
  } = useBudgets();

  const { user } = useAuth();

  const [localFilters, setLocalFilters] = useState({
    type: filters.type || '',
    category: filters.category || '',
    isActive: filters.isActive !== undefined ? filters.isActive : true
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

  const budgetTypes = [
    { value: 'spending_limit', label: 'Spending Limit', icon: AlertTriangle, color: 'text-orange-600' },
    { value: 'saving_goal', label: 'Saving Goal', icon: Target, color: 'text-green-600' }
  ];

  useEffect(() => {
    console.log('Budgets page useEffect:', { filters, pagination, user: user?.uid });
    fetchBudgets(filters, pagination.currentPage);
  }, [filters, pagination.currentPage, fetchBudgets, user]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: '',
      category: '',
      isActive: true
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchBudgets(filters, page);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
      } catch (error) {
        console.error('Failed to delete budget:', error);
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

  if (loading && budgets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your spending limits and saving goals
            </p>
          </div>
          <Link
            to="/add-budget"
            className="btn btn-primary mt-4 sm:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Link>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading budgets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your spending limits and saving goals
          </p>
        </div>
        <Link
          to="/add-budget"
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card border-red-200 bg-red-50">
          <div className="card-body">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={localFilters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                {budgetTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
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
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={localFilters.isActive.toString()}
                onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
                className="input"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
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

      {/* Budgets List */}
      {budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const TypeIcon = budgetTypes.find(t => t.value === budget.type)?.icon || AlertTriangle;
            const typeColor = budgetTypes.find(t => t.value === budget.type)?.color || 'text-gray-600';
            
            return (
              <div key={budget._id} className="card hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <TypeIcon className={`h-5 w-5 ${typeColor}`} />
                        <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(budget.category)}`}>
                          {budget.category}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {budget.type === 'spending_limit' ? 'Limit:' : 'Goal:'} {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {budget.type === 'spending_limit' ? 'Spent:' : 'Saved:'} {formatCurrency(budget.currentAmount || 0)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Start: {safeFormatDate(budget.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>End: {safeFormatDate(budget.endDate)}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>
                            {budget.type === 'spending_limit' 
                              ? `${Math.round((budget.currentAmount / budget.amount) * 100)}%`
                              : `${Math.round((budget.currentAmount / budget.amount) * 100)}%`
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              budget.type === 'spending_limit' 
                                ? (budget.currentAmount / budget.amount) > 0.8 
                                  ? 'bg-red-500' 
                                  : (budget.currentAmount / budget.amount) > 0.6 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${Math.min((budget.currentAmount / budget.amount) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {budget.type === 'spending_limit' 
                            ? formatCurrency(budget.amount - (budget.currentAmount || 0))
                            : formatCurrency(budget.amount - (budget.currentAmount || 0))
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {budget.type === 'spending_limit' ? 'Remaining' : 'To Save'}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {/* TODO: Implement edit */}}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Edit budget"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.values(localFilters).some(f => f !== '' && f !== true) 
                  ? 'Try adjusting your filters or create a new budget.'
                  : 'Get started by creating your first budget.'
                }
              </p>
              <div className="mt-6">
                <Link
                  to="/add-budget"
                  className="btn btn-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Budget
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

export default Budgets;
