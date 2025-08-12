import React, { useEffect, useState } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
// MUI X Charts
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
];

const Dashboard = () => {
  const { summary, fetchSummary, expenses } = useExpenses();
  // Persist month/year in localStorage so navigating away and back restores selection
  const readPersisted = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v ? parseInt(v, 10) : fallback;
    } catch {
      return fallback;
    }
  };
  const [selectedMonth, setSelectedMonth] = useState(() => readPersisted('dash_month', new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(() => readPersisted('dash_year', new Date().getFullYear()));
  const [isAllTime, setIsAllTime] = useState(false);
  const [prevSelection, setPrevSelection] = useState({ month: selectedMonth, year: selectedYear });

  useEffect(() => {
    if (isAllTime) {
      fetchSummary(null, undefined);
    } else {
      localStorage.setItem('dash_month', String(selectedMonth));
      localStorage.setItem('dash_year', String(selectedYear));
      fetchSummary(selectedMonth, selectedYear);
    }
  }, [isAllTime, selectedMonth, selectedYear, fetchSummary]);

  // Calculate total spending
  const totalSpending = summary.categories.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate average spending per transaction
  const totalTransactions = summary.categories.reduce((sum, item) => sum + item.count, 0);
  const avgPerTransaction = totalTransactions > 0 ? totalSpending / totalTransactions : 0;

  // Get top spending category
  const topCategory = summary.categories[0] || { _id: 'None', total: 0 };

  // Calculate month-over-month change (simplified)
  const currentMonthTotal = totalSpending;
  const previousMonthTotal = currentMonthTotal * 0.9; // Mock data
  const monthChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatMonth = (month) => {
    return format(new Date(2024, month - 1), 'MMMM');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your spending and get AI-powered insights
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input w-44"
            disabled={isAllTime}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input w-28"
            disabled={isAllTime}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {!isAllTime ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setPrevSelection({ month: selectedMonth, year: selectedYear });
                setIsAllTime(true);
              }}
            >
              All time
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="badge badge-primary">All time</span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setIsAllTime(false);
                  setSelectedMonth(prevSelection.month);
                  setSelectedYear(prevSelection.year);
                }}
                aria-label="Cancel all time"
                title="Cancel all time"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Total Spending</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpending)}</p>
              </div>
              <div className={`flex items-center text-sm ${
                monthChange >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {monthChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="ml-1">{Math.abs(monthChange).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Receipt className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Avg. per Transaction</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgPerTransaction)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Top Category</p>
                <p className="text-lg font-bold text-gray-900">{topCategory._id}</p>
                <p className="text-sm text-gray-500">{formatCurrency(topCategory.total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Category Bars (Selected Month or All Time) */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAllTime ? 'Spending by Category — All Time' : `Spending by Category — ${formatMonth(selectedMonth)} ${selectedYear}`}
            </h3>
          </div>
          <div className="card-body">
            {summary.categories.length > 0 ? (
              <div className="h-80">
                <BarChart
                  height={320}
                  xAxis={[{
                    scaleType: 'band',
                    data: summary.categories.map((c) => c._id),
                    colorMap: {
                      type: 'ordinal',
                      values: summary.categories.map((c) => c._id),
                      colors: summary.categories.map((_, i) => COLORS[i % COLORS.length])
                    }
                  }]}
                  series={[{
                    data: summary.categories.map((c) => c.total),
                    label: 'Total',
                  }]}
                  grid={{ vertical: true, horizontal: true }}
                >
                  <ChartsGrid />
                  <ChartsTooltip />
                </BarChart>
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="card-body">
          {expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.slice(0, 5).map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.merchant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-primary">{expense.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
