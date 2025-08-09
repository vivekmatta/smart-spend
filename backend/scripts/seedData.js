const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const sampleData = require('../../sample-data.json');
require('dotenv').config();

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartspend', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Expense.deleteMany({});
    console.log('🗑️  Cleared existing expenses');

    // Insert sample data
    const expenses = sampleData.map(expense => ({
      ...expense,
      userId: 'default-user',
      date: new Date(expense.date)
    }));

    await Expense.insertMany(expenses);
    console.log(`✅ Inserted ${expenses.length} sample expenses`);

    // Verify the data
    const count = await Expense.countDocuments();
    console.log(`📊 Total expenses in database: ${count}`);

    // Show some sample data
    const sampleExpenses = await Expense.find().limit(5);
    console.log('\n📋 Sample expenses:');
    sampleExpenses.forEach(expense => {
      console.log(`  - ${expense.description} (${expense.category}): $${expense.amount}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
