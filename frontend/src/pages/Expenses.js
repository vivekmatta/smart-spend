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
  Tag
} from 'lucide-react';
import { format } from 'date-fns';

const Expenses = () => {
  const { 
    expenses, 
    loading, 
    pagination, 
    filters, 
    fetchExpenses, 
    deleteExpense, 
    setFilters 
  } = useExpenses();

  const [localFilters, setLocalFilters] = useState({
    month: filters.month || '',
    year: filters.year || 2024,
    category: filters.category || '',
    merchant: filters.merchant || ''
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
      merchant: ''
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
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
            <div key={expense._id} className="card hover:shadow-medium transition-shadow">
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
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Store className="h-4 w-4" />
                            <span>{expense.merchant}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {/* TODO: Implement edit */}}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit expense"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
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
