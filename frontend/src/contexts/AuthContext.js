import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  auth, 
  googleProvider 
} from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthContext: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 AuthContext: Auth state changed:', { 
        user: user?.uid, 
        email: user?.email,
        displayName: user?.displayName 
      });
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Attempting Google sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('🔐 Google sign-in successful:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('🔐 Error signing in with Google:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      console.log('🔐 Attempting email sign-up...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      console.log('🔐 Email sign-up successful:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('🔐 Error signing up with email:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      console.log('🔐 Attempting email sign-in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('🔐 Email sign-in successful:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('🔐 Error signing in with email:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      console.log('🔐 Signing out...');
      await signOut(auth);
      console.log('🔐 Sign-out successful');
    } catch (error) {
      console.error('🔐 Error signing out:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut: signOutUser,
  }), [user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOutUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 