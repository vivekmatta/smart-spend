import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ExpenseProvider } from './contexts/ExpenseContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/Welcome';

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Layout>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
