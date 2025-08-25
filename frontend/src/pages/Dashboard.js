import React, { useEffect, useState } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import { useBudgets } from '../contexts/BudgetContext';
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
  ArrowDownRight,
  Target,
  AlertTriangle,
  Clock,
  Repeat
} from 'lucide-react';
import { format } from 'date-fns';

// Helper function to safely convert Firebase Timestamps to Date objects
const safeFormatDate = (dateValue, formatString = 'MMM dd, yyyy') => {
  try {
    let date;
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      // Firebase Timestamp
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      // Already a Date object
      date = dateValue;
    } else if (dateValue) {
      // String or number, try to create Date
      date = new Date(dateValue);
    } else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error, dateValue);
    return 'Invalid date';
  }
};

// Helper function to check if subscription is overdue
const isSubscriptionOverdue = (nextDueDate) => {
  if (!nextDueDate) return false;
  const dueDate = nextDueDate.toDate ? nextDueDate.toDate() : new Date(nextDueDate);
  return dueDate < new Date();
};

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
];

const Dashboard = () => {
  const { summary, fetchSummary, expenses } = useExpenses();
  const { summary: budgetSummary, fetchSummary: fetchBudgetSummary } = useBudgets();
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
    fetchBudgetSummary();
  }, [isAllTime, selectedMonth, selectedYear, fetchSummary, fetchBudgetSummary]);

  // Calculate total spending
  const totalSpending = summary && summary.categories ? summary.categories.reduce((sum, item) => sum + (item.total || 0), 0) : 0;
  
  // Calculate average spending per transaction
  const totalTransactions = summary && summary.categories ? summary.categories.reduce((sum, item) => sum + (item.count || 0), 0) : 0;
  const avgPerTransaction = totalTransactions > 0 ? totalSpending / totalTransactions : 0;

  // Get top spending category
  const topCategory = summary && summary.categories && summary.categories.length > 0 ? summary.categories[0] : { _id: 'None', total: 0 };

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

        {/* Subscription Summary Card */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Repeat className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expenses ? expenses.filter(e => e.isSubscription).length : 0}
                </p>
                <p className="text-sm text-gray-500">
                  {(() => {
                    if (!expenses) return 'Loading...';
                    const overdueCount = expenses.filter(e => e.isSubscription && isSubscriptionOverdue(e.nextDueDate)).length;
                    return overdueCount > 0 ? `${overdueCount} overdue` : 'All up to date';
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Summary Cards */}
      {budgetSummary && budgetSummary.totalBudgets > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Active Budgets</p>
                  <p className="text-2xl font-bold text-gray-900">{budgetSummary.totalBudgets}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Budget Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(budgetSummary.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(budgetSummary.totalCurrentAmount)} used
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Active Budgets</p>
                  <p className="text-lg font-bold text-gray-900">
                    {budgetSummary.activeBudgetsCount}
                  </p>
                  <p className="text-sm text-gray-500">
                    of {budgetSummary.totalBudgets} total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Summary */}
      {expenses && expenses.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">📅 Subscriptions Overview</h3>
          </div>
          <div className="card-body">
            {(() => {
              const subscriptions = expenses.filter(expense => expense.isSubscription);
              
              if (subscriptions.length === 0) {
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No subscriptions found</p>
                  </div>
                );
              }

              // Separate overdue and upcoming subscriptions
              const now = new Date();
              const overdueSubscriptions = subscriptions
                .filter(sub => {
                  const nextDue = sub.nextDueDate?.toDate ? sub.nextDueDate.toDate() : new Date(sub.nextDueDate);
                  return nextDue < now;
                })
                .sort((a, b) => {
                  const aDate = a.nextDueDate?.toDate ? a.nextDueDate.toDate() : new Date(a.nextDueDate);
                  const bDate = b.nextDueDate?.toDate ? b.nextDueDate.toDate() : new Date(b.nextDueDate);
                  return aDate - bDate;
                });

              const upcomingSubscriptions = subscriptions
                .filter(sub => {
                  const nextDue = sub.nextDueDate?.toDate ? sub.nextDueDate.toDate() : new Date(sub.nextDueDate);
                  return nextDue >= now;
                })
                .sort((a, b) => {
                  const aDate = a.nextDueDate?.toDate ? a.nextDueDate.toDate() : new Date(a.nextDueDate);
                  const bDate = b.nextDueDate?.toDate ? b.nextDueDate.toDate() : new Date(b.nextDueDate);
                  return aDate - bDate;
                })
                .slice(0, 5);

              return (
                <div className="space-y-6">
                  {/* Overdue Subscriptions */}
                  {overdueSubscriptions.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-red-800 mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Overdue Subscriptions ({overdueSubscriptions.length})
                      </h4>
                      <div className="space-y-3">
                        {overdueSubscriptions.map((subscription) => {
                          const nextDue = subscription.nextDueDate?.toDate ? subscription.nextDueDate.toDate() : new Date(subscription.nextDueDate);
                          const daysOverdue = Math.ceil((now - nextDue) / (1000 * 60 * 60 * 24));

                          return (
                            <div key={subscription.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <DollarSign className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{subscription.description}</p>
                                  <p className="text-sm text-gray-500">{subscription.merchant}</p>
                                  <p className="text-xs text-red-600">
                                    {subscription.subscriptionFrequency} • Due {safeFormatDate(subscription.nextDueDate)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{formatCurrency(subscription.amount)}</p>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Subscriptions */}
                  {upcomingSubscriptions.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-blue-800 mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Upcoming Subscriptions ({upcomingSubscriptions.length})
                      </h4>
                      <div className="space-y-3">
                        {upcomingSubscriptions.map((subscription) => {
                          const nextDue = subscription.nextDueDate?.toDate ? subscription.nextDueDate.toDate() : new Date(subscription.nextDueDate);
                          const daysUntilDue = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
                          const isDueSoon = daysUntilDue <= 7;

                          return (
                            <div key={subscription.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{subscription.description}</p>
                                  <p className="text-sm text-gray-500">{subscription.merchant}</p>
                                  <p className="text-xs text-blue-600">
                                    {subscription.subscriptionFrequency} • Due {safeFormatDate(subscription.nextDueDate)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{formatCurrency(subscription.amount)}</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isDueSoon 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {isDueSoon 
                                    ? `Due in ${daysUntilDue} days` 
                                    : `${daysUntilDue} days left`
                                  }
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No Upcoming Subscriptions Message */}
                  {upcomingSubscriptions.length === 0 && overdueSubscriptions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No active subscriptions found</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

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
            {summary.categories && summary.categories.length > 0 ? (
              (() => {
                try {
                  // Validate and clean the data
                  const validCategories = summary.categories.filter(c => 
                    c && c._id && typeof c.total === 'number' && !isNaN(c.total)
                  );
                  
                  if (validCategories.length === 0) {
                    return (
                      <div className="flex h-80 items-center justify-center">
                        <p className="text-gray-500">No valid data available for chart</p>
                      </div>
                    );
                  }

                  return (
                    <div className="h-80">
                      {/* Try MUI X Charts first */}
                      {(() => {
                        try {
                          return (
                            <BarChart
                              height={320}
                              xAxis={[{
                                scaleType: 'band',
                                data: validCategories.map((c) => c._id),
                                colorMap: {
                                  type: 'ordinal',
                                  values: validCategories.map((c) => c._id),
                                  colors: validCategories.map((_, i) => COLORS[i % COLORS.length])
                                }
                              }]}
                              series={[{
                                data: validCategories.map((c) => c.total),
                                label: 'Total',
                              }]}
                              grid={{ vertical: true, horizontal: true }}
                              slotProps={{
                                legend: {
                                  hidden: true,
                                },
                              }}
                              tooltip={{
                                trigger: 'item',
                                formatter: (params) => {
                                  if (!params || !params.value) return '';
                                  return `${params.name}: ${formatCurrency(params.value)}`;
                                }
                              }}
                            >
                              <ChartsGrid />
                              <ChartsTooltip />
                            </BarChart>
                          );
                        } catch (chartError) {
                          console.warn('MUI X Charts failed, using fallback:', chartError);
                          // Fallback to simple HTML chart
                          return (
                            <div className="h-full flex flex-col justify-center">
                              <div className="text-center mb-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Spending by Category</h4>
                                <p className="text-sm text-gray-500">Chart temporarily unavailable</p>
                              </div>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {validCategories.map((category, index) => (
                                  <div key={category._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div 
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                      ></div>
                                      <span className="font-medium text-gray-900">{category._id}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{formatCurrency(category.total)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  );
                } catch (error) {
                  console.error('Error rendering chart:', error);
                  return (
                    <div className="flex h-80 items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 mb-2">Chart could not be rendered</p>
                        <p className="text-sm text-gray-400">Please try refreshing the page</p>
                      </div>
                    </div>
                  );
                }
              })()
            ) : summary && summary.categories ? (
              <div className="flex h-80 items-center justify-center">
                <p className="text-gray-500">No data available</p>
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-500">Loading chart data...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Budgets */}
      {budgetSummary && budgetSummary.activeBudgets && budgetSummary.activeBudgets.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Active Budgets</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {budgetSummary.activeBudgets.slice(0, 5).map((budget) => {
                const progressPercentage = budget.progressPercentage || 0;
                const progressColor = progressPercentage >= 100 ? 'bg-red-500' : 
                                   progressPercentage >= 90 ? 'bg-orange-500' : 
                                   progressPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500';
                
                return (
                  <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {budget.type === 'spending_limit' ? (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Target className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{budget.name}</h4>
                          <p className="text-sm text-gray-500">{budget.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(budget.currentAmount || 0)} / {formatCurrency(budget.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {budget.type === 'spending_limit' ? 'Spending Limit' : 'Saving Goal'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Ends {safeFormatDate(budget.endDate)}</span>
                      <span>
                        {budget.type === 'spending_limit' 
                          ? `${budget.remainingAmount ? formatCurrency(budget.remainingAmount) : '0'} left`
                          : `${budget.remainingAmount ? formatCurrency(budget.remainingAmount) : '0'} to go`
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="card-body">
          {expenses && expenses.length > 0 ? (
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
                    <tr key={expense.id} className="hover:bg-gray-50">
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
                        {safeFormatDate(expense.date)}
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
