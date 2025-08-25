# Firebase Setup Guide

## Overview
This app now uses Firebase for both authentication and data storage, making it much simpler and more consistent.

## What Changed
- ✅ **Frontend**: Uses Firebase Firestore directly
- ✅ **Backend**: No longer needed (Firebase handles everything)
- ✅ **Authentication**: Firebase Auth with Google Sign-in
- ✅ **Database**: Firestore with real-time updates
- ✅ **Security**: Row-level security rules

## Benefits of This Approach
1. **Simpler Architecture**: One platform for everything
2. **Real-time Updates**: Changes appear instantly across devices
3. **Better Security**: Row-level security with Firestore rules
4. **Scalability**: Firebase handles scaling automatically
5. **Cost-effective**: Pay-per-use pricing

## Setup Steps

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `angelic-booster-467321-j7`
3. Go to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` and paste them
5. Click **Publish**

### 2. Security Rules
The rules ensure users can only access their own data:
```javascript
// Users can only read/write their own expenses and budgets
match /expenses/{expenseId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
}
```

### 3. Run the App
```bash
cd frontend
npm install
npm start
```

## How It Works Now

### Authentication Flow
1. User signs in with Google via Firebase Auth
2. Firebase provides a unique `uid` for the user
3. All data is tagged with this `uid`

### Data Flow
1. **Create**: Data is saved to Firestore with `userId` field
2. **Read**: Queries filter by `userId` to show only user's data
3. **Update**: Changes are saved to Firestore
4. **Delete**: Documents are removed from Firestore
5. **Real-time**: All connected clients get updates instantly

### Collections Structure
```
expenses/
  {expenseId}/
    userId: "user123"
    amount: 25.99
    category: "Food & Dining"
    merchant: "Starbucks"
    date: timestamp
    createdAt: timestamp
    updatedAt: timestamp

budgets/
  {budgetId}/
    userId: "user123"
    name: "Monthly Food Budget"
    type: "spending_limit"
    amount: 500
    currentAmount: 0
    category: "Food & Dining"
    isActive: true
    startDate: timestamp
    endDate: timestamp
    createdAt: timestamp
    updatedAt: timestamp
```

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check if user is signed in
2. **No Data**: Verify Firestore rules are published
3. **Real-time Not Working**: Check internet connection

### Debug Mode
Open browser console to see:
- Authentication state changes
- Firestore queries
- Real-time listener events

## Migration from Backend
- ✅ **Expenses**: Now stored in Firestore
- ✅ **Budgets**: Now stored in Firestore  
- ✅ **Authentication**: Firebase Auth
- ❌ **Backend API**: No longer needed
- ❌ **MongoDB**: No longer needed

## Next Steps
1. Test the app with the new Firebase setup
2. Add more features using Firebase services
3. Consider adding Firebase Analytics for insights
4. Set up Firebase Hosting for production deployment
