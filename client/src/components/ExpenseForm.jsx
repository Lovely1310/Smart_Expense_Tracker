import React, { useState } from 'react';
import axios from 'axios';

const ExpenseForm = ({ refreshData }) => {
  const [formData, setFormData] = useState({
    title: '', amount: '', category: 'Personal', companyName: 'Individual', description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend URL check karein (Codespace mein ye thoda badal sakta hai, but abhi localhost rakhein)
      await axios.post('http://localhost:5000/api/expenses/add', formData);
      alert("Expense Saved!");
      setFormData({ title: '', amount: '', category: 'Personal', companyName: 'Individual', description: '' });
      refreshData(); 
    } catch (err) {
      console.error(err);
      alert("Error saving expense");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">Add New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Title (e.g. Petrol)" 
          className="w-full p-2 border rounded"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
        <input 
          type="number" placeholder="Amount" 
          className="w-full p-2 border rounded"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          required
        />
        <select 
          className="w-full p-2 border rounded text-gray-600"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          <option value="Personal">Personal</option>
          <option value="TP Expense">TP Expense</option>
          <option value="Car Expense">Car Expense</option>
          <option value="Office Spending">Office Spending</option>
          <option value="SBI Spending">SBI Spending</option>
        </select>
        <input 
          type="text" placeholder="Entity (e.g. Deer Automobiles)" 
          className="w-full p-2 border rounded"
          value={formData.companyName}
          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
        />
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded font-bold hover:bg-indigo-700 transition">
          Save Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;