import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBlvvfTZ5Ubu1jWnMwiNfzkedodmZyVBAc",
  authDomain: "angelic-booster-467321-j7.firebaseapp.com",
  projectId: "angelic-booster-467321-j7",
  storageBucket: "angelic-booster-467321-j7.firebasestorage.app",
  messagingSenderId: "305026065861",
  appId: "1:305026065861:web:618b189153bf72ba8597ac",
  measurementId: "G-25YCQ5C3B1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;
