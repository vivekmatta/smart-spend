import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  query as fsQuery,
  where,
  orderBy,
  getDocs,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
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

  // Generate a per-device user id (no-auth demo). For real privacy, enable Firebase Auth.
  const getOrInitUserId = () => {
    try {
      const key = 'ss_user_id';
      let id = localStorage.getItem(key);
      if (!id) {
        id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(key, id);
      }
      return id;
    } catch {
      return 'default-user';
    }
  };
  const currentUserId = getOrInitUserId();

  // Fetch expenses with filters (memoized to keep stable identity)
  const fetchExpenses = useCallback(
    async (filters, page = 1) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const itemsPerPage = state.pagination.itemsPerPage;
        const constraints = [where('userId', '==', currentUserId)];
        // Date range
        if (filters?.year) {
          const year = Number(filters.year);
          const month = filters?.month ? Number(filters.month) : null;
          if (month) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59, 999);
            constraints.push(where('date', '>=', start));
            constraints.push(where('date', '<=', end));
          } else {
            const start = new Date(year, 0, 1);
            const end = new Date(year, 11, 31, 23, 59, 59, 999);
            constraints.push(where('date', '>=', start));
            constraints.push(where('date', '<=', end));
          }
        }
        if (filters?.category) constraints.push(where('category', '==', filters.category));
        if (filters?.merchant) constraints.push(where('merchant', '>=', filters.merchant), where('merchant', '<=', filters.merchant + '\uf8ff'));

        const q = fsQuery(collection(db, 'expenses'), ...constraints, orderBy('date', 'desc'));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ _id: d.id, ...d.data() }));

        // Client-side pagination for simplicity
        const totalItems = all.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
        const startIdx = (page - 1) * itemsPerPage;
        const pageItems = all.slice(startIdx, startIdx + itemsPerPage);

        dispatch({
          type: 'SET_EXPENSES',
          payload: {
            expenses: pageItems,
            pagination: { currentPage: page, totalPages, totalItems, itemsPerPage },
          },
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch expenses' });
        toast.error('Failed to fetch expenses');
      }
    },
    // Keep dependencies minimal so the function identity is stable across renders
    [state.pagination.itemsPerPage]
  );

  // Add new expense
  const addExpense = async (expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const payload = {
        amount: Number(expenseData.amount),
        description: expenseData.description,
        date: new Date(expenseData.date || Date.now()),
        merchant: expenseData.merchant,
        category: expenseData.category,
        userId: currentUserId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, 'expenses'), payload);
      const created = { _id: ref.id, ...payload };
      dispatch({ type: 'ADD_EXPENSE', payload: created });
      toast.success('Expense added successfully!');
      return created;
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

      const ref = doc(db, 'expenses', id);
      const payload = {
        ...expenseData,
        amount: expenseData.amount !== undefined ? Number(expenseData.amount) : undefined,
        date: expenseData.date ? new Date(expenseData.date) : undefined,
        updatedAt: serverTimestamp(),
      };
      // Remove undefined fields
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
      await updateDoc(ref, payload);
      const merged = { _id: id, ...expenseData };
      dispatch({ type: 'UPDATE_EXPENSE', payload: merged });
      toast.success('Expense updated successfully!');
      return merged;
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
      await deleteDoc(doc(db, 'expenses', id));
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      toast.success('Expense deleted successfully!');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
      toast.error('Failed to delete expense');
      throw error;
    }
  };

  // --- Subscriptions ---
  const addSubscription = async (subData) => {
    const now = new Date();
    const start = subData.subStartDate ? new Date(subData.subStartDate) : now;
    const interval = subData.interval || 'monthly'; // 'monthly' | 'weekly' | 'yearly'
    const dayOfMonth = Number(subData.subDayOfMonth) || start.getDate();

    // Compute first nextChargeAt based on interval
    let nextChargeAt = new Date(start);
    if (interval === 'monthly') {
      // Clamp to chosen day in the month of start
      const year = start.getFullYear();
      const monthIdx = start.getMonth();
      const last = new Date(year, monthIdx + 1, 0).getDate();
      const day = Math.min(dayOfMonth, last);
      nextChargeAt = new Date(year, monthIdx, day);
      // If that day already passed earlier today, roll to next month
      if (nextChargeAt < now) {
        const nextMonthLast = new Date(year, monthIdx + 2, 0).getDate();
        const nextDay = Math.min(dayOfMonth, nextMonthLast);
        nextChargeAt = new Date(year, monthIdx + 1, nextDay);
      }
    } else if (interval === 'yearly') {
      const year = start.getFullYear();
      const monthIdx = start.getMonth();
      const last = new Date(year, monthIdx + 1, 0).getDate();
      const day = Math.min(dayOfMonth, last);
      nextChargeAt = new Date(year, monthIdx, day);
      if (nextChargeAt < now) {
        const nextYearLast = new Date(year + 1, monthIdx + 1, 0).getDate();
        const nextDay = Math.min(dayOfMonth, nextYearLast);
        nextChargeAt = new Date(year + 1, monthIdx, nextDay);
      }
    } else if (interval === 'weekly') {
      // If in the past, roll forward to the next 7-day boundary
      while (nextChargeAt < now) {
        nextChargeAt = new Date(nextChargeAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
    }

    const payload = {
      userId: 'default-user',
      merchant: subData.merchant,
      amount: Number(subData.amount),
      category: subData.category,
      interval,
      dayOfMonth,
      startDate: start,
      nextChargeAt,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'subscriptions'), payload);
    toast.success('Subscription created');
  };

  const cancelSubscription = async (id) => {
    await updateDoc(doc(db, 'subscriptions', id), { active: false, updatedAt: serverTimestamp() });
    toast.success('Subscription cancelled');
  };

  const runSubscriptionGenerator = async () => {
    try {
      const now = new Date();
      const q = fsQuery(
        collection(db, 'subscriptions'),
        where('active', '==', true),
        where('nextChargeAt', '<=', now),
        orderBy('nextChargeAt', 'asc')
      );
      const snap = await getDocs(q);
      const subs = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
      for (const sub of subs) {
        // Process multiple periods if needed
        let iterNext = sub.nextChargeAt instanceof Date ? sub.nextChargeAt : new Date(sub.nextChargeAt.seconds ? sub.nextChargeAt.seconds * 1000 : sub.nextChargeAt);
        const dayOfMonth = sub.dayOfMonth || new Date(iterNext).getDate();
        const interval = sub.interval || 'monthly';
        while (iterNext <= now) {
          const iso = new Date(iterNext).toISOString().slice(0,10); // YYYY-MM-DD
          const expenseId = `${sub._id}_${iso}`;
      const expenseData = {
            _id: expenseId,
            subscriptionId: sub._id,
            generated: true,
            period: iso,
        userId: currentUserId,
            merchant: sub.merchant,
            amount: Number(sub.amount || 0),
            category: sub.category || 'Other',
            date: iterNext,
            description: `Subscription: ${sub.merchant}`,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'expenses', expenseId), expenseData, { merge: false }).catch(() => {});

          // Advance next date
          if (interval === 'weekly') {
            iterNext = new Date(iterNext.getTime() + 7 * 24 * 60 * 60 * 1000);
          } else if (interval === 'yearly') {
            const y = iterNext.getFullYear();
            const m = iterNext.getMonth();
            const last = new Date(y + 1, m + 1, 0).getDate();
            const day = Math.min(dayOfMonth, last);
            iterNext = new Date(y + 1, m, day);
          } else { // monthly default
            const y = iterNext.getFullYear();
            const m = iterNext.getMonth();
            const last = new Date(y, m + 2, 0).getDate();
            const day = Math.min(dayOfMonth, last);
            iterNext = new Date(y, m + 1, day);
          }
        }
        await updateDoc(doc(db, 'subscriptions', sub._id), { nextChargeAt: iterNext, updatedAt: serverTimestamp() });
      }
    } catch (e) {
      console.error('Subscription generator failed', e);
    }
  };

  // Fetch summary data
  const fetchSummary = async (month = null, year = undefined) => {
    try {
      // Load matching expenses, then aggregate client-side
      const userId = 'default-user';
      const constraints = [where('userId', '==', userId)];
      if (year) {
        if (month) {
          const start = new Date(year, month - 1, 1);
          const end = new Date(year, month, 0, 23, 59, 59, 999);
          constraints.push(where('date', '>=', start));
          constraints.push(where('date', '<=', end));
        } else {
          const start = new Date(year, 0, 1);
          const end = new Date(year, 11, 31, 23, 59, 59, 999);
          constraints.push(where('date', '>=', start));
          constraints.push(where('date', '<=', end));
        }
      }
      const q = fsQuery(collection(db, 'expenses'), ...constraints);
      const snap = await getDocs(q);
      const rows = snap.docs.map(d => ({ _id: d.id, ...d.data() }));

      // Categories aggregation
      const byCatMap = new Map();
      rows.forEach(r => {
        const key = r.category || 'Other';
        const prev = byCatMap.get(key) || { _id: key, total: 0, count: 0 };
        prev.total += Number(r.amount || 0);
        prev.count += 1;
        byCatMap.set(key, prev);
      });
      const categories = Array.from(byCatMap.values()).sort((a,b) => b.total - a.total);

      // Trends (if year provided)
      let trends = [];
      if (year) {
        const byMonth = new Map();
        rows.forEach(r => {
          const d = r.date instanceof Date ? r.date : new Date(r.date?.seconds ? r.date.seconds * 1000 : r.date);
          const m = d.getMonth()+1;
          const key = `${year}-${m}`;
          const prev = byMonth.get(key) || { _id: { year, month: m }, total: 0, count: 0 };
          prev.total += Number(r.amount || 0);
          prev.count += 1;
          byMonth.set(key, prev);
        });
        trends = Array.from(byMonth.values()).sort((a,b) => a._id.month - b._id.month);
      }

      dispatch({ type: 'SET_SUMMARY', payload: { categories, trends } });
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  // Categorize expense description
  const categorizeExpense = async (description) => {
    // Simple client-side heuristic since backend is removed
    const text = (description || '').toLowerCase();
    const pairs = [
      ['Food & Dining', ['restaurant','pizza','cafe','chipotle','starbucks']],
      ['Transportation', ['uber','lyft','shell','gas','metro']],
      ['Entertainment', ['movie','netflix','spotify','amc']],
      ['Shopping', ['amazon','walmart','target']],
      ['Healthcare', ['pharmacy','doctor','clinic']],
      ['Utilities', ['electric','water','utility','internet']],
      ['Housing', ['rent','mortgage','home']],
      ['Travel', ['airlines','hotel','delta','flight']],
    ];
    for (const [cat, words] of pairs) {
      if (words.some(w => text.includes(w))) return { category: cat, confidence: 0.7 };
    }
    return { category: 'Other', confidence: 0.3 };
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Remove duplicate initial fetch here; the `Expenses` page controls fetching
  // to avoid double requests and dependency loops.
  useEffect(() => {
    // Run subscription generator once per load
    runSubscriptionGenerator();
  }, []);

  const value = {
    ...state,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    addSubscription,
    cancelSubscription,
    runSubscriptionGenerator,
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