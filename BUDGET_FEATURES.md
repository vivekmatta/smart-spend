# Budget Features Documentation

## Overview
The SmartSpend application now includes comprehensive budget management features that allow users to create and track both spending limits and saving goals.

## Features

### 1. Budget Types

#### Spending Limits
- Set maximum amounts you can spend in specific categories
- Track current spending against your limit
- Visual progress bars with color-coded warnings
- Automatic alerts when approaching or exceeding limits

#### Saving Goals
- Set target amounts you want to save towards
- Track progress towards your savings target
- Visual progress indicators
- Celebrate when goals are achieved

### 2. Budget Management

#### Creating Budgets
- Navigate to `/add-budget` or click "Add Budget" from the Budgets page
- Choose between spending limit or saving goal
- Set budget name, amount, category, and time period
- Optionally set current amount (for existing progress)

#### Budget Properties
- **Name**: Descriptive name for your budget
- **Type**: Spending limit or saving goal
- **Amount**: Target amount (limit or goal)
- **Current Amount**: Current progress (spent or saved)
- **Category**: Budget category (Food & Dining, Transportation, etc.)
- **Start Date**: When the budget period begins
- **End Date**: When the budget period ends
- **Status**: Active or inactive

#### Budget Categories
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Healthcare
- Utilities
- Housing
- Education
- Travel
- Personal Care
- Insurance
- Investments
- Other

### 3. Dashboard Integration

#### Budget Summary Cards
- **Active Budgets**: Total number of active budgets
- **Spending Limits**: Remaining budget and usage summary
- **Saving Goals**: Progress summary and remaining amount

#### Active Budgets Section
- Visual progress bars for each active budget
- Color-coded progress indicators:
  - Green: On track
  - Yellow: Getting close (75%+)
  - Orange: Almost at limit (90%+)
  - Red: Over budget or goal achieved
- Quick overview of budget status and remaining time

### 4. Budgets Page

#### Features
- List all budgets with filtering options
- Filter by type, category, and status
- Pagination for large numbers of budgets
- Progress bars for each budget
- Edit and delete functionality
- Status indicators and progress text

#### Filtering Options
- **Type**: Spending limit or saving goal
- **Category**: Filter by specific categories
- **Status**: Active or inactive budgets

### 5. Progress Tracking

#### Visual Indicators
- Progress bars showing completion percentage
- Color-coded status indicators
- Progress text descriptions
- Remaining amount calculations

#### Smart Alerts
- Automatic progress calculations
- Visual warnings when approaching limits
- Celebration messages for achieved goals

## Usage Examples

### Example 1: Monthly Grocery Budget
- **Type**: Spending Limit
- **Amount**: $500
- **Category**: Food & Dining
- **Period**: January 1-31, 2024
- **Current**: $320 spent
- **Status**: 64% used, $180 remaining

### Example 2: Vacation Savings Goal
- **Type**: Saving Goal
- **Amount**: $2,000
- **Category**: Travel
- **Period**: January 1 - June 30, 2024
- **Current**: $1,200 saved
- **Status**: 60% complete, $800 to go

## API Endpoints

### Backend Routes
- `GET /api/budgets` - Get all budgets with filtering
- `GET /api/budgets/:id` - Get specific budget
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/summary/dashboard` - Get budget summary for dashboard

### Frontend Context
- `useBudgets()` hook provides access to all budget functionality
- Automatic data fetching and state management
- Real-time updates and error handling

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Seed Sample Data
```bash
node scripts/seedBudgets.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access Budget Features
- Navigate to `/budgets` to view all budgets
- Click "Add Budget" to create new budgets
- View budget summaries on the dashboard

## Technical Implementation

### Database Schema
- MongoDB with Mongoose ODM
- Virtual fields for calculated properties
- Indexed queries for performance
- User-based data isolation

### Frontend Architecture
- React with Context API for state management
- Responsive design with Tailwind CSS
- Real-time updates and optimistic UI
- Form validation and error handling

### Key Components
- `BudgetContext`: State management and API calls
- `Budgets`: Main budget listing page
- `AddBudget`: Budget creation form
- Dashboard integration with progress visualization

## Future Enhancements

### Planned Features
- Budget templates for common scenarios
- Recurring budgets (monthly, quarterly, yearly)
- Budget sharing and collaboration
- Advanced analytics and reporting
- Mobile app support
- Push notifications for budget alerts

### Integration Opportunities
- Connect with expense tracking for automatic progress updates
- AI-powered budget recommendations
- Integration with banking APIs for real-time updates
- Export functionality for financial planning tools

## Support and Troubleshooting

### Common Issues
1. **Budgets not showing**: Check if user is authenticated
2. **Progress bars not updating**: Verify current amount is set correctly
3. **Filter not working**: Ensure filter values match exact category names

### Debug Information
- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Confirm database connection and data exists

## Contributing

To contribute to the budget features:
1. Follow the existing code style and patterns
2. Add comprehensive tests for new functionality
3. Update documentation for any API changes
4. Ensure responsive design works on all screen sizes
5. Test with various budget scenarios and edge cases
