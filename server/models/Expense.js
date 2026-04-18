const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: String,
  regNo: String,
  carDetails: String,
  credit: { type: Number, default: 0 },
  debit: { type: Number, default: 0 },
  paidBy: String,
  description: String,
  category: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);