const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  // Kis user ka expense hai
  userId: { type: String, required: true }, 
  
  title: { type: String, required: true }, // e.g., "Petrol", "Office Rent"
  amount: { type: Number, required: true },
  
  // Isse hum categories manage karenge (Deer Automobiles ya Personal)
  category: { 
    type: String, 
    required: true, 
    enum: ['TP Expense', 'Car Maintenance', 'Office', 'Personal', 'Other'] 
  }, 
  
  type: { type: String, enum: ['personal', 'business'], default: 'personal' }, 
  
  date: { type: Date, default: Date.now },
  description: String,
  
  // Specially for your requirement: Company identification
  companyName: { type: String, default: 'Individual' } 
});

module.exports = mongoose.model('Expense', ExpenseSchema);