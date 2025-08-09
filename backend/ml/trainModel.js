const mongoose = require('mongoose');
const classifier = require('./classifier');
const trainingData = require('./trainingData');
require('dotenv').config();

async function trainModel() {
  try {
    console.log('🚀 Starting ML model training...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartspend', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Train the classifier with sample data
    classifier.train(trainingData);
    
    console.log('🎯 Training completed successfully!');
    console.log('📊 Model status:', classifier.getStatus());
    
    // Test the model with a few examples
    console.log('\n🧪 Testing the model:');
    const testExamples = [
      'Starbucks coffee',
      'Uber ride to airport',
      'Amazon purchase',
      'Netflix subscription',
      'Grocery shopping at Walmart'
    ];
    
    testExamples.forEach(example => {
      const result = classifier.classify(example);
      console.log(`"${example}" → ${result.category} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Training failed:', error);
    process.exit(1);
  }
}

// Run training if this script is executed directly
if (require.main === module) {
  trainModel();
}

module.exports = trainModel;
