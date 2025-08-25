import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Sample budget data
const sampleBudgets = [
  {
    name: 'Monthly Food Budget',
    type: 'spending_limit',
    category: 'Food & Dining',
    amount: 500,
    currentAmount: 0,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: true,
    description: 'Monthly budget for groceries and dining out',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Transportation Fund',
    type: 'spending_limit',
    category: 'Transportation',
    amount: 200,
    currentAmount: 0,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: true,
    description: 'Monthly budget for gas, rideshare, and public transport',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Vacation Savings',
    type: 'saving_goal',
    category: 'Travel',
    amount: 2000,
    currentAmount: 0,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    isActive: true,
    description: 'Save for summer vacation',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Emergency Fund',
    type: 'saving_goal',
    category: 'Other',
    amount: 5000,
    currentAmount: 0,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
    isActive: true,
    description: 'Emergency fund for unexpected expenses',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

export const seedFirestoreBudgets = async (userId) => {
  try {
    const budgetsCollection = collection(db, 'budgets');
    const promises = sampleBudgets.map(budget => 
      addDoc(budgetsCollection, {
        ...budget,
        userId
      })
    );
    
    await Promise.all(promises);
    console.log('Successfully seeded Firestore with sample budgets');
    return true;
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    return false;
  }
};

export const seedFirestoreExpenses = async (userId) => {
  try {
    const expensesCollection = collection(db, 'expenses');
    
    // Sample expenses data
    const sampleExpenses = [
      {
        description: 'Coffee at Starbucks',
        amount: 4.50,
        category: 'Food & Dining',
        merchant: 'Starbucks',
        date: new Date(),
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        description: 'Lunch at Chipotle',
        amount: 25.99,
        category: 'Food & Dining',
        merchant: 'Chipotle',
        date: new Date(),
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        description: 'Uber ride',
        amount: 15.00,
        category: 'Transportation',
        merchant: 'Uber',
        date: new Date(),
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    const promises = sampleExpenses.map(expense => 
      addDoc(expensesCollection, expense)
    );
    
    await Promise.all(promises);
    console.log('Successfully seeded Firestore with sample expenses');
    return true;
  } catch (error) {
    console.error('Error seeding Firestore expenses:', error);
    return false;
  }
};
