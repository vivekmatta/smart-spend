const express = require('express');
const router = express.Router();
const classifier = require('../ml/classifier');

// Categorize expense description
router.post('/', async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ 
        error: 'Description is required and must be a string' 
      });
    }

    if (!classifier.isTrained) {
      return res.status(503).json({ 
        error: 'ML model is not trained yet. Please train the model first.' 
      });
    }

    const result = classifier.classify(description);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ 
      error: 'Classification failed',
      message: error.message 
    });
  }
});

// Get model status
router.get('/status', (req, res) => {
  try {
    const status = classifier.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get model status',
      message: error.message 
    });
  }
});

// Batch categorize multiple descriptions
router.post('/batch', async (req, res) => {
  try {
    const { descriptions } = req.body;

    if (!Array.isArray(descriptions)) {
      return res.status(400).json({ 
        error: 'Descriptions must be an array' 
      });
    }

    if (!classifier.isTrained) {
      return res.status(503).json({ 
        error: 'ML model is not trained yet. Please train the model first.' 
      });
    }

    const results = descriptions.map(description => {
      try {
        return classifier.classify(description);
      } catch (error) {
        return {
          category: 'Other',
          confidence: 0,
          description: description,
          error: error.message
        };
      }
    });

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch classification error:', error);
    res.status(500).json({ 
      error: 'Batch classification failed',
      message: error.message 
    });
  }
});

module.exports = router;
