import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ExpenseProvider } from './contexts/ExpenseContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';

function App() {
  return (
    <ExpenseProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/add" element={<AddExpense />} />
        </Routes>
      </Layout>
    </ExpenseProvider>
  );
}

export default App;
