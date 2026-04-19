const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// 1. BULK ADD (Import ke liye zaroori)
router.post('/bulk-add', async (req, res) => {
    try {
        const records = await Expense.insertMany(req.body);
        res.status(201).json({ message: "Import Successful", count: records.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. ADD SINGLE
router.post('/add', async (req, res) => {
    try {
        const newRecord = new Expense(req.body);
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. GET ALL
router.get('/all', async (req, res) => {
    try {
        const data = await Expense.find().sort({ date: -1 });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. UPDATE (Sold logic)
router.put('/update/:id', async (req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json(err); }
});

// 5. DELETE SINGLE
router.delete('/delete/:id', async (req, res) => {
    try { await Expense.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); } catch (err) { res.status(500).json(err); }
});

// 6. CLEAR ALL
router.delete('/clear-all', async (req, res) => {
    try {
        await Expense.deleteMany({ category: req.query.category });
        res.json({ message: "Cleared" });
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;