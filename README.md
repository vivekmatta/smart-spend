# SmartSpend - AI-Powered Expense Tracker

A modern full-stack expense tracking application with machine learning-powered categorization. Built with React, Node.js, Express, MongoDB, and natural language processing.

## 🚀 Features

### Frontend (React + TailwindCSS)
- **Modern UI/UX**: Clean, responsive design with TailwindCSS
- **Dashboard**: Interactive charts and spending analytics
- **Expense Management**: Add, view, filter, and delete expenses
- **AI Categorization**: Real-time expense categorization with confidence scores
- **Filtering & Search**: Advanced filtering by date, category, and merchant
- **Pagination**: Efficient data loading with pagination
- **Real-time Updates**: Live data updates with toast notifications

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for expenses
- **MongoDB Integration**: Robust data persistence with Mongoose
- **ML-powered Categorization**: Naive Bayes classifier for automatic expense categorization
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Performance**: Compression, indexing, and efficient queries
- **Error Handling**: Comprehensive error handling and logging

### Machine Learning
- **Natural Language Processing**: Uses the `natural` library for text classification
- **Training Data**: 200+ categorized expense descriptions
- **Confidence Scoring**: Provides confidence levels for categorizations
- **Model Persistence**: Saves and loads trained models
- **Retraining Capability**: Easy model retraining with new data

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **React Router** - Navigation
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Natural** - NLP library
- **Helmet** - Security
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd smart-spend
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### 3. Environment Setup
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/smartspend
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
cd backend
npm run seed

# Train the ML model
npm run train-model
```

### 5. Start the application
```bash
# Start both frontend and backend (from root directory)
npm run dev

# Or start them separately:
# Backend: npm run server
# Frontend: npm run client
```

## 🎯 Usage

### Adding Expenses
1. Navigate to "Add Expense" page
2. Enter expense details (amount, description, merchant, date)
3. AI will automatically suggest a category based on the description
4. Review and adjust the category if needed
5. Save the expense

### Viewing Analytics
1. Dashboard shows spending overview with charts
2. Filter by month/year to see specific periods
3. View spending breakdown by category
4. Track monthly trends

### Managing Expenses
1. View all expenses in the "Expenses" page
2. Use filters to find specific transactions
3. Delete expenses as needed
4. Pagination for large datasets

## 🤖 Machine Learning

### How it Works
The application uses a Naive Bayes classifier trained on 200+ categorized expense descriptions. When you enter an expense description, the model:

1. Processes the text using natural language processing
2. Compares it against trained patterns
3. Returns the most likely category with a confidence score
4. Auto-fills the category if confidence is above 60%

### Training Data
The model is trained on diverse expense descriptions including:
- Food & Dining (restaurants, groceries, coffee shops)
- Transportation (Uber, gas, parking, public transit)
- Shopping (online retailers, department stores)
- Entertainment (streaming, movies, gym memberships)
- And many more categories...

### Retraining the Model
```bash
cd backend
npm run train-model
```

## 📊 API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses with filtering
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/categories` - Get spending by category
- `GET /api/expenses/summary/trends` - Get monthly trends

### Categorization
- `POST /api/categorize` - Categorize expense description
- `GET /api/categorize/status` - Get model status
- `POST /api/categorize/batch` - Batch categorize multiple descriptions

## 🎨 Customization

### Adding New Categories
1. Update the categories array in `backend/models/Expense.js`
2. Add training data in `backend/ml/trainingData.js`
3. Retrain the model

### Styling
- Modify `frontend/tailwind.config.js` for theme changes
- Update `frontend/src/index.css` for custom styles

### Database Schema
- Modify `backend/models/Expense.js` for schema changes
- Run database migrations if needed

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to Heroku, Vercel, or your preferred platform

### Frontend Deployment
1. Build the application: `cd frontend && npm run build`
2. Deploy the `build` folder to Netlify, Vercel, or your preferred platform
3. Update the API URL in the frontend configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**SmartSpend** - Making expense tracking smarter with AI! 🧠💰
