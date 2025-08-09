import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ExpenseContext = createContext();

const initialState = {
  expenses: [],
  loading: false,
  error: null,
  filters: {
    month: null,
    year: 2024,
    category: '',
    merchant: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  summary: {
    categories: [],
    trends: [],
  },
};

const expenseReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_EXPENSES':
      return { 
        ...state, 
        expenses: action.payload.expenses,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
        loading: false,
        error: null
      };
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense._id === action.payload._id ? action.payload : expense
        ),
        loading: false,
        error: null
      };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense._id !== action.payload),
        loading: false,
        error: null
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 }
      };
    
    case 'SET_SUMMARY':
      return {
        ...state,
        summary: { ...state.summary, ...action.payload },
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
};

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // API base URL
  const API_BASE = '/api';

  // Fetch expenses with filters (memoized to keep stable identity)
  const fetchExpenses = useCallback(
    async (filters, page = 1) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(state.pagination.itemsPerPage));

        if (filters?.year) params.append('year', String(filters.year));
        if (filters?.month) params.append('month', String(filters.month));
        if (filters?.category) params.append('category', String(filters.category));
        if (filters?.merchant) params.append('merchant', String(filters.merchant));

        const response = await axios.get(`${API_BASE}/expenses?${params}`);
        dispatch({ type: 'SET_EXPENSES', payload: response.data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch expenses' });
        toast.error('Failed to fetch expenses');
      }
    },
    // Keep dependencies minimal so the function identity is stable across renders
    [API_BASE, state.pagination.itemsPerPage]
  );

  // Add new expense
  const addExpense = async (expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post(`${API_BASE}/expenses`, expenseData);
      dispatch({ type: 'ADD_EXPENSE', payload: response.data });
      toast.success('Expense added successfully!');
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
      toast.error('Failed to add expense');
      throw error;
    }
  };

  // Update expense
  const updateExpense = async (id, expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.put(`${API_BASE}/expenses/${id}`, expenseData);
      dispatch({ type: 'UPDATE_EXPENSE', payload: response.data });
      toast.success('Expense updated successfully!');
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
      toast.error('Failed to update expense');
      throw error;
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await axios.delete(`${API_BASE}/expenses/${id}`);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      toast.success('Expense deleted successfully!');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
      toast.error('Failed to delete expense');
      throw error;
    }
  };

  // Fetch summary data
  const fetchSummary = async (month = null, year = undefined) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', String(month));
      if (typeof year === 'number' && !Number.isNaN(year)) {
        params.append('year', String(year));
      }

      const requests = [
        axios.get(`${API_BASE}/expenses/summary/categories?${params.toString()}`),
      ];
      if (typeof year === 'number' && !Number.isNaN(year)) {
        requests.push(axios.get(`${API_BASE}/expenses/summary/trends?year=${year}`));
      } else {
        // If no year, return empty trends
        requests.push(Promise.resolve({ data: [] }));
      }

      const [categoriesResponse, trendsResponse] = await Promise.all(requests);

      dispatch({
        type: 'SET_SUMMARY',
        payload: {
          categories: categoriesResponse.data,
          trends: trendsResponse.data
        }
      });
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  // Categorize expense description
  const categorizeExpense = async (description) => {
    try {
      const response = await axios.post(`${API_BASE}/categorize`, { description });
      return response.data.data;
    } catch (error) {
      console.error('Failed to categorize:', error);
      return { category: 'Other', confidence: 0 };
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Remove duplicate initial fetch here; the `Expenses` page controls fetching
  // to avoid double requests and dependency loops.
  useEffect(() => {
    // No-op; kept for potential future initialization
  }, []);

  const value = {
    ...state,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchSummary,
    categorizeExpense,
    setFilters,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};