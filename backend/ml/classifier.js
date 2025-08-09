const natural = require('natural');
const fs = require('fs');
const path = require('path');

class ExpenseClassifier {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.isTrained = false;
    this.modelPath = path.join(__dirname, 'trained-model.json');
    this.loadModel();
  }

  // Train the classifier with sample data
  train(trainingData) {
    console.log('🤖 Training expense classifier...');
    
    trainingData.forEach(item => {
      this.classifier.addDocument(item.description, item.category);
    });

    this.classifier.train();
    this.isTrained = true;
    this.saveModel();
    
    console.log('✅ Classifier trained successfully!');
    return this;
  }

  // Classify a new expense description
  classify(description) {
    if (!this.isTrained) {
      throw new Error('Classifier not trained. Please train the model first.');
    }

    const result = this.classifier.classify(description);
    const confidence = this.getConfidence(description);
    
    return {
      category: result,
      confidence: confidence,
      description: description
    };
  }

  // Get confidence score for classification
  getConfidence(description) {
    const classifications = this.classifier.getClassifications(description);
    const topResult = classifications[0];
    return topResult ? topResult.value : 0;
  }

  // Save trained model to file
  saveModel() {
    try {
      const modelData = JSON.stringify(this.classifier);
      fs.writeFileSync(this.modelPath, modelData);
      console.log('💾 Model saved successfully');
    } catch (error) {
      console.error('❌ Error saving model:', error);
    }
  }

  // Load trained model from file
  loadModel() {
    try {
      if (fs.existsSync(this.modelPath)) {
        const modelData = JSON.parse(fs.readFileSync(this.modelPath, 'utf8'));
        this.classifier = natural.BayesClassifier.restore(modelData);
        this.isTrained = true;
        console.log('📂 Model loaded successfully');
      }
    } catch (error) {
      console.log('📂 No saved model found, will train from scratch');
    }
  }

  // Get model status
  getStatus() {
    return {
      isTrained: this.isTrained,
      modelPath: this.modelPath,
      modelExists: fs.existsSync(this.modelPath)
    };
  }

  // Retrain with new data
  retrain(trainingData) {
    this.classifier = new natural.BayesClassifier();
    this.train(trainingData);
    return this;
  }
}

module.exports = new ExpenseClassifier();
