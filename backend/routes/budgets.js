const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// Get all budgets with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      category, 
      isActive, 
      page = 1, 
      limit = 20,
      sortBy = 'endDate',
      sortOrder = 'asc'
    } = req.query;

    const userId = req.user.uid; // Get from authenticated user
    const query = { userId };

    // Type and category filtering
    if (type) query.type = type;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    const budgets = await Budget.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Budget.countDocuments(query);

    res.json({
      budgets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budget summary (for dashboard)
router.get('/summary/dashboard', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get active budgets
    const activeBudgets = await Budget.find({ 
      userId, 
      isActive: true,
      endDate: { $gte: new Date() }
    }).lean();

    // Calculate summary statistics
    const totalBudgets = activeBudgets.length;
    const spendingLimits = activeBudgets.filter(b => b.type === 'spending_limit');
    const savingGoals = activeBudgets.filter(b => b.type === 'saving_goal');
    
    const totalSpendingBudget = spendingLimits.reduce((sum, b) => sum + b.amount, 0);
    const totalSpendingUsed = spendingLimits.reduce((sum, b) => sum + b.currentAmount, 0);
    const totalSavingGoal = savingGoals.reduce((sum, b) => sum + b.amount, 0);
    const totalSavingProgress = savingGoals.reduce((sum, b) => sum + b.currentAmount, 0);

    res.json({
      totalBudgets,
      spendingLimits: {
        count: spendingLimits.length,
        totalBudget: totalSpendingBudget,
        totalUsed: totalSpendingUsed,
        remaining: totalSpendingBudget - totalSpendingUsed
      },
      savingGoals: {
        count: savingGoals.length,
        totalGoal: totalSavingGoal,
        totalProgress: totalSavingProgress,
        remaining: totalSavingGoal - totalSavingProgress
      },
      activeBudgets
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get budget by ID
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new budget
router.post('/', async (req, res) => {
  try {
    const { name, type, amount, currentAmount, startDate, endDate, category, isActive } = req.body;
    
    const budget = new Budget({
      name,
      type,
      amount,
      currentAmount: currentAmount || 0,
      startDate: startDate || new Date(),
      endDate,
      category,
      isActive: isActive !== undefined ? isActive : true,
      userId: req.user.uid
    });

    const savedBudget = await budget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const { name, type, amount, currentAmount, startDate, endDate, category, isActive } = req.body;
    
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Update fields
    if (name !== undefined) budget.name = name;
    if (type !== undefined) budget.type = type;
    if (amount !== undefined) budget.amount = amount;
    if (currentAmount !== undefined) budget.currentAmount = currentAmount;
    if (startDate !== undefined) budget.startDate = startDate;
    if (endDate !== undefined) budget.endDate = endDate;
    if (category !== undefined) budget.category = category;
    if (isActive !== undefined) budget.isActive = isActive;

    const updatedBudget = await budget.save();
    res.json(updatedBudget);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
