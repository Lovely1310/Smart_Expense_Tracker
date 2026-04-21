const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS CONFIGURATION
// Ise '*' rakhne se deployment mein errors nahi aate. 
// Agar aap specific banana chahti hain toh "*" ki jagah apni Vercel link ["https://your-link.vercel.app"] daal sakti hain.
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. MIDDLEWARE
app.use(express.json());

// 3. HEALTH CHECK ROUTE (Browser mein check karne ke liye)
app.get('/', (req, res) => {
    res.send("<h1>Expense Intelligence API is Live!</h1><p>Backend is working perfectly.</p>");
});

// 4. ROUTES REGISTRATION
// Ensure kijiye ki routes folder mein ye files sahi naam se hain
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// 5. DATABASE CONNECTION (Using Environment Variable)
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:");
        console.error(err.message);
    });

// 6. SERVER START
// Render apne aap PORT decide karta hai, isliye process.env.PORT zaroori hai
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/`);
});