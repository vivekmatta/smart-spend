const mongoose = require('mongoose');
const Budget = require('../models/Budget');
require('dotenv').config();

const sampleBudgets = [
  {
    name: 'Monthly Grocery Budget',
    type: 'spending_limit',
    amount: 500,
    currentAmount: 320,
    category: 'Food & Dining',
    startDate: new Date(2025, 7, 1), // August 1, 2025
    endDate: new Date(2025, 7, 31), // August 31, 2025
    isActive: true,
    userId: 'default-user'
  },
  {
    name: 'Vacation Savings',
    type: 'saving_goal',
    amount: 2000,
    currentAmount: 1200,
    category: 'Travel',
    startDate: new Date(2025, 7, 1), // August 1, 2025
    endDate: new Date(2025, 11, 30), // December 31, 2025
    isActive: true,
    userId: 'default-user'
  },
  {
    name: 'Entertainment Budget',
    type: 'spending_limit',
    amount: 200,
    currentAmount: 85,
    category: 'Entertainment',
    startDate: new Date(2025, 7, 1), // August 1, 2025
    endDate: new Date(2025, 7, 31), // August 31, 2025
    isActive: true,
    userId: 'default-user'
  },
  {
    name: 'Emergency Fund',
    type: 'saving_goal',
    amount: 5000,
    currentAmount: 3500,
    category: 'Other',
    startDate: new Date(2025, 7, 1), // August 1, 2025
    endDate: new Date(2025, 11, 31), // December 31, 2025
    isActive: true,
    userId: 'default-user'
  },
  {
    name: 'Transportation Budget',
    type: 'spending_limit',
    amount: 300,
    currentAmount: 180,
    category: 'Transportation',
    startDate: new Date(2025, 7, 1), // August 1, 2025
    endDate: new Date(2025, 7, 31), // August 31, 2025
    isActive: true,
    userId: 'default-user'
  },
  {
    name: 'Home Improvement Fund',
    type: 'saving_goal',
    amount: 3000,
    currentAmount: 800,
    category: 'Housing',
    startDate: new Date(2025, 7, 1), // August 1, 2025
    endDate: new Date(2025, 11, 30), // December 31, 2025
    isActive: true,
    userId: 'default-user'
  }
];

async function seedBudgets() {
  try {
    console.log('🌱 Starting budget database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartspend', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing budget data
    await Budget.deleteMany({});
    console.log('🗑️  Cleared existing budgets');

    // Insert sample budget data
    await Budget.insertMany(sampleBudgets);
    console.log(`✅ Inserted ${sampleBudgets.length} sample budgets`);

    // Verify the data
    const count = await Budget.countDocuments();
    console.log(`📊 Total budgets in database: ${count}`);

    // Show some sample data
    const sampleBudgetsData = await Budget.find().limit(5);
    console.log('\n📋 Sample budgets:');
    sampleBudgetsData.forEach(budget => {
      const progress = ((budget.currentAmount / budget.amount) * 100).toFixed(1);
      console.log(`  - ${budget.name} (${budget.type}): $${budget.currentAmount}/$${budget.amount} (${progress}%)`);
    });

    // Show summary statistics
    const spendingLimits = await Budget.find({ type: 'spending_limit' });
    const savingGoals = await Budget.find({ type: 'saving_goal' });
    
    console.log('\n📈 Budget Summary:');
    console.log(`  - Spending Limits: ${spendingLimits.length}`);
    console.log(`  - Saving Goals: ${savingGoals.length}`);
    
    if (spendingLimits.length > 0) {
      const totalSpendingBudget = spendingLimits.reduce((sum, b) => sum + b.amount, 0);
      const totalSpendingUsed = spendingLimits.reduce((sum, b) => sum + b.currentAmount, 0);
      console.log(`  - Total Spending Budget: $${totalSpendingBudget}`);
      console.log(`  - Total Spending Used: $${totalSpendingUsed}`);
      console.log(`  - Remaining: $${totalSpendingBudget - totalSpendingUsed}`);
    }
    
    if (savingGoals.length > 0) {
      const totalSavingGoal = savingGoals.reduce((sum, b) => sum + b.amount, 0);
      const totalSavingProgress = savingGoals.reduce((sum, b) => sum + b.currentAmount, 0);
      console.log(`  - Total Saving Goal: $${totalSavingGoal}`);
      console.log(`  - Total Saving Progress: $${totalSavingProgress}`);
      console.log(`  - Remaining: $${totalSavingGoal - totalSavingProgress}`);
    }

    console.log('\n🎉 Budget database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Budget seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedBudgets();
}

module.exports = seedBudgets;
