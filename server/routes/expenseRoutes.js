const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// 1. Naya Expense Add Karne ke liye (POST)
router.post('/add', async (req, res) => {
    try {
        const { title, amount, category, companyName, description } = req.body;
        const newExpense = new Expense({ title, amount, category, companyName, description });
        await newExpense.save();
        res.status(201).json({ message: "Expense added successfully!", newExpense });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Saare Expenses dekhne ke liye (GET)
router.get('/all', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 }); // Newest first
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;