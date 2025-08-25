# SmartSpend Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to fetch budgets" Error

**Problem**: You're seeing a red error notification saying "Failed to fetch budgets"

**Root Cause**: This error typically occurs due to one of these issues:
- No budget documents exist in Firestore
- Firestore security rules are blocking access
- Firebase configuration issues
- Authentication problems

**Solutions**:

#### Option A: Load Sample Data (Recommended)
1. Navigate to the Budgets page
2. Click the "Load Sample Data" button
3. This will create sample budget documents in your Firestore database

#### Option B: Check Firebase Configuration
1. Ensure your Firebase project is properly configured
2. Check that the Firebase config in `frontend/src/firebase.js` matches your project
3. Verify Firestore is enabled in your Firebase console

#### Option C: Check Security Rules
Your Firestore security rules should look like this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /budgets/{docId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Option D: Debug Firebase Connection
1. Use the "Test Firebase Connection" button on the Budgets page
2. Use the "Test Permissions" button to check Firestore access
3. Check browser console for detailed error messages

### 2. Authentication Issues

**Problem**: Users can't sign in or access protected routes

**Solutions**:
1. Ensure Google Sign-In is properly configured in Firebase
2. Check that the AuthContext is properly wrapping your app
3. Verify the user object exists before making Firestore queries

### 3. Data Not Loading

**Problem**: Pages show loading indefinitely or no data

**Solutions**:
1. Check if you're signed in (look for user info in the top right)
2. Verify Firestore collections exist (`budgets`, `expenses`)
3. Check browser console for JavaScript errors
4. Use the debug tools to test Firebase connectivity

### 4. Development vs Production

**Current Setup**: 
- Frontend: Firebase/Firestore
- Backend: MongoDB (not currently used by frontend)

**Recommendation**: 
- Use Firebase consistently for the frontend
- The backend MongoDB setup is separate and not integrated with the current frontend

## Quick Fix Steps

1. **Sign in** to the application
2. **Navigate to Budgets page**
3. **Click "Load Sample Data"** to create test budgets
4. **If that fails**, use the debug tools to identify the issue

## Debug Tools

The Budgets page includes several debug tools:
- **Test Firebase Connection**: Tests basic Firebase connectivity
- **Test Permissions**: Tests Firestore read/write permissions
- **Load Sample Data**: Creates sample budget documents
- **Error Display**: Shows detailed error messages with retry option

## Getting Help

If you continue to experience issues:
1. Check the browser console for error messages
2. Use the debug tools to identify the problem
3. Verify your Firebase project configuration
4. Check that Firestore security rules are properly set
