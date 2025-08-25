import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read from a test collection
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('Firebase read test successful');
    
    // Try to write to a test collection
    const testDoc = await addDoc(testCollection, {
      test: true,
      timestamp: serverTimestamp()
    });
    console.log('Firebase write test successful, doc ID:', testDoc.id);
    
    return { success: true, message: 'Firebase connection successful' };
  } catch (error) {
    console.error('Firebase test failed:', error);
    return { 
      success: false, 
      message: error.message,
      code: error.code,
      details: error
    };
  }
};

export const testFirestorePermissions = async (userId) => {
  try {
    console.log('Testing Firestore permissions for user:', userId);
    
    // Test budgets collection access
    const budgetsCollection = collection(db, 'budgets');
    const budgetsSnapshot = await getDocs(budgetsCollection);
    console.log('Budgets collection access successful, count:', budgetsSnapshot.size);
    
    // Test creating a budget document
    const testBudget = await addDoc(budgetsCollection, {
      name: 'Test Budget',
      type: 'spending_limit',
      category: 'Other',
      amount: 100,
      currentAmount: 0,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Budget creation test successful, doc ID:', testBudget.id);
    
    return { success: true, message: 'Firestore permissions test successful' };
  } catch (error) {
    console.error('Firestore permissions test failed:', error);
    return { 
      success: false, 
      message: error.message,
      code: error.code,
      details: error
    };
  }
};
