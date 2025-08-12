import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Receipt, 
  Plus, 
  Menu, 
  X, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Add Expense', href: '/add', icon: Plus },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">SmartSpend</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-xl">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">SmartSpend</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Sidebar footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <BarChart3 className="h-4 w-4" />
                <span>AI-Powered Insights</span>
              </div>
              {user ? (
                <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-danger-600 flex items-center">
                  <LogOut className="h-4 w-4 mr-1" /> Sign out
                </button>
              ) : (
                <Link to="/welcome" className="text-sm text-primary-600 hover:underline">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">Smart Analytics</span>
              </div>

              <div className="h-6 w-px bg-gray-200" />

              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-700">
                    {user.displayName || user.email}
                  </div>
                  <button onClick={handleSignOut} className="btn btn-ghost text-sm">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </button>
                </div>
              ) : (
                <Link to="/welcome" className="btn btn-primary text-sm">Sign in</Link>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
