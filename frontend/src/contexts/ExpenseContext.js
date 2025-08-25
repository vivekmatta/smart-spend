import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ExpenseContext = createContext();

const initialState = {
  expenses: [],
  loading: false,
  error: null,
  filters: {
    month: null,
    year: new Date().getFullYear(),
    category: '',
    merchant: '',
    subscriptionType: '',
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
          expense.id === action.payload.id ? action.payload : expense
        ),
        loading: false,
        error: null
      };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
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
  const { user } = useAuth();

  // Fetch expenses with filters
  const fetchExpenses = useCallback(async (filters, page = 1) => {
    console.log('💰 fetchExpenses called with:', { userId: user?.uid, filters, page });
    if (!user?.uid) {
      console.log('💰 No user ID, returning early');
      return;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Start with the simplest possible query - just userId
      let q = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );

      console.log('💰 Executing simple Firestore query for expenses');
      const querySnapshot = await getDocs(q);
      console.log('💰 Query result:', { size: querySnapshot.size, docs: querySnapshot.docs.length });
      
      let expenses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply filters in memory to avoid complex Firestore queries
      if (filters?.month !== null && filters?.month !== undefined) {
        expenses = expenses.filter(expense => {
          const expenseDate = expense.date?.toDate ? expense.date.toDate() : new Date(expense.date);
          const startOfMonth = new Date(filters.year, filters.month, 1);
          const endOfMonth = new Date(filters.year, filters.month + 1, 0);
          return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
        });
      } else if (filters?.year) {
        expenses = expenses.filter(expense => {
          const expenseDate = expense.date?.toDate ? expense.date.toDate() : new Date(expense.date);
          const startOfYear = new Date(filters.year, 0, 1);
          const endOfYear = new Date(filters.year, 11, 31);
          return expenseDate >= startOfYear && expenseDate <= endOfYear;
        });
      }

      if (filters?.category) {
        expenses = expenses.filter(expense => expense.category === filters.category);
      }

      if (filters?.merchant) {
        expenses = expenses.filter(expense => 
          expense.merchant && expense.merchant.toLowerCase().includes(filters.merchant.toLowerCase())
        );
      }

      // Apply subscription type filter
      if (filters?.subscriptionType) {
        if (filters.subscriptionType === 'subscription') {
          expenses = expenses.filter(expense => expense.isSubscription === true);
        } else if (filters.subscriptionType === 'one-time') {
          expenses = expenses.filter(expense => expense.isSubscription !== true);
        }
      }

      // Sort in memory by date (newest first)
      expenses.sort((a, b) => {
        const aDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return bDate - aDate; // Descending order
      });

      console.log('💰 Processed and filtered expenses:', expenses);

      // Calculate pagination
      const totalItems = expenses.length;
      const totalPages = Math.ceil(totalItems / state.pagination.itemsPerPage);
      const startIndex = (page - 1) * state.pagination.itemsPerPage;
      const endIndex = startIndex + state.pagination.itemsPerPage;
      const paginatedExpenses = expenses.slice(startIndex, endIndex);

      dispatch({
        type: 'SET_EXPENSES',
        payload: {
          expenses: paginatedExpenses,
          pagination: {
            ...state.pagination,
            currentPage: page,
            totalPages,
            totalItems
          }
        }
      });
    } catch (error) {
      console.error('💰 Error fetching expenses:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch expenses' });
      toast.error('Failed to fetch expenses');
    }
  }, [user?.uid, state.pagination.itemsPerPage]);

  // Add new expense
  const addExpense = useCallback(async (expenseData) => {
    if (!user?.uid) throw new Error('You must be signed in');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const expenseWithMetadata = {
        ...expenseData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'expenses'), expenseWithMetadata);
      const newExpense = { id: docRef.id, ...expenseWithMetadata };

      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      toast.success('Expense added successfully');
      return newExpense;
    } catch (error) {
      console.error('💰 Error adding expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
      toast.error('Failed to add expense');
      throw error;
    }
  }, [user?.uid]);

  // Update existing expense
  const updateExpense = useCallback(async (id, updates) => {
    if (!user?.uid) throw new Error('You must be signed in');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const expenseRef = doc(db, 'expenses', id);
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      const updatedExpense = { id, ...updates };
      dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
      toast.success('Expense updated successfully');
      return updatedExpense;
    } catch (error) {
      console.error('💰 Error updating expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
      toast.error('Failed to update expense');
      throw error;
    }
  }, [user?.uid]);

  // Delete expense
  const deleteExpense = useCallback(async (id) => {
    if (!user?.uid) throw new Error('You must be signed in');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await deleteDoc(doc(db, 'expenses', id));
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      toast.success('Expense deleted successfully');
    } catch (error) {
      console.error('💰 Error deleting expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
      toast.error('Failed to delete expense');
      throw error;
    }
  }, [user?.uid]);

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const expenses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Process categories
      const categoryMap = {};
      expenses.forEach(expense => {
        const category = expense.category || 'Other';
        if (!categoryMap[category]) {
          categoryMap[category] = { total: 0, count: 0 };
        }
        categoryMap[category].total += expense.amount || 0;
        categoryMap[category].count += 1;
      });

      const categories = Object.entries(categoryMap).map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count
      })).sort((a, b) => b.total - a.total);

      // Process trends (monthly totals for current year)
      const currentYear = new Date().getFullYear();
      const monthlyTotals = new Array(12).fill(0);
      
      expenses.forEach(expense => {
        const expenseDate = expense.date?.toDate ? expense.date.toDate() : new Date(expense.date);
        if (expenseDate.getFullYear() === currentYear) {
          monthlyTotals[expenseDate.getMonth()] += expense.amount || 0;
        }
      });

      const trends = monthlyTotals.map((total, month) => ({
        month: month + 1,
        total
      }));

      dispatch({
        type: 'SET_SUMMARY',
        payload: { categories, trends }
      });
    } catch (error) {
      console.error('💰 Error fetching summary:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch summary' });
      toast.error('Failed to fetch summary');
    }
  }, [user?.uid]);

  // Initial data fetch
  useEffect(() => {
    console.log('💰 ExpenseContext useEffect triggered:', { userId: user?.uid, filters: state.filters });
    if (user?.uid) {
      console.log('💰 Calling fetchExpenses and fetchSummary...');
      fetchExpenses(state.filters);
      fetchSummary();
    } else {
      console.log('💰 No user ID, skipping fetch');
    }
  }, [user?.uid, state.filters, fetchExpenses, fetchSummary]);

  const value = {
    ...state,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchSummary,
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