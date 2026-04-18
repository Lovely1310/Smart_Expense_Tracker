const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS Setup (Isse CORS error hamesha ke liye khatam)
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 2. Routes 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// 3. Health Check (Test link)
app.get('/', (req, res) => res.send("<h1>Backend is Live!</h1>"));

// 4. DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected!"))
    .catch(err => console.error("❌ DB Error:", err));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));