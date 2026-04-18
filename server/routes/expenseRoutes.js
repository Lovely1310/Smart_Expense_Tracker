const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// 1. Add Record
router.post('/add', async (req, res) => {
    try {
        const newRecord = new Expense(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Get All Records
router.get('/all', async (req, res) => {
    try {
        const data = await Expense.find().sort({ date: -1 });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Update (Gaadi Sold karne ke liye)
router.put('/update/:id', async (req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Delete
router.delete('/delete/:id', async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;