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

const BudgetContext = createContext();

const initialState = {
  budgets: [],
  loading: false,
  error: null,
  filters: {
    type: '',
    category: '',
    isActive: true,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  summary: {
    totalBudgets: 0,
    activeBudgets: 0,
    totalAmount: 0,
    totalCurrentAmount: 0,
    byType: {},
    byCategory: {},
  },
};

const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_BUDGETS':
      return { 
        ...state, 
        budgets: action.payload.budgets,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    
    case 'ADD_BUDGET':
      return {
        ...state,
        budgets: [action.payload, ...state.budgets],
        loading: false,
        error: null
      };
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        ),
        loading: false,
        error: null
      };
    
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload),
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

export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const { user } = useAuth();

  // Fetch budgets with filters
  const fetchBudgets = useCallback(async (filters, page = 1) => {
    console.log('🎯 fetchBudgets called with:', { userId: user?.uid, filters, page });
    if (!user?.uid) {
      console.log('🎯 No user ID, returning early');
      return;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Start with the simplest possible query - just userId
      let q = query(
        collection(db, 'budgets'),
        where('userId', '==', user.uid)
      );

      console.log('🎯 Executing simple Firestore query for budgets');
      const querySnapshot = await getDocs(q);
      console.log('🎯 Query result:', { size: querySnapshot.size, docs: querySnapshot.docs.length });
      
      let budgets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply filters in memory to avoid complex Firestore queries
      if (filters?.type) {
        budgets = budgets.filter(budget => budget.type === filters.type);
      }

      if (filters?.category) {
        budgets = budgets.filter(budget => budget.category === filters.category);
      }

      if (filters?.isActive !== undefined) {
        budgets = budgets.filter(budget => budget.isActive === filters.isActive);
      }

      // Sort in memory by creation date (newest first)
      budgets.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bDate - aDate; // Descending order
      });

      console.log('🎯 Processed and filtered budgets:', budgets);

      // Calculate pagination
      const totalItems = budgets.length;
      const totalPages = Math.ceil(totalItems / state.pagination.itemsPerPage);
      const startIndex = (page - 1) * state.pagination.itemsPerPage;
      const endIndex = startIndex + state.pagination.itemsPerPage;
      const paginatedBudgets = budgets.slice(startIndex, endIndex);

      dispatch({
        type: 'SET_BUDGETS',
        payload: {
          budgets: paginatedBudgets,
          pagination: {
            ...state.pagination,
            currentPage: page,
            totalPages,
            totalItems
          }
        }
      });
    } catch (error) {
      console.error('🎯 Error fetching budgets:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch budgets' });
      toast.error('Failed to fetch budgets');
    }
  }, [user?.uid, state.pagination.itemsPerPage]);

  // Add new budget
  const addBudget = useCallback(async (budgetData) => {
    if (!user?.uid) throw new Error('You must be signed in');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const budgetWithMetadata = {
        ...budgetData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'budgets'), budgetWithMetadata);
      const newBudget = { id: docRef.id, ...budgetWithMetadata };

      dispatch({ type: 'ADD_BUDGET', payload: newBudget });
      toast.success('Budget created successfully');
      return newBudget;
    } catch (error) {
      console.error('🎯 Error creating budget:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create budget' });
      toast.error('Failed to create budget');
      throw error;
    }
  }, [user?.uid]);

  // Update existing budget
  const updateBudget = useCallback(async (id, updates) => {
    if (!user?.uid) throw new Error('You must be signed in');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const budgetRef = doc(db, 'budgets', id);
      await updateDoc(budgetRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      const updatedBudget = { id, ...updates };
      dispatch({ type: 'UPDATE_BUDGET', payload: updatedBudget });
      toast.success('Budget updated successfully');
      return updatedBudget;
    } catch (error) {
      console.error('🎯 Error updating budget:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update budget' });
      toast.error('Failed to update budget');
      throw error;
    }
  }, [user?.uid]);

  // Delete budget
  const deleteBudget = useCallback(async (id) => {
    if (!user?.uid) throw new Error('You must be signed in');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      await deleteDoc(doc(db, 'budgets', id));
      dispatch({ type: 'DELETE_BUDGET', payload: id });
      toast.success('Budget deleted successfully');
    } catch (error) {
      console.error('🎯 Error deleting budget:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete budget' });
      toast.error('Failed to delete budget');
      throw error;
    }
  }, [user?.uid]);

  // Fetch summary data for dashboard
  const fetchSummary = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const q = query(
        collection(db, 'budgets'),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const budgets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate summary statistics
      const totalBudgets = budgets.length;
      const activeBudgetsCount = budgets.filter(b => b.isActive).length;
      const activeBudgets = budgets.filter(b => b.isActive);
      const totalAmount = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
      const totalCurrentAmount = budgets.reduce((sum, b) => sum + (b.currentAmount || 0), 0);

      // Group by type
      const byType = {};
      budgets.forEach(budget => {
        const type = budget.type || 'unknown';
        if (!byType[type]) {
          byType[type] = { count: 0, totalAmount: 0, totalCurrentAmount: 0 };
        }
        byType[type].count += 1;
        byType[type].totalAmount += budget.amount || 0;
        byType[type].totalCurrentAmount += budget.currentAmount || 0;
      });

      // Group by category
      const byCategory = {};
      budgets.forEach(budget => {
        const category = budget.category || 'Other';
        if (!byCategory[category]) {
          byCategory[category] = { count: 0, totalAmount: 0, totalCurrentAmount: 0 };
        }
        byCategory[category].count += 1;
        byCategory[category].totalAmount += budget.amount || 0;
        byCategory[category].totalCurrentAmount += budget.currentAmount || 0;
      });

      dispatch({
        type: 'SET_SUMMARY',
        payload: {
          totalBudgets,
          activeBudgetsCount,
          activeBudgets,
          totalAmount,
          totalCurrentAmount,
          byType,
          byCategory
        }
      });
    } catch (error) {
      console.error('🎯 Error fetching budget summary:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch budget summary' });
      toast.error('Failed to fetch budget summary');
    }
  }, [user?.uid]);

  // Initial data fetch
  useEffect(() => {
    console.log('🎯 BudgetContext useEffect triggered:', { userId: user?.uid, filters: state.filters });
    if (user?.uid) {
      console.log('🎯 Calling fetchBudgets and fetchSummary...');
      fetchBudgets(state.filters);
      fetchSummary();
    } else {
      console.log('🎯 No user ID, skipping fetch');
    }
  }, [user?.uid, state.filters, fetchBudgets, fetchSummary]);

  const value = {
    ...state,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    fetchSummary,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};
